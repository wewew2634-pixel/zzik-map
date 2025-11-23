// ZZIK LIVE v4 - Rate Limiting Configuration

import { Ratelimit } from "@upstash/ratelimit";
import { upstashRedis } from "./redis";

// Rate limiters require Upstash Redis
// In development without Upstash, these will be initialized but won't be used
const rateLimitRedis = upstashRedis || ({} as any);

// Create rate limiters with different tiers
export const apiRateLimiter = new Ratelimit({
  redis: rateLimitRedis,
  limiter: Ratelimit.slidingWindow(100, "15 m"), // 100 requests per 15 min
  analytics: true,
});

export const authRateLimiter = new Ratelimit({
  redis: rateLimitRedis,
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 attempts per 1 min
  analytics: true,
});

export const missionRunRateLimiter = new Ratelimit({
  redis: rateLimitRedis,
  limiter: Ratelimit.slidingWindow(10, "5 m"), // 10 runs per 5 min
  analytics: true,
});

export const qrGenerateRateLimiter = new Ratelimit({
  redis: rateLimitRedis,
  limiter: Ratelimit.slidingWindow(20, "15 m"), // 20 requests per 15 min
  analytics: true,
});

export const adminMutationRateLimiter = new Ratelimit({
  redis: rateLimitRedis,
  limiter: Ratelimit.slidingWindow(50, "15 m"), // 50 admin mutations per 15 min
  analytics: true,
});

export const userMutationRateLimiter = new Ratelimit({
  redis: rateLimitRedis,
  limiter: Ratelimit.slidingWindow(20, "10 m"), // 20 mutations per 10 min
  analytics: true,
});

// Public API rate limiter (IP-based)
export const publicApiRateLimiter = new Ratelimit({
  redis: rateLimitRedis,
  limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 requests per minute
  analytics: true,
});
