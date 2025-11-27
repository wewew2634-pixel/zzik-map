/**
 * ZZIK MAP - API Response Helpers
 * V2: Consistent response shape + error handling
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logger } from '../logger';

// ============================================
// Response Types
// ============================================

interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    limit?: number;
    offset?: number;
    total?: number;
    hasMore?: boolean;
    demo?: boolean;
    fallback?: boolean;
    cached?: boolean;
  };
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// ============================================
// Error Codes
// ============================================

export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
} as const;

type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode];

// ============================================
// Response Builders
// ============================================

export function success<T>(
  data: T,
  meta?: SuccessResponse<T>['meta'],
  status = 200
): NextResponse<ApiResponse<T>> {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return NextResponse.json(response, { status });
}

export function created<T>(data: T): NextResponse<ApiResponse<T>> {
  return success(data, undefined, 201);
}

export function error(
  code: ErrorCodeType,
  message: string,
  status: number,
  details?: unknown,
  route?: string
): NextResponse<ErrorResponse> {
  // Log errors (except validation errors which are user-facing)
  if (code !== ErrorCode.VALIDATION_ERROR) {
    logger.error(message, { route, errorCode: code }, details instanceof Error ? details : undefined);
  }

  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
    },
  };

  // Only include details in development
  if (details && process.env.NODE_ENV === 'development') {
    response.error.details = details instanceof Error ? details.message : details;
  }

  return NextResponse.json(response, { status });
}

// ============================================
// Convenience Error Functions
// ============================================

export function badRequest(message: string, route?: string): NextResponse<ErrorResponse> {
  return error(
    ErrorCode.VALIDATION_ERROR,
    message,
    400,
    undefined,
    route
  );
}

export function validationError(zodError: ZodError, route?: string): NextResponse<ErrorResponse> {
  const issues = zodError.issues.map(issue => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

  return error(
    ErrorCode.VALIDATION_ERROR,
    'Invalid request parameters',
    400,
    issues,
    route
  );
}

export function notFound(resource: string, route?: string): NextResponse<ErrorResponse> {
  return error(
    ErrorCode.NOT_FOUND,
    `${resource} not found`,
    404,
    undefined,
    route
  );
}

export function unauthorized(route?: string): NextResponse<ErrorResponse> {
  return error(
    ErrorCode.UNAUTHORIZED,
    'Authentication required',
    401,
    undefined,
    route
  );
}

export function forbidden(route?: string): NextResponse<ErrorResponse> {
  return error(
    ErrorCode.FORBIDDEN,
    'Access denied',
    403,
    undefined,
    route
  );
}

export function rateLimited(route?: string): NextResponse<ErrorResponse> {
  return error(
    ErrorCode.RATE_LIMITED,
    'Too many requests. Please try again later.',
    429,
    undefined,
    route
  );
}

export function internalError(err?: Error, route?: string): NextResponse<ErrorResponse> {
  return error(
    ErrorCode.INTERNAL_ERROR,
    'An unexpected error occurred',
    500,
    err,
    route
  );
}

export function databaseError(err?: Error, route?: string): NextResponse<ErrorResponse> {
  return error(
    ErrorCode.DATABASE_ERROR,
    'Database operation failed',
    500,
    err,
    route
  );
}

export function externalApiError(service: string, err?: Error, route?: string): NextResponse<ErrorResponse> {
  return error(
    ErrorCode.EXTERNAL_API_ERROR,
    `${service} service error`,
    502,
    err,
    route
  );
}

// ============================================
// Pagination Helper
// ============================================

export function paginationMeta(
  limit: number,
  offset: number,
  total: number
): SuccessResponse<unknown>['meta'] {
  return {
    limit,
    offset,
    total,
    hasMore: offset + limit < total,
  };
}

// ============================================
// Cached Response Helper
// ============================================

export interface CacheOptions {
  /** Cache duration in seconds (default: 300 = 5 minutes) */
  maxAge?: number;
  /** Stale-while-revalidate duration in seconds (default: 600 = 10 minutes) */
  staleWhileRevalidate?: number;
  /** Whether the cache is public (default: true) */
  isPublic?: boolean;
}

/**
 * Success response with HTTP caching headers
 * Use for read-only data that can be cached (locations, journeys, etc.)
 */
export function cachedSuccess<T>(
  data: T,
  meta?: SuccessResponse<T>['meta'],
  cacheOptions?: CacheOptions,
  status = 200
): NextResponse<ApiResponse<T>> {
  const {
    maxAge = 300,
    staleWhileRevalidate = 600,
    isPublic = true,
  } = cacheOptions || {};

  const response: SuccessResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = { ...meta, cached: true };
  }

  const cacheControl = isPublic
    ? `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
    : `private, max-age=${maxAge}`;

  return NextResponse.json(response, {
    status,
    headers: {
      'Cache-Control': cacheControl,
    },
  });
}
