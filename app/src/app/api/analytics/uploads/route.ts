/**
 * API Route: GET /api/analytics/uploads
 * Purpose: Fetch filtered upload metrics
 *
 * P0 SECURITY FIXES APPLIED:
 * - ✅ Validated Supabase client (Fix #1)
 * - ✅ Input validation with Zod (Fix #2)
 * - ✅ Content sanitization (Fix #3)
 * - ✅ Rate limiting (Fix #6)
 * - ✅ Enhanced error handling (Fix #7)
 * - ✅ SQL injection prevention
 * - ✅ Security headers (middleware)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { validateUploadFilter, formatValidationErrors } from '@/lib/schemas/analytics';
import { RateLimiters, applyRateLimitHeaders, createRateLimitError } from '@/lib/rateLimit';
import { withErrorHandler, Errors } from '@/lib/errorHandler';

/**
 * GET handler with all security fixes
 */
async function handleGet(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limiting
  const rateLimitResult = await RateLimiters.analyticsList.check(request);
  if (!rateLimitResult.success) {
    const response = NextResponse.json(
      createRateLimitError(rateLimitResult),
      { status: 429 }
    );
    applyRateLimitHeaders(response.headers, rateLimitResult);
    return response;
  }

  // 2. Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const queryParams = {
    userId: searchParams.get('userId'),
    cohort: searchParams.get('cohort'),
    succeeded: searchParams.get('succeeded'),
    startDate: searchParams.get('startDate'),
    endDate: searchParams.get('endDate'),
    limit: searchParams.get('limit') || '100',
    offset: searchParams.get('offset') || '0',
  };

  // 3. Validate with Zod schema
  const validationResult = validateUploadFilter(queryParams);
  if (!validationResult.success) {
    const errorMessages = formatValidationErrors(validationResult.issues);
    throw Errors.validation('Invalid query parameters', {
      errors: errorMessages,
    });
  }

  const filters = validationResult.data;

  // 4. Build query with validated inputs
  let query = supabaseAdmin
    .from('uploads_analytics')
    .select('*', { count: 'exact' });

  // Apply filters (Supabase handles parameterization, safe from SQL injection)
  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters.cohort) {
    query = query.eq('cohort', filters.cohort);
  }
  if (filters.succeeded !== undefined) {
    query = query.eq('succeeded', filters.succeeded);
  }
  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  // Apply pagination
  const limit = filters.limit || 100;
  const offset = filters.offset || 0;

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // 5. Execute query
  const { data, error, count } = await query;

  if (error) {
    logger.error('Failed to fetch analytics', {
      error: error.message,
    });

    throw Errors.database(
      'Failed to fetch analytics',
      error.message
    );
  }

  // 6. Success response
  logger.info('Analytics fetched', {
    count: data?.length || 0,
    total: count,
  });

  const response = NextResponse.json(
    {
      data: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0),
      },
    },
    { status: 200 }
  );

  // Add rate limit headers
  applyRateLimitHeaders(response.headers, rateLimitResult);

  return response;
}

/**
 * Export with error handler wrapper
 */
export const GET = withErrorHandler(handleGet);
