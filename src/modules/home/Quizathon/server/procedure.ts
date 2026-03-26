// @/modules/home/Quizathon/server/procedure.ts
import { db } from "@/db";
import { quizzes, users, participants } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const quizRouter = createTRPCRouter({
  removeParticipant: protectedProcedure
    .input(z.object({ 
      quizId: z.string(), 
      participantClerkId: z.string() 
    }))
    .mutation(async ({ ctx, input }) => {
      // 1. Check if the current user is the owner of the quiz
      const quiz = await ctx.db.query.quizzes.findFirst({
        where: (quizzes, { eq, and }) => and(
          eq(quizzes.id, input.quizId),
          eq(quizzes.clerkId, ctx.clerkUserId!) 
        ),
      });

      if (!quiz) {
        throw new TRPCError({ 
          code: "UNAUTHORIZED", 
          message: "You are not the host of this mission." 
        });
      }

      // 2. Remove the participant
      return await ctx.db
        .delete(participants)
        .where(
          and(
            eq(participants.quizId, input.quizId),
            eq(participants.clerkId, input.participantClerkId)
          )
        );
    }),

  join: protectedProcedure
    .input(z.object({ quizId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const clerkId = ctx.clerkUserId!; 

      const existing = await ctx.db.query.participants.findFirst({
        where: (participants, { and, eq }) => and(
          eq(participants.quizId, input.quizId),
          eq(participants.clerkId, clerkId)
        ),
      });

      if (existing) {
        throw new TRPCError({ 
          code: "CONFLICT", 
          message: "You have already registered for this mission." 
        });
      }

      await ctx.db.insert(participants).values({
        quizId: input.quizId,
        clerkId: clerkId,
      });

      return { success: true };
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.quizzes.findFirst({
        where: (quizzes, { eq }) => eq(quizzes.id, input.id),
        with: {
          participants: {
            with: {
              user: true, 
            },
          },
        },
      });

      if (!result) {
        throw new TRPCError({ 
          code: "NOT_FOUND", 
          message: "This quiz mission does not exist." 
        });
      }

      return result;
    }),

  getAllQuizzes: protectedProcedure.query(async () => {
    return await db
      .select()
      .from(quizzes)
      .orderBy(desc(quizzes.createdAt))
      .limit(10);
  }),

  getMyQuizzes: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.clerkId, ctx.clerkUserId!))
      .orderBy(desc(quizzes.createdAt));
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

      // 1. Get user profile
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.clerkId, userId),
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User profile not found." });
      }

      // 2. Check Balance
      if (user.points < input.points) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: `Insufficient points! You need ${input.points} but have ${user.points}.` 
        });
      }

      // 3. Deduct Points
      const originalPoints = user.points;
      await ctx.db.update(users)
        .set({ points: originalPoints - input.points })
        .where(eq(users.clerkId, userId));

      try {
        // 4. Create Quiz
        const [newQuiz] = await ctx.db.insert(quizzes)
          .values({
            clerkId: userId,
            title: input.title,
            category: input.category,
            date: input.date,
            time: input.time,
            points: input.points,
            updatedAt: new Date(),
          })
          .returning();

        // 5. Add creator as first participant
        await ctx.db.insert(participants).values({
          quizId: newQuiz.id,
          clerkId: userId,
        });

        return newQuiz;

      } catch (error) {
        // MANUAL ROLLBACK: Since neon-http doesn't support transactions, 
        // we manually refund the points if any step above fails.
        console.error("FAILED_TO_CREATE_QUIZ_REFUNDING_POINTS:", error);
        
        await ctx.db.update(users)
          .set({ points: originalPoints })
          .where(eq(users.clerkId, userId));

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not launch quiz. Your points have been refunded.",
        });
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [deletedQuiz] = await db
        .delete(quizzes)
        .where(
          and(
            eq(quizzes.id, input.id),
            eq(quizzes.clerkId, ctx.clerkUserId!)
          )
        )
        .returning();

      return deletedQuiz;
    }),
});