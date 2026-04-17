import type { Request, Response, NextFunction } from "express";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { logger } from "./logger";

function buildRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = buildRedis();
if (!redis) logger.warn("UPSTASH_REDIS_REST_URL/TOKEN not set — rate limiting disabled");

function makeLimiter(requests: number, window: "60 s" | "24 h"): Ratelimit | null {
  if (!redis) return null;
  // Non-null assertion safe: guarded above; TS can't narrow module-level const across closures
  return new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: "@vibefit",
  });
}

export const generalLimiter = makeLimiter(60, "60 s");
export const generateLimiter = makeLimiter(30, "24 h");
export const modelImageLimiter = makeLimiter(10, "24 h");

export function rateLimit(limiter: Ratelimit | null) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!limiter) {
      next();
      return;
    }
    try {
      const { success, limit, remaining, reset } = await limiter.limit(req.deviceId);
      if (!success) {
        res.setHeader("X-RateLimit-Limit", limit);
        res.setHeader("X-RateLimit-Remaining", remaining);
        res.setHeader("X-RateLimit-Reset", reset);
        res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
        return;
      }
    } catch (err) {
      logger.warn({ err }, "Rate limiter error — failing open");
    }
    next();
  };
}
