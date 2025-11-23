// ZZIK LIVE v4 - Redis Client with Cache Helpers (Multi-environment support)

import IORedis from "ioredis";
import { Redis as UpstashRedis } from "@upstash/redis";
import { logger } from "@/core/observability/logger";

// Environment-based Redis client selection
const isProduction = process.env.NODE_ENV === "production";
const useUpstash = process.env.UPSTASH_REDIS_URL?.startsWith("https://");

// Initialize Redis client based on environment
let redisClient: IORedis | UpstashRedis;

if (useUpstash && process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN) {
  // Production: Upstash Redis (REST API)
  logger.info({}, "Using Upstash Redis (REST)");
  redisClient = new UpstashRedis({
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
  });
} else {
  // Development: Local Redis (ioredis)
  logger.info({}, "Using local Redis (ioredis) at localhost:6379");
  redisClient = new IORedis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) {
        logger.warn({}, "Redis max retries reached, giving up");
        return null; // Stop retrying
      }
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  // Handle connection events
  (redisClient as IORedis).on("connect", () => {
    logger.info({}, "Connected to local Redis");
  });

  (redisClient as IORedis).on("error", (err) => {
    logger.error({}, "Redis connection error", { error: err.message });
  });
}

export const redis = redisClient;

// Export Upstash-specific client for rate limiting
// @upstash/ratelimit requires UpstashRedis type
export const upstashRedis = (useUpstash ? redisClient : null) as UpstashRedis | null;

/**
 * Get cached value by key
 * @param key - The cache key
 * @returns The cached value or null if not found
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    if (redisClient instanceof IORedis) {
      // ioredis: get returns string | null
      const cached = await redisClient.get(key);
      if (!cached) return null;
      return JSON.parse(cached) as T;
    } else {
      // Upstash: get returns T | null
      const cached = await (redisClient as UpstashRedis).get<T>(key);
      return cached;
    }
  } catch (error: any) {
    logger.error({ key }, "Error getting cache", { error: error.message });
    return null;
  }
}

/**
 * Set cache with expiry
 * @param key - The cache key
 * @param value - The value to cache
 * @param expirySeconds - Time to live in seconds
 */
export async function setCache<T>(
  key: string,
  value: T,
  expirySeconds: number
): Promise<void> {
  try {
    if (redisClient instanceof IORedis) {
      // ioredis: setex(key, seconds, value)
      await redisClient.setex(key, expirySeconds, JSON.stringify(value));
    } else {
      // Upstash: setex(key, seconds, value)
      await (redisClient as UpstashRedis).setex(
        key,
        expirySeconds,
        JSON.stringify(value)
      );
    }
  } catch (error: any) {
    logger.error({ key, expirySeconds }, "Error setting cache", { error: error.message });
    // Fail gracefully - don't throw, just log
  }
}
