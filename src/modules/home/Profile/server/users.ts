// @/modules/home/Profile/server/users.ts
import { db } from "@/db";
import { users } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  getOne: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),

  updateProfile: protectedProcedure
    .input(z.object({
      firstName: z.string().nullish(),
      lastName: z.string().nullish(),
      phoneNumber: z.string().nullish(),
      school: z.string().nullish(),
      gender: z.string().nullish(),
      dateOfBirth: z.string().nullish(),
      state: z.string().nullish(),
      dateofBirth: z.string().nullish(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.clerkUserId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const [updatedUser] = await db
        .update(users)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, ctx.clerkUserId)) // Error resolved by the guard above
        .returning();

      return updatedUser;
    }),
});