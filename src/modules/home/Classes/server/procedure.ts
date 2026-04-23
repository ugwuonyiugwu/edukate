import { z } from "zod";
import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/trpc/init";
import { classes, classEnrollments, users, questions } from "@/db/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { UTApi } from "uploadthing/server"; 

const utapi = new UTApi(); 
const getFileKey = (url: string | null | undefined) => {
  if (!url) return null;
  const parts = url.split("/f/");
  return parts.length > 1 ? parts[1] : url.split("/").pop();
};

export const classRouter = createTRPCRouter({
 
  getServerTime: baseProcedure
    .query(() => {
      return { serverTime: Date.now() };
    }),

  getById: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const classRecord = await ctx.db.query.classes.findFirst({
        where: eq(classes.id, input.id),
        with: { teacher: true },
      });

      if (!classRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Class session not found.",
        });
      }

      return classRecord;
    }),

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
      youtubeUrl: z.string().default(""), 
      points: z.number().min(0),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.clerkUserId!; 
      const user = await ctx.db.query.users.findFirst({ where: eq(users.clerkId, userId) });

      if (!user || user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only Admins allowed." });
      }

      const customId = Math.random().toString(36).substring(2, 10).toUpperCase();

      const [newClass] = await ctx.db.insert(classes).values({
        id: customId,
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
      }).returning();

      return newClass;
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

      const classRecord = await ctx.db.query.classes.findFirst({
        where: eq(classes.id, input.id)
      });

      if (!classRecord) throw new TRPCError({ code: "NOT_FOUND" });

      const filesToDelete: string[] = [];

      const thumbKey = getFileKey(classRecord.thumbnailUrl);
      if (thumbKey) filesToDelete.push(thumbKey);
      
      const pdfKey = getFileKey(classRecord.pdfUrl);
      if (pdfKey) filesToDelete.push(pdfKey);

      const classQuestions = await ctx.db.select({ imageUrl: questions.imageUrl })
        .from(questions)
        .where(eq(questions.classId, input.id));

      classQuestions.forEach(q => {
        const key = getFileKey(q.imageUrl);
        if (key) filesToDelete.push(key);
      });

      if (filesToDelete.length > 0) {
        try {
          await utapi.deleteFiles(filesToDelete);
        } catch (error) {
          console.error("UploadThing Deletion Error:", error);
        }
      }
      await ctx.db.delete(classes).where(eq(classes.id, input.id));
      
      return { success: true };
    }),

  getEnrolledClassIds: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.clerkUserId!;
      const enrollments = await ctx.db.query.classEnrollments.findMany({
        where: eq(classEnrollments.clerkId, userId),
        columns: {
          classId: true,
        },
      });
      return enrollments.map((e) => e.classId);
    }),

  joinClass: protectedProcedure
  .input(z.object({ classId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.clerkUserId!;
    
    // 1. Fetch Class and User for validation
    const targetClass = await ctx.db.query.classes.findFirst({ 
      where: eq(classes.id, input.classId) 
    });
    if (!targetClass) throw new TRPCError({ code: "NOT_FOUND" });

    const user = await ctx.db.query.users.findFirst({ 
      where: eq(users.clerkId, userId) 
    });
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    if (user.points < targetClass.pointsRequired) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient points" });
    }

    // 2. Execute Updates in an Atomic Batch
    try {
      await ctx.db.batch([
        // DEDUCT POINTS & INCREMENT COURSE PROGRESS
        ctx.db
          .update(users)
          .set({ 
            points: sql`${users.points} - ${targetClass.pointsRequired}`,
            courseProgress: sql`${users.courseProgress} + 1`, // Incrementing the integer
            updatedAt: new Date()
          })
          .where(eq(users.clerkId, userId)),
        
        // RECORD THE ENROLLMENT (So they don't pay twice)
        ctx.db
          .insert(classEnrollments)
          .values({ 
            classId: input.classId, 
            clerkId: userId 
          }),
      ]);

      return { success: true };
    } catch {
      throw new TRPCError({ 
        code: "INTERNAL_SERVER_ERROR", 
        message: "Failed to process enrollment." 
      });
    }
  }),
});