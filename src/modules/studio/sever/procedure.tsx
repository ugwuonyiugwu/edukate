import { db } from "@/db";
import { videos } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq, lt, or, desc } from "drizzle-orm";
import { z } from "zod"

export const studioRouter = createTRPCRouter({
  getMany: protectedProcedure
  .input(
    z.object({
      cursor: z.object({
        id: z.string().uuid(),
        updatedAt: z.date(),
      })
      .nullish(),
      limit: z.number().min(1).max(100)
    }),
  )
  .query(async ({ ctx, input }) => {
    const { cursor, limit } = input;
    const { id: userId } = ctx.user;

    const data = await db
    .select()
    .from(videos)
    .where(and(
      eq(videos.userId, userId),
      cursor
      ? or(
          lt(videos.updatedAt, cursor.updatedAt),
            and(
              eq(videos.updatedAt, cursor.updatedAt),  
              lt(videos.id, cursor.id)
            )
          )
          : undefined,
    )).orderBy(desc(videos.updatedAt), desc(videos.id)).limit(limit + 1)

    const hasMore = data.length > limit;
    // romoe last item if there is more data
    const items = hasMore? data.slice(0, -1) : data;
    // set the next cursor to the last item if there is more data
    const lastitem = items[items.length - 1];
    const nextCursor = hasMore 
    ? {
        id: lastitem.id,
        updatedAt: lastitem.updatedAt,
    }
    : null;
    return {
      items,
      nextCursor,
    }
  })
})
