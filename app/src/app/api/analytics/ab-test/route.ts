/**
 * API Route: POST /api/analytics/ab-test
 * Purpose: Log A/B test events
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
import { validateABTestEvent, formatValidationErrors } from '@/lib/schemas/analytics';
import { RateLimiters, applyRateLimitHeaders, createRateLimitError } from '@/lib/rateLimit';
import { withErrorHandler, Errors } from '@/lib/errorHandler';

/**
 * POST handler with all security fixes
 */
async function handlePost(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limiting
  const rateLimitResult = await RateLimiters.abTest.check(request);
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
  const validationResult = validateABTestEvent(body);
  if (!validationResult.success) {
    const errorMessages = formatValidationErrors(validationResult.issues);
    throw Errors.validation('Invalid A/B test event', {
      errors: errorMessages,
    });
  }

  const event = validationResult.data;

  // 4. Prepare data for database
  const testEventData = {
    test_id: event.testId,
    variant: event.variant,
    user_id: event.userId,
    metric_key: event.metric,
    metric_value: event.value,
    upload_id: event.uploadId,
    timestamp: new Date(event.timestamp).toISOString(),
  };

  // 5. Insert into Supabase with validated client
  const { data, error } = await supabaseAdmin
    .from('ab_test_events')
    .insert([testEventData])
    .select();

  if (error) {
    logger.error('Failed to insert A/B test event', {
      error: error.message,
      testId: event.testId,
    });

    throw Errors.database(
      'Failed to save A/B test event',
      error.message
    );
  }

  // 6. Success response
  logger.info('A/B test event saved', {
    testId: event.testId,
    variant: event.variant,
    metric: event.metric,
  });

  const response = NextResponse.json(
    {
      success: true,
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
