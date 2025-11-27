/**
 * P0 CRITICAL FIX #7: Enhanced Error Handling
 *
 * Security improvements:
 * - Structured error responses
 * - Safe error logging (no PII)
 * - User-facing vs internal errors
 * - Error classification
 * - Stack trace sanitization
 *
 * Usage:
 *   import { handleApiError, createErrorResponse } from '@/lib/errorHandler'
 *   return handleApiError(error, 'Operation failed')
 */

import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { sanitizeErrorMessage, sanitizeForLogging } from '@/lib/sanitize';
import { z } from 'zod';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error categories
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
  DATABASE = 'database',
  EXTERNAL_API = 'external_api',
  INTERNAL = 'internal',
  UNKNOWN = 'unknown',
}

/**
 * Structured error type
 */
export interface AppError {
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string; // User-facing message
  internalMessage?: string; // Internal error details
  statusCode: number;
  code?: string; // Machine-readable error code
  details?: Record<string, unknown>;
  requestId?: string;
  timestamp: number;
}

/**
 * Create a structured error
 */
export function createAppError(
  category: ErrorCategory,
  message: string,
  options?: {
    severity?: ErrorSeverity;
    statusCode?: number;
    code?: string;
    internalMessage?: string;
    details?: Record<string, unknown>;
  }
): AppError {
  const statusCode = options?.statusCode ?? getDefaultStatusCode(category);
  const severity = options?.severity ?? getDefaultSeverity(category);

  return {
    category,
    severity,
    message: sanitizeErrorMessage(message),
    internalMessage: options?.internalMessage,
    statusCode,
    code: options?.code,
    details: options?.details ? sanitizeForLogging(options.details) : undefined,
    timestamp: Date.now(),
  };
}

/**
 * Get default status code for error category
 */
function getDefaultStatusCode(category: ErrorCategory): number {
  switch (category) {
    case ErrorCategory.VALIDATION:
      return 400;
    case ErrorCategory.AUTHENTICATION:
      return 401;
    case ErrorCategory.AUTHORIZATION:
      return 403;
    case ErrorCategory.NOT_FOUND:
      return 404;
    case ErrorCategory.RATE_LIMIT:
      return 429;
    case ErrorCategory.DATABASE:
    case ErrorCategory.EXTERNAL_API:
    case ErrorCategory.INTERNAL:
      return 500;
    default:
      return 500;
  }
}

/**
 * Get default severity for error category
 */
function getDefaultSeverity(category: ErrorCategory): ErrorSeverity {
  switch (category) {
    case ErrorCategory.VALIDATION:
    case ErrorCategory.NOT_FOUND:
      return ErrorSeverity.LOW;
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
    case ErrorCategory.RATE_LIMIT:
      return ErrorSeverity.MEDIUM;
    case ErrorCategory.DATABASE:
    case ErrorCategory.EXTERNAL_API:
      return ErrorSeverity.HIGH;
    case ErrorCategory.INTERNAL:
    case ErrorCategory.UNKNOWN:
      return ErrorSeverity.CRITICAL;
    default:
      return ErrorSeverity.MEDIUM;
  }
}

/**
 * Handle unknown errors and convert to AppError
 */
export function normalizeError(error: unknown): AppError {
  // Already an AppError
  if (isAppError(error)) {
    return error;
  }

  // Zod validation error
  if (error instanceof z.ZodError) {
    return createAppError(
      ErrorCategory.VALIDATION,
      'Invalid request data',
      {
        code: 'VALIDATION_ERROR',
        details: {
          issues: error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
      }
    );
  }

  // Standard Error
  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes('rate limit')) {
      return createAppError(
        ErrorCategory.RATE_LIMIT,
        'Too many requests',
        {
          code: 'RATE_LIMIT_EXCEEDED',
          internalMessage: error.message,
        }
      );
    }

    if (error.message.includes('not found')) {
      return createAppError(
        ErrorCategory.NOT_FOUND,
        'Resource not found',
        {
          code: 'NOT_FOUND',
          internalMessage: error.message,
        }
      );
    }

    if (error.message.includes('unauthorized') || error.message.includes('auth')) {
      return createAppError(
        ErrorCategory.AUTHENTICATION,
        'Authentication required',
        {
          code: 'UNAUTHORIZED',
          internalMessage: error.message,
        }
      );
    }

    return createAppError(
      ErrorCategory.INTERNAL,
      'An unexpected error occurred',
      {
        code: 'INTERNAL_ERROR',
        internalMessage: error.message,
        details: {
          name: error.name,
        },
      }
    );
  }

  // Unknown error type
  return createAppError(
    ErrorCategory.UNKNOWN,
    'An unknown error occurred',
    {
      code: 'UNKNOWN_ERROR',
      internalMessage: String(error),
    }
  );
}

