import { z } from "zod";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { questions, users, examResults } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

const getFileKey = (url: string | null | undefined) => {
  if (!url || typeof url !== "string") return null;
  if (url.includes("/f/")) return url.split("/f/")[1];
  return url.split("/").pop() ?? null;
};

// Define an interface for the DB error to avoid 'any'
interface DrizzleError {
  message?: string;
  detail?: string;
  code?: string;
}

export const curriculumRouter = createTRPCRouter({
  // Existing procedures
  getQuestions: protectedProcedure
    .input(z.object({ 
      classId: z.string(), 
      type: z.enum(["CLASSWORK", "TEST"]) 
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.select().from(questions).where(
        and(
          eq(questions.classId, input.classId), 
          eq(questions.type, input.type)
        )
      );
    }),

  getByClassId: baseProcedure 
    .input(z.object({ classId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.questions.findMany({
        where: eq(questions.classId, input.classId),
      });
    }),

  // Check if exam was already taken
  getExistingResult: protectedProcedure
    .input(z.object({ classId: z.string() }))
    .query(async ({ ctx, input }) => {
      const clerkId = ctx.clerkUserId;
      if (!clerkId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const result = await ctx.db
        .select()
        .from(examResults)
        .where(
          and(
            eq(examResults.clerkId, clerkId),
            eq(examResults.classId, input.classId)
          )
        )
        .limit(1);
      
      return result[0] || null;
    }),

  // Submit Exam Result
  submitExam: protectedProcedure
    .input(z.object({ 
      classId: z.string(), 
      score: z.number(), 
      total: z.number() 
    }))
    .mutation(async ({ ctx, input }) => {
      const clerkId = ctx.clerkUserId;
      if (!clerkId) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        await ctx.db.insert(examResults).values({
          clerkId: clerkId,
          classId: input.classId,
          score: input.score,
          total: input.total,
        });
        return { success: true };
      } catch  {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Exam result already exists for this user.",
        });
      }
    }),

  deleteImage: protectedProcedure
    .input(z.object({ url: z.string() }))
    .mutation(async ({ input }) => {
      const fileKey = getFileKey(input.url);
      if (fileKey) {
        try {
          await utapi.deleteFiles([fileKey]);
          return { success: true };
        } catch (error) {
          console.error("Single File Cleanup Error:", error);
          return { success: false };
        }
      }
      return { success: false };
    }),
    
  saveQuestions: protectedProcedure
    .input(z.object({
      classId: z.string(),
      type: z.enum(["CLASSWORK", "TEST"]),
      questions: z.array(z.object({
        text: z.string().min(1, "Question text is required"),
        imageUrl: z.string().optional().nullable(),
        options: z.array(z.string()).length(4, "Must provide exactly 4 options"),
        correctAnswer: z.number().min(0).max(3),
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      const clerkId = ctx.clerkUserId;
      if (!clerkId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const user = await ctx.db.query.users.findFirst({ 
        where: eq(users.clerkId, clerkId) 
      });

      if (!user || user.role !== "admin") {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Only administrators can modify the curriculum." 
        });
      }

      const existingEntries = await ctx.db
        .select({ imageUrl: questions.imageUrl })
        .from(questions)
        .where(
          and(
            eq(questions.classId, input.classId),
            eq(questions.type, input.type)
          )
        );

      const oldUrls = existingEntries.map(e => e.imageUrl).filter(Boolean) as string[];
      const newUrls = new Set(input.questions.map(q => q.imageUrl).filter(Boolean));
      const keysToDelete = oldUrls
        .filter(url => !newUrls.has(url))
        .map(url => getFileKey(url))
        .filter((k): k is string => !!k);

      if (keysToDelete.length > 0) {
        try {
          await utapi.deleteFiles(keysToDelete);
        } catch (error) {
          console.error("Bulk Cleanup Error:", error);
        }
      }

      try {
        await ctx.db.delete(questions).where(
          and(
            eq(questions.classId, input.classId),
            eq(questions.type, input.type)
          )
        );

        if (input.questions.length > 0) {
          await ctx.db.insert(questions).values(
            input.questions.map((q) => ({
              classId: input.classId,
              type: input.type,
              text: q.text,
              imageUrl: q.imageUrl ?? null,
              options: q.options,
              correctAnswer: q.correctAnswer,
            }))
          );
        }

        return { success: true, count: input.questions.length };
      } catch (dbError: unknown) {
        const error = dbError as DrizzleError;
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.detail || error.message || "Failed to update questions.",
        });
      }
    }),
});