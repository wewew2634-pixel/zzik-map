/**
 * P0 CRITICAL FIX #2: API Input Validation (Zod Schemas)
 *
 * Security improvements:
 * - Runtime type validation
 * - Size limits to prevent DoS
 * - String length limits
 * - Enum validation
 * - Prevents malicious data injection
 *
 * Usage:
 *   import { AnalyticsMetricsSchema } from '@/lib/schemas/analytics'
 *   const result = AnalyticsMetricsSchema.safeParse(body)
 *   if (!result.success) throw new Error(result.error)
 */

import { z } from 'zod';

/**
 * Constants for input validation
 * These limits prevent DoS and resource exhaustion
 */
const LIMITS = {
  // String length limits
  SESSION_ID_MAX: 100,
  UPLOAD_ID_MAX: 100,
  USER_ID_MAX: 100,
  COHORT_MAX: 50,
  FILE_NAME_MAX: 255,
  ERROR_TYPE_MAX: 100,
  STATE_NAME_MAX: 50,
  METRIC_KEY_MAX: 100,
  TEST_ID_MAX: 100,

  // Array limits
  ERROR_TYPES_MAX: 50,
  EVENTS_MAX: 1000,
  STATES_MAX: 20,

  // Value limits
  FILE_SIZE_MAX: 100 * 1024 * 1024, // 100MB
  DURATION_MAX: 30 * 60 * 1000, // 30 minutes
  RETRY_COUNT_MAX: 10,
  METRIC_VALUE_MAX: 1e10, // 10 billion
} as const;

/**
 * Event Schema for analytics events
 */
const AnalyticsEventSchema = z.object({
  eventType: z.string().max(LIMITS.ERROR_TYPE_MAX),
  timestamp: z.number().int().positive().max(Date.now() + 60000), // Allow 1 min future for clock skew
  metadata: z.record(z.string(), z.unknown()).optional(),
  userSegment: z.string().max(LIMITS.COHORT_MAX).optional(),
});

/**
 * Schema for upload analytics metrics
 * Used in POST /api/analytics/upload
 */
export const AnalyticsMetricsSchema = z.object({
  sessionId: z.string().min(1).max(LIMITS.SESSION_ID_MAX),
  uploadId: z.string().min(1).max(LIMITS.UPLOAD_ID_MAX),
  userId: z.string().max(LIMITS.USER_ID_MAX).optional(),
  cohort: z.string().max(LIMITS.COHORT_MAX).optional(),
  succeeded: z.boolean(),
  completed: z.boolean(),
  hadErrors: z.boolean(),
  retryCount: z.number().int().min(0).max(LIMITS.RETRY_COUNT_MAX),
  totalDuration: z.number().int().min(0).max(LIMITS.DURATION_MAX),
  errorTypes: z.array(z.string().max(LIMITS.ERROR_TYPE_MAX)).max(LIMITS.ERROR_TYPES_MAX),
  timeInEachState: z.record(
    z.string().max(LIMITS.STATE_NAME_MAX),
    z.number().int().min(0).max(LIMITS.DURATION_MAX)
  ),
  fileName: z.string().max(LIMITS.FILE_NAME_MAX).optional(),
  fileSize: z.number().int().min(0).max(LIMITS.FILE_SIZE_MAX).optional(),
  eventCount: z.number().int().min(0).max(LIMITS.EVENTS_MAX),
  events: z.array(AnalyticsEventSchema).max(LIMITS.EVENTS_MAX),
});

export type AnalyticsMetrics = z.infer<typeof AnalyticsMetricsSchema>;

/**
 * Schema for A/B test events
 * Used in POST /api/analytics/ab-test
 */
export const ABTestEventSchema = z.object({
  testId: z.string().min(1).max(LIMITS.TEST_ID_MAX),
  variant: z.enum(['control', 'variant_a', 'variant_b']),
  metric: z.string().min(1).max(LIMITS.METRIC_KEY_MAX),
  value: z.number().finite().min(-LIMITS.METRIC_VALUE_MAX).max(LIMITS.METRIC_VALUE_MAX),
  userId: z.string().min(1).max(LIMITS.USER_ID_MAX),
  uploadId: z.string().max(LIMITS.UPLOAD_ID_MAX).optional(),
  timestamp: z.number().int().positive().max(Date.now() + 60000),
});

export type ABTestEvent = z.infer<typeof ABTestEventSchema>;

/**
 * Schema for upload filter queries
 * Used in GET /api/analytics/uploads with query params
 */
export const UploadFilterSchema = z.object({
  userId: z.string().max(LIMITS.USER_ID_MAX).optional(),
  cohort: z.string().max(LIMITS.COHORT_MAX).optional(),
  succeeded: z.enum(['true', 'false']).optional().transform((val) => val ? val === 'true' : undefined),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(0)).optional(),
});

export type UploadFilter = z.infer<typeof UploadFilterSchema>;

/**
 * Helper function to validate and sanitize analytics data
 * Returns { success: true, data } or { success: false, error }
 */
export function validateAnalyticsMetrics(input: unknown):
  | { success: true; data: AnalyticsMetrics }
  | { success: false; error: string; issues: z.ZodIssue[] } {

  const result = AnalyticsMetricsSchema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return {
      success: false,
      error: 'Invalid analytics metrics',
      issues: result.error.issues,
    };
  }
}

/**
 * Helper function to validate A/B test events
 */
export function validateABTestEvent(input: unknown):
  | { success: true; data: ABTestEvent }
  | { success: false; error: string; issues: z.ZodIssue[] } {

  const result = ABTestEventSchema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return {
      success: false,
      error: 'Invalid A/B test event',
      issues: result.error.issues,
    };
  }
}

/**
 * Helper function to validate upload filters
 */
export function validateUploadFilter(input: unknown):
  | { success: true; data: UploadFilter }
  | { success: false; error: string; issues: z.ZodIssue[] } {

  const result = UploadFilterSchema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return {
      success: false,
      error: 'Invalid upload filter',
      issues: result.error.issues,
    };
  }
}

/**
 * Validation error formatter
 * Converts Zod errors to user-friendly messages
 */
export function formatValidationErrors(issues: z.ZodIssue[]): string[] {
  return issues.map(issue => {
    const path = issue.path.join('.');
    return `${path}: ${issue.message}`;
  });
}
