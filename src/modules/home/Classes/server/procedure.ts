import { z } from "zod";
import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/trpc/init";
import { classes, classEnrollments, users } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { UTApi } from "uploadthing/server"; // Import the Server API

const utapi = new UTApi(); // Initialize UploadThing API

export const classRouter = createTRPCRouter({
  getAll: baseProcedure
    .input(z.object({ level: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.classes.findMany({
        where: input?.level ? eq(classes.level, input.level) : undefined,
        with: { teacher: true },
        orderBy: [desc(classes.createdAt)],
      });
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      subject: z.string().min(1),
      level: z.enum(["Basic", "Mastery", "Professional"]),
      examDelayDays: z.number().min(0), 
      thumbnailUrl: z.string().optional(),
      pdfUrl: z.string().optional(),     
      youtubeUrl: z.string().default(""), // Defaults to string to avoid null errors
      points: z.number().min(0),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.clerkUserId!; 

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.clerkId, userId),
      });

      if (!user || user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only Admins allowed." });
      }

      return await ctx.db.insert(classes).values({
        title: input.title,
        subject: input.subject,
        level: input.level,
        examDelayDays: input.examDelayDays,
        thumbnailUrl: input.thumbnailUrl,
        pdfUrl: input.pdfUrl,
        youtubeUrl: input.youtubeUrl,
        pointsRequired: input.points,
        description: input.description ?? "",
        clerkId: userId,
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1),
      subject: z.string().min(1),
      level: z.enum(["Basic", "Mastery", "Professional"]),
      examDelayDays: z.number().min(0),
      thumbnailUrl: z.string().optional(),
      pdfUrl: z.string().optional(),
      youtubeUrl: z.string().default(""),
      points: z.number().min(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.clerkUserId!;
      const user = await ctx.db.query.users.findFirst({ where: eq(users.clerkId, userId) });

      if (!user || user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only Admins allowed." });
      }

      return await ctx.db.update(classes)
        .set({
          title: input.title,
          subject: input.subject,
          level: input.level,
          examDelayDays: input.examDelayDays,
          thumbnailUrl: input.thumbnailUrl,
          pdfUrl: input.pdfUrl,
          youtubeUrl: input.youtubeUrl,
          pointsRequired: input.points,
        })
        .where(eq(classes.id, input.id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.clerkUserId!;
      const user = await ctx.db.query.users.findFirst({ where: eq(users.clerkId, userId) });
      if (!user || user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });

      // 1. Find the class to get the file URLs before deleting the record
      const classRecord = await ctx.db.query.classes.findFirst({
        where: eq(classes.id, input.id)
      });

      if (classRecord) {
        const filesToDelete: string[] = [];

        // 2. Extract keys from URLs if they exist
        // UploadThing URLs usually look like: https://utfs.io/f/FILE_KEY
        if (classRecord.thumbnailUrl) {
          const thumbKey = classRecord.thumbnailUrl.split("/").pop();
          if (thumbKey) filesToDelete.push(thumbKey);
        }

        if (classRecord.pdfUrl) {
          const pdfKey = classRecord.pdfUrl.split("/").pop();
          if (pdfKey) filesToDelete.push(pdfKey);
        }

        // 3. Delete from UploadThing storage
        if (filesToDelete.length > 0) {
          try {
            await utapi.deleteFiles(filesToDelete);
          } catch (error) {
            console.error("Failed to delete files from UploadThing:", error);
            // We continue anyway so the DB record is still removed
          }
        }
      }

      // 4. Delete from Database
      await ctx.db.delete(classes).where(eq(classes.id, input.id));
      return { success: true };
    }),

  joinClass: protectedProcedure
    .input(z.object({ classId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.clerkUserId!;
      const targetClass = await ctx.db.query.classes.findFirst({ where: eq(classes.id, input.classId) });
      if (!targetClass) throw new TRPCError({ code: "NOT_FOUND" });

      return await ctx.db.transaction(async (tx) => {
        const user = await tx.query.users.findFirst({ where: eq(users.clerkId, userId) });
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        if (user.points < targetClass.pointsRequired) throw new TRPCError({ code: "FORBIDDEN", message: "Low points" });

        const existing = await tx.query.classEnrollments.findFirst({
          where: sql`${classEnrollments.classId} = ${input.classId} AND ${classEnrollments.clerkId} = ${userId}`
        });
        if (existing) throw new TRPCError({ code: "CONFLICT" });

        await tx.update(users).set({ points: sql`${users.points} - ${targetClass.pointsRequired}` }).where(eq(users.clerkId, userId));
        const [enrollment] = await tx.insert(classEnrollments).values({ classId: input.classId, clerkId: userId }).returning();
        return { success: true, enrolledId: enrollment.id };
      });
    }),
});