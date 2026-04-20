import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { questions, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

/**
 * Extracts the file key from an UploadThing URL.
 */
const getFileKey = (url: string | null | undefined) => {
  if (!url || typeof url !== "string") return null;
  if (url.includes("/f/")) return url.split("/f/")[1];
  return url.split("/").pop() ?? null;
};

export const curriculumRouter = createTRPCRouter({
  /**
   * Fetches all questions for a specific class and type.
   */
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

  /**
   * Deletes a single image from UploadThing storage immediately.
   */
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

  /**
   * Saves questions sequentially (No Transaction for Neon-HTTP support).
   */
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
      // 1. Auth & Admin Check
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

      // 2. Storage Cleanup Logic
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

      // 3. Database Operations (Sequential for HTTP Driver Support)
     try {
        // A. Remove existing set
        await ctx.db.delete(questions).where(
          and(
            eq(questions.classId, input.classId),
            eq(questions.type, input.type)
          )
        );

        // B. Insert new set
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
        // We cast to a specific structure to avoid the 'any' warning
        const error = dbError as { message?: string; detail?: string; code?: string };
        
        console.error("--- DATABASE UPDATE FAILED ---");
        console.error("Message:", error.message);
        console.error("Detail:", error.detail);
        console.error("------------------------------");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.detail || error.message || "Failed to update questions.",
        });
      }
    }),
});