/**
 * Check if error is AppError
 */
function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'category' in error &&
    'severity' in error &&
    'message' in error &&
    'statusCode' in error
  );
}

/**
 * Create error response for API
 */
export function createErrorResponse(error: AppError): NextResponse {
  // Log error internally
  const logLevel = error.severity === ErrorSeverity.CRITICAL ||
                  error.severity === ErrorSeverity.HIGH
    ? 'error'
    : 'warn';

  logger[logLevel]('API error', {
    category: error.category,
    severity: error.severity,
    code: error.code,
    statusCode: error.statusCode,
    message: error.internalMessage || error.message,
    details: error.details,
    timestamp: error.timestamp,
  });

  // Return user-facing error (no sensitive info)
  const responseBody = {
    error: error.message,
    code: error.code,
    timestamp: error.timestamp,
    ...(process.env.NODE_ENV === 'development' && {
      _dev: {
        category: error.category,
        severity: error.severity,
        internalMessage: error.internalMessage,
        details: error.details,
      },
    }),
  };

  return NextResponse.json(responseBody, {
    status: error.statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Handle API errors (all-in-one)
 * Normalizes error, logs it, and returns response
 */
export function handleApiError(
  error: unknown,
  fallbackMessage = 'An error occurred'
): NextResponse {
  const appError = normalizeError(error);

  // Override message if provided
  if (fallbackMessage && fallbackMessage !== 'An error occurred') {
    appError.message = sanitizeErrorMessage(fallbackMessage);
  }

  return createErrorResponse(appError);
}

/**
 * Common error creators for convenience
 */
export const Errors = {
  validation: (message: string, details?: Record<string, unknown>) =>
    createAppError(ErrorCategory.VALIDATION, message, {
      code: 'VALIDATION_ERROR',
      details,
    }),

  unauthorized: (message = 'Authentication required') =>
    createAppError(ErrorCategory.AUTHENTICATION, message, {
      code: 'UNAUTHORIZED',
    }),

  forbidden: (message = 'Access denied') =>
    createAppError(ErrorCategory.AUTHORIZATION, message, {
      code: 'FORBIDDEN',
    }),

  notFound: (resource = 'Resource', identifier?: string) =>
    createAppError(
      ErrorCategory.NOT_FOUND,
      `${resource} not found`,
      {
        code: 'NOT_FOUND',
        details: identifier ? { identifier } : undefined,
      }
    ),

  rateLimit: (retryAfter?: number) =>
    createAppError(ErrorCategory.RATE_LIMIT, 'Too many requests', {
      code: 'RATE_LIMIT_EXCEEDED',
      details: retryAfter ? { retryAfter } : undefined,
    }),

  database: (message: string, internalMessage?: string) =>
    createAppError(ErrorCategory.DATABASE, message, {
      code: 'DATABASE_ERROR',
      internalMessage,
      severity: ErrorSeverity.HIGH,
    }),

  externalApi: (service: string, message: string) =>
    createAppError(
      ErrorCategory.EXTERNAL_API,
      `${service} service is unavailable`,
      {
        code: 'EXTERNAL_API_ERROR',
        internalMessage: message,
        details: { service },
      }
    ),

  internal: (message: string, internalMessage?: string) =>
    createAppError(ErrorCategory.INTERNAL, message, {
      code: 'INTERNAL_ERROR',
      internalMessage,
      severity: ErrorSeverity.CRITICAL,
    }),
};

/**
 * Async error handler wrapper for API routes
 * Catches all errors and returns proper response
 */
export function withErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Check if error should be retried
 */
export function isRetryableError(error: AppError): boolean {
  return (
    error.category === ErrorCategory.RATE_LIMIT ||
    error.category === ErrorCategory.EXTERNAL_API ||
    (error.category === ErrorCategory.DATABASE && error.statusCode >= 500)
  );
}

/**
 * Get retry delay in milliseconds
 */
export function getRetryDelay(attempt: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s
  return Math.min(1000 * Math.pow(2, attempt), 8000);
}
