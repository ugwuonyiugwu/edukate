import { z } from "zod";
import { createTRPCRouter, adminProcedure, protectedProcedure, baseProcedure } from "@/trpc/init";
import { teachers } from "@/db/schema";
import { eq } from "drizzle-orm";

export const teacherRouter = createTRPCRouter({
  create: adminProcedure
    .input(z.object({
      name: z.string().min(2),
      whatsappNumber: z.string().min(10),
      subjects: z.string().min(2),
      topics: z.string().min(2),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.insert(teachers).values(input).returning();
    }),

  getAll: baseProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(teachers);
  }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.delete(teachers).where(eq(teachers.id, input.id));
    }),
});