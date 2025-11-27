/**
 * ZZIK MAP - Single Location API
 * V2: Zod validation + consistent responses
 */

import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getLocationByIdSchema } from '@/lib/validations/api';
import { cachedSuccess, validationError, notFound, databaseError } from '@/lib/api/response';
import { logger } from '@/lib/logger';

const ROUTE = '/api/locations/[id]';

// GET /api/locations/[id] - Get single location with journey recommendations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const log = logger.api(ROUTE, 'GET');
  const timer = logger.time('GET /api/locations/[id]');

  try {
    const { id } = await params;

    // Validate UUID
    const parseResult = getLocationByIdSchema.safeParse({ id });

    if (!parseResult.success) {
      return validationError(parseResult.error, ROUTE);
    }

    const supabase = createServiceClient();

    // Get location details
    const { data: location, error: locationError } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();

    if (locationError) {
      if (locationError.code === 'PGRST116') {
        return notFound('Location', ROUTE);
      }
      log.error('Database query failed', { locationId: id }, locationError);
      return databaseError(locationError, ROUTE);
    }

    // Get journey recommendations using stored function
    const { data: nextDestinations, error: journeyError } = await supabase
      .rpc('find_next_destinations', {
        from_loc_id: id,
        limit_count: 5
      });

    if (journeyError) {
      log.warn('Journey lookup failed', { locationId: id }, journeyError);
    }

    timer.end({ locationId: id });

    // Cache single location for 5 minutes
    return cachedSuccess({
      ...location,
      nextDestinations: nextDestinations || []
    }, undefined, { maxAge: 300, staleWhileRevalidate: 600 });
  } catch (err) {
    log.error('Unexpected error', {}, err instanceof Error ? err : undefined);
    return databaseError(err instanceof Error ? err : undefined, ROUTE);
  }
}
