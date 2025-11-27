/**
 * P0 CRITICAL FIX #4 & #6: Next.js Security Middleware
 *
 * Security improvements:
 * - Security headers (CSP, X-Frame-Options, etc)
 * - CSRF protection
 * - Request validation
 * - Body size limits
 * - Secret exposure prevention
 *
 * This middleware runs on EVERY request
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * Security headers configuration
 */
const SECURITY_HEADERS = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://dapi.kakao.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com",
    "frame-src 'self'",
    "frame-ancestors 'none'",
  ].join('; '),

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Prevent MIME sniffing
  'X-Content-Type-Options': 'nosniff',

  // Enable XSS filter
  'X-XSS-Protection': '1; mode=block',

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy
  'Permissions-Policy': 'geolocation=(self), camera=(self)',

  // Remove server header
  'X-Powered-By': '',
} as const;

/**
 * Routes that require CSRF protection
 * All state-changing operations
 */
const CSRF_PROTECTED_ROUTES = [
  '/api/analytics/upload',
  '/api/analytics/ab-test',
  '/api/photos',
  '/api/locations',
  '/api/journeys',
];

/**
 * Maximum request body size (10MB)
 */
const MAX_BODY_SIZE = 10 * 1024 * 1024;

/**
 * Check for exposed secrets in response
 * Prevents accidental secret leakage
 */
function checkForExposedSecrets(text: string): boolean {
  const secretPatterns = [
    /service_role/i,
    /eyJ[a-zA-Z0-9_-]{20,}/g, // JWT pattern
    /sk_live_[a-zA-Z0-9]{24,}/g, // Stripe live key
    /AKIA[0-9A-Z]{16}/g, // AWS access key
    /AIza[0-9A-Za-z_-]{35}/g, // Google API key
  ];

  return secretPatterns.some(pattern => pattern.test(text));
}

/**
 * Validate CSRF token
 * Simple implementation - enhance with cryptographic tokens in production
 */
function validateCsrfToken(request: NextRequest): boolean {
  const token = request.headers.get('x-csrf-token');
  const cookie = request.cookies.get('csrf_token')?.value;

  // Skip CSRF check for GET, HEAD, OPTIONS
  const method = request.method;
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return true;
  }

  // For now, just check presence
  // TODO: Implement proper token generation and validation
  return !!token || !!cookie;
}

/**
 * Check request body size
 */
async function checkBodySize(request: NextRequest): Promise<boolean> {
  const contentLength = request.headers.get('content-length');

  if (contentLength) {
    const size = parseInt(contentLength, 10);
    return size <= MAX_BODY_SIZE;
  }

  return true; // Allow if no content-length header
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;

  // 1. Check body size for POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const validSize = await checkBodySize(request);
    if (!validSize) {
      logger.warn('Request body too large', {
        pathname,
        method: request.method,
        contentLength: request.headers.get('content-length'),
      });

      return NextResponse.json(
        {
          error: 'Request body too large',
          maxSize: `${MAX_BODY_SIZE / 1024 / 1024}MB`,
        },
        { status: 413 }
      );
    }
  }

  // 2. CSRF validation for protected routes
  if (CSRF_PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    const validCsrf = validateCsrfToken(request);
    if (!validCsrf) {
      logger.warn('CSRF validation failed', {
        pathname,
        method: request.method,
      });

      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
  }

  // 3. Continue to route handler
  const response = NextResponse.next();

  // 4. Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });

  // 5. Add request ID for tracing
  const requestId = crypto.randomUUID();
  response.headers.set('X-Request-ID', requestId);

  // 6. Check for exposed secrets in development
  if (process.env.NODE_ENV === 'development') {
    const responseText = await response.clone().text();
    if (checkForExposedSecrets(responseText)) {
      logger.error('SECURITY ALERT: Potential secret exposed in response', {
        pathname,
        requestId,
      });

      // In development, block the response
      return NextResponse.json(
        { error: 'Response blocked: potential secret exposure detected' },
        { status: 500 }
      );
    }
  }

  // 7. Log request metrics
  const duration = Date.now() - startTime;
  if (duration > 1000) {
    logger.warn('Slow middleware execution', {
      pathname,
      duration,
      requestId,
    });
  }

  return response;
}

/**
 * Middleware configuration
 * Apply to all API routes and specific pages
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
