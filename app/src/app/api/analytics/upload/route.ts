/**
 * API Route: POST /api/analytics/upload
 * Purpose: Save upload flow analytics events
 *
 * P0 SECURITY FIXES APPLIED:
 * - ✅ Validated Supabase client (Fix #1)
 * - ✅ Input validation with Zod (Fix #2)
 * - ✅ Content sanitization (Fix #3)
 * - ✅ Rate limiting (Fix #6)
 * - ✅ Enhanced error handling (Fix #7)
 * - ✅ Body size limits (middleware)
 * - ✅ Security headers (middleware)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { validateAnalyticsMetrics, formatValidationErrors } from '@/lib/schemas/analytics';
import { sanitizeFileName, sanitizeMetadata } from '@/lib/sanitize';
import { RateLimiters, applyRateLimitHeaders, createRateLimitError } from '@/lib/rateLimit';
import { withErrorHandler, Errors, handleApiError } from '@/lib/errorHandler';

/**
 * POST handler with all security fixes
 */
async function handlePost(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limiting
  const rateLimitResult = await RateLimiters.analyticsUpload.check(request);
  if (!rateLimitResult.success) {
    const response = NextResponse.json(
      createRateLimitError(rateLimitResult),
      { status: 429 }
    );
    applyRateLimitHeaders(response.headers, rateLimitResult);
    return response;
  }

  // 2. Parse and validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    throw Errors.validation('Invalid JSON body');
  }

  // 3. Validate with Zod schema
  const validationResult = validateAnalyticsMetrics(body);
  if (!validationResult.success) {
    const errorMessages = formatValidationErrors(validationResult.issues);
    throw Errors.validation('Invalid analytics metrics', {
      errors: errorMessages,
    });
  }

  const metrics = validationResult.data;

  // 4. Sanitize user-generated content
  const sanitizedFileName = metrics.fileName
    ? sanitizeFileName(metrics.fileName)
    : undefined;

  const sanitizedEvents = metrics.events.map(event => ({
    ...event,
    metadata: event.metadata ? sanitizeMetadata(event.metadata) : undefined,
  }));

  // 5. Prepare data for database
  const analyticsData = {
    session_id: metrics.sessionId,
    upload_id: metrics.uploadId,
    user_id: metrics.userId,
    cohort: metrics.cohort,
    succeeded: metrics.succeeded,
    completed: metrics.completed,
    had_errors: metrics.hadErrors,
    retry_count: metrics.retryCount,
    total_duration_ms: metrics.totalDuration,
    error_types: metrics.errorTypes,
    time_in_states: metrics.timeInEachState,
    file_name: sanitizedFileName,
    file_size: metrics.fileSize,
    events: sanitizedEvents,
  };

  // 6. Insert into Supabase with validated client
  const { data, error } = await supabaseAdmin
    .from('uploads_analytics')
    .insert([analyticsData])
    .select();

  if (error) {
    logger.error('Failed to insert analytics', {
      error: error.message,
      uploadId: metrics.uploadId,
    });

    throw Errors.database(
      'Failed to save analytics',
      error.message
    );
  }

  // 7. Success response
  logger.info('Analytics saved successfully', {
    uploadId: metrics.uploadId,
    succeeded: metrics.succeeded,
    duration: metrics.totalDuration,
  });

  const response = NextResponse.json(
    {
      success: true,
      uploadId: metrics.uploadId,
      id: data?.[0]?.id,
    },
    { status: 201 }
  );

  // Add rate limit headers
  applyRateLimitHeaders(response.headers, rateLimitResult);

  return response;
}

/**
 * Export with error handler wrapper
 */
export const POST = withErrorHandler(handlePost);
