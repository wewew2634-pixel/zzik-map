/**
 * ZZIK MAP - Locations API
 * V2: Zod validation + consistent responses
 */

import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getLocationsSchema } from '@/lib/validations/api';
import { cachedSuccess, validationError, databaseError, paginationMeta } from '@/lib/api/response';
import { logger } from '@/lib/logger';

const ROUTE = '/api/locations';

// GET /api/locations - List all locations with pagination
export async function GET(request: NextRequest) {
  const log = logger.api(ROUTE, 'GET');
  const timer = logger.time('GET /api/locations');

  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const parseResult = getLocationsSchema.safeParse({
      category: searchParams.get('category') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    });

    if (!parseResult.success) {
      return validationError(parseResult.error, ROUTE);
    }

    const { category, limit, offset } = parseResult.data;

    const supabase = createServiceClient();

    // Build query
    let query = supabase
      .from('locations')
      .select('id, name, name_ko, name_en, category, subcategory, latitude, longitude, photo_count, visit_count, avg_rating, created_at', { count: 'exact' })
      .order('visit_count', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: locations, error, count } = await query;

    if (error) {
      log.error('Database query failed', {}, error);
      return databaseError(error, ROUTE);
    }

    timer.end({ resultCount: locations?.length || 0 });

    // Cache locations for 5 minutes (they don't change frequently)
    return cachedSuccess(
      locations || [],
      paginationMeta(limit, offset, count || 0),
      { maxAge: 300, staleWhileRevalidate: 600 }
    );
  } catch (err) {
    log.error('Unexpected error', {}, err instanceof Error ? err : undefined);
    return databaseError(err instanceof Error ? err : undefined, ROUTE);
  }
}
