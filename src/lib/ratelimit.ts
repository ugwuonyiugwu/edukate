import { redis } from "./redis";
import { Ratelimit } from "@upstash/ratelimit" 

export const ratelimit  = new Ratelimit ({
  redis,
  limiter: Ratelimit.slidingWindow(100, "10s")
})