/**
 * ZZIK MAP - Middleware
 * V1: Rate limiting + Security headers
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute for API
  maxUploads: 10, // 10 uploads per minute
};

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIp || 'unknown';
}

function isRateLimited(
  identifier: string,
  maxRequests: number
): { limited: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    const cutoff = now - RATE_LIMIT.windowMs;
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.timestamp < cutoff) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || now - record.timestamp > RATE_LIMIT.windowMs) {
    rateLimitMap.set(identifier, { count: 1, timestamp: now });
    return { limited: false, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { limited: true, remaining: 0 };
  }

  record.count += 1;
  return { limited: false, remaining: maxRequests - record.count };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only rate limit API routes
  if (pathname.startsWith('/api/')) {
    const clientId = getClientIdentifier(request);

    // Different limits for different endpoints
    const isUploadEndpoint = pathname.includes('/photos') && request.method === 'POST';
    const maxRequests = isUploadEndpoint ? RATE_LIMIT.maxUploads : RATE_LIMIT.maxRequests;
    const limitKey = `${clientId}:${isUploadEndpoint ? 'upload' : 'api'}`;

    const { limited, remaining } = isRateLimited(limitKey, maxRequests);

    if (limited) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please try again later.',
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // Add rate limit headers to response
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
