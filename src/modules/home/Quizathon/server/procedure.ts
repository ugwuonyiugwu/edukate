// @/modules/home/Quizathon/server/procedure.ts
import { db } from "@/db";
import { quizzes, users, participants, submissions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const quizRouter = createTRPCRouter({
  removeParticipant: protectedProcedure
    .input(z.object({ 
      quizId: z.string(), 
      participantClerkId: z.string() 
    }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await ctx.db.query.quizzes.findFirst({
        where: (quizzes, { eq, and }) => and(
          eq(quizzes.id, input.quizId),
          eq(quizzes.clerkId, ctx.clerkUserId!) 
        ),
      });

      if (!quiz) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not the host." });

      // 1. Refund the kicked user
      await ctx.db.update(users)
        .set({ points: sql`${users.points} + ${quiz.points}` })
        .where(eq(users.clerkId, input.participantClerkId));

      // 2. Remove record
      await ctx.db.delete(participants)
        .where(and(eq(participants.quizId, input.quizId), eq(participants.clerkId, input.participantClerkId)));

      return { success: true, refunded: quiz.points };
    }),

  join: protectedProcedure
    .input(z.object({ quizId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const clerkId = ctx.clerkUserId!; 

      const quiz = await ctx.db.query.quizzes.findFirst({
        where: eq(quizzes.id, input.quizId),
      });
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.clerkId, clerkId),
      });

      if (!quiz || !user) throw new TRPCError({ code: "NOT_FOUND" });
      if (user.points < quiz.points) throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient points." });

      const existing = await ctx.db.query.participants.findFirst({
        where: and(eq(participants.quizId, input.quizId), eq(participants.clerkId, clerkId)),
      });
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Already registered." });

      // 1. Deduct points first
      await ctx.db.update(users)
        .set({ points: sql`${users.points} - ${quiz.points}` })
        .where(eq(users.clerkId, clerkId));

      // 2. Add to roster
      await ctx.db.insert(participants).values({
        quizId: input.quizId,
        clerkId: clerkId,
      });

      return { success: true };
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      category: z.string().min(1),
      date: z.string(),
      time: z.string(),
      points: z.number().min(0),
      description: z.string().nullish(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.clerkUserId!;
      const user = await ctx.db.query.users.findFirst({ where: eq(users.clerkId, userId) });

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      if (user.points < input.points) throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient points." });

      // 1. Deduct points using SQL math
      await ctx.db.update(users)
        .set({ points: sql`${users.points} - ${input.points}` })
        .where(eq(users.clerkId, userId));

      try {
        const [newQuiz] = await ctx.db.insert(quizzes).values({
          clerkId: userId,
          title: input.title,
          category: input.category,
          date: input.date,
          time: input.time,
          points: input.points,
          updatedAt: new Date(),
        }).returning();

        // Host joins for free (points already deducted as creation cost)
        await ctx.db.insert(participants).values({ quizId: newQuiz.id, clerkId: userId });
        return newQuiz;

      } catch (_) {
        await ctx.db.update(users)
          .set({ points: sql`${users.points} + ${input.points}` })
          .where(eq(users.clerkId, userId));
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to launch."});
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await ctx.db.query.quizzes.findFirst({
        where: and(eq(quizzes.id, input.id), eq(quizzes.clerkId, ctx.clerkUserId!))
      });

      if (!quiz) throw new TRPCError({ code: "UNAUTHORIZED" });

      const [deletedQuiz] = await ctx.db.delete(quizzes)
        .where(eq(quizzes.id, input.id))
        .returning();

      await ctx.db.update(users)
        .set({ points: sql`${users.points} + ${quiz.points}` })
        .where(eq(users.clerkId, ctx.clerkUserId!));

      return deletedQuiz;
    }),

  // --- QUERY PROCEDURES ---
  getParticipants: protectedProcedure
    .input(z.object({ quizId: z.string() }))
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.query.participants.findMany({
        where: eq(participants.quizId, input.quizId),
        with: { user: true },
      });
      return data.map((p) => ({
        clerkId: p.clerkId,
        name: p.user?.username ?? p.user?.firstName ?? "Anonymous User",
        joinedAt: p.joinedAt,
      }));
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.quizzes.findFirst({
        where: eq(quizzes.id, input.id),
        with: { participants: { with: { user: true } } },
      });
      if (!result) throw new TRPCError({ code: "NOT_FOUND" });
      return result;
    }),

  getAllQuizzes: protectedProcedure.query(async () => {
    return await db.select().from(quizzes).orderBy(desc(quizzes.createdAt)).limit(10);
  }),

  getMyQuizzes: protectedProcedure.query(async ({ ctx }) => {
    return await db.select().from(quizzes).where(eq(quizzes.clerkId, ctx.clerkUserId!)).orderBy(desc(quizzes.createdAt));
  }),

  getServerTime: protectedProcedure.query(() => ({ serverTime: Date.now() })),

  // --- SUBMISSION PROCEDURES ---
  getUserSubmissionCount: protectedProcedure
    .input(z.object({ quizId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({ value: count() })
        .from(submissions)
        .where(
          and(
            eq(submissions.quizId, input.quizId),
            eq(submissions.clerkId, ctx.clerkUserId!)
          )
        );
      return result[0]?.value ?? 0;
    }),

  submitWork: protectedProcedure
    .input(z.object({
      quizId: z.string(),
      questionText: z.string().min(5),
      imageUrl: z.string().optional(),
      correctAnswer: z.string().min(1),
      wrongAnswer1: z.string().min(1),
      wrongAnswer2: z.string().min(1),
      wrongAnswer3: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // 1. Count existing submissions for this user/quiz
      const existing = await ctx.db
        .select({ count: count() })
        .from(submissions)
        .where(
          and(
            eq(submissions.quizId, input.quizId),
            eq(submissions.clerkId, ctx.clerkUserId!)
          )
        );

      if (existing[0].count >= 20) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Mission limit reached: You have already submitted 20 questions for this mission." 
        });
      }

      // 2. Insert the new question
      return await ctx.db.insert(submissions).values({
        quizId: input.quizId,
        clerkId: ctx.clerkUserId!,
        questionText: input.questionText,
        imageUrl: input.imageUrl,
        correctAnswer: input.correctAnswer,
        wrongAnswer1: input.wrongAnswer1,
        wrongAnswer2: input.wrongAnswer2,
        wrongAnswer3: input.wrongAnswer3,
      });
    }),
});