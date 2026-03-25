// @/modules/home/Quizzes/server/quizzes.ts
import { db } from "@/db";
import { quizzes } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const quizRouter = createTRPCRouter({
  getMyQuizzes: protectedProcedure.query(async ({ ctx }) => {
    // FIX: Guard against null and provide a clear check for TypeScript
    if (!ctx.clerkUserId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.clerkId, ctx.clerkUserId)) // TS now knows this is a string
      .orderBy(desc(quizzes.createdAt));
  }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      category: z.string().min(1),
      date: z.string(),
      time: z.string(),
      points: z.number(),
      description: z.string().nullish(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.clerkUserId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const [newQuiz] = await db
        .insert(quizzes)
        .values({
          ...input,
          clerkId: ctx.clerkUserId, // clerkUserId is guaranteed string here
          updatedAt: new Date(),
        })
        .returning();

      return newQuiz;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // FIX: Standardize the check to satisfy Overload 1
      const userId = ctx.clerkUserId;
      
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const [deletedQuiz] = await db
        .delete(quizzes)
        .where(
          and(
            eq(quizzes.id, input.id),
            eq(quizzes.clerkId, userId) // Use the local 'userId' variable
          )
        )
        .returning();

      if (!deletedQuiz) {
        throw new TRPCError({ 
            code: "NOT_FOUND", 
            message: "Quiz not found or unauthorized" 
        });
      }

      return deletedQuiz;
    }),
});