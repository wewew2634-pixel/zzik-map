// ZZIK LIVE v4 - Rate Limiting Middleware

import { Ratelimit } from "@upstash/ratelimit";
import { AppError } from "@/core/errors/app-error";
import { logger } from "@/core/observability/logger";

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

/**
 * Check rate limit for an identifier
 * @param identifier - The identifier to rate limit (user ID, IP, etc.)
 * @param limiter - The Ratelimit instance to use
 * @returns Rate limit result with remaining requests and reset time
 * @throws AppError with 429 status if rate limit is exceeded
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit,
): Promise<RateLimitResult> {
  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);

      logger.warn(
        { identifier, limit, remaining, reset, retryAfter },
        "Rate limit exceeded"
      );

      throw new AppError(
        "RATE_LIMIT_EXCEEDED",
        `Rate limit exceeded. Try again in ${retryAfter} seconds`,
        429,
        {
          limit,
          remaining,
          reset,
          retryAfter,
        }
      );
    }

    return {
      success,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    // If it's already an AppError (rate limit exceeded), re-throw it
    if (error instanceof AppError) {
      throw error;
    }

    // If Redis is down or other error, log warning and allow request (graceful degradation)
    logger.error(
      { identifier, error },
      "Rate limiting failed - allowing request (graceful degradation)"
    );

    // Return a fake success result to allow the request to proceed
    return {
      success: true,
      limit: -1,
      remaining: -1,
      reset: Date.now() + 60000, // 1 minute from now
    };
  }
}

/**
 * Get client identifier from request
 * Extracts IP address for rate limiting
 * @param req - The request object
 * @returns Client identifier (IP address)
 */
export function getClientIdentifier(req: Request): string {
  // Try to get real IP from headers (common proxy headers)
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Get first IP if multiple IPs are present
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier
  // In production, you might want to handle this differently
  return "unknown-client";
}

/**
 * Add rate limit headers to response
 * @param headers - The headers object to modify
 * @param result - The rate limit result
 */
export function addRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult,
): void {
  headers.set("X-RateLimit-Limit", result.limit.toString());
  headers.set("X-RateLimit-Remaining", result.remaining.toString());
  headers.set("X-RateLimit-Reset", result.reset.toString());

  // Add Retry-After header if rate limit was exceeded
  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
    headers.set("Retry-After", retryAfter.toString());
  }
}
