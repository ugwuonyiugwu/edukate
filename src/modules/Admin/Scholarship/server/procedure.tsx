import { z } from "zod";
import { createTRPCRouter, adminProcedure, protectedProcedure } from "@/trpc/init";
import { scholarships } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const scholarshipRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(2),
        description: z.string().min(10),
        amount: z.coerce.number().int().positive(),
        scholarshipUrl: z.string().url("Please enter a valid URL"),
        isActive: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [newScholarship] = await ctx.db
        .insert(scholarships)
        .values({
          name: input.name,
          description: input.description,
          amount: input.amount,
          scholarshipUrl: input.scholarshipUrl,
          isActive: input.isActive,
        })
        .returning();
      
      return newScholarship;
    }),

  // Only Admins can update
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        amount: z.coerce.number().int().positive().optional(),
        scholarshipUrl: z.string().url().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      
      const [updated] = await ctx.db
        .update(scholarships)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(scholarships.id, id))
        .returning();

      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(scholarships)
        .where(eq(scholarships.id, input.id));
      
      return { success: true };
    }),

  getAllAdmin: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(scholarships);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [data] = await ctx.db
        .select()
        .from(scholarships)
        .where(eq(scholarships.id, input.id))
        .limit(1);

      if (!data) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Scholarship not found" });
      }

      return data;
    }),

  getActive: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(scholarships)
      .where(eq(scholarships.isActive, true));
  }),
});