/**
 * ZZIK MAP - Journeys API
 * V2: Zod validation + consistent responses
 */

import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getJourneysSchema, postJourneySchema } from '@/lib/validations/api';
import { success, cachedSuccess, created, validationError, notFound, databaseError } from '@/lib/api/response';
import { logger } from '@/lib/logger';

const ROUTE = '/api/journeys';

interface NextDestination {
  location_id: string;
  name: string;
  name_ko: string;
  category: string;
  journey_count: number;
  percentage: number;
}

// GET /api/journeys?from=locationId - Get journey recommendations
export async function GET(request: NextRequest) {
  const log = logger.api(ROUTE, 'GET');
  const timer = logger.time('GET /api/journeys');

  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const parseResult = getJourneysSchema.safeParse({
      from: searchParams.get('from') || undefined,
      limit: searchParams.get('limit') || undefined,
    });

    if (!parseResult.success) {
      return validationError(parseResult.error, ROUTE);
    }

    const { from: fromLocationId, limit } = parseResult.data;

    const supabase = createServiceClient();

    // Get source location info
    const { data: fromLocation, error: locError } = await supabase
      .from('locations')
      .select('name, name_ko, category')
      .eq('id', fromLocationId)
      .single();

    if (locError) {
      if (locError.code === 'PGRST116') {
        return notFound('Location', ROUTE);
      }
      log.error('Location lookup failed', { locationId: fromLocationId }, locError);
      return databaseError(locError, ROUTE);
    }

    // Get journey recommendations
    const { data: destinations, error: journeyError } = await supabase
      .rpc('find_next_destinations', {
        from_loc_id: fromLocationId,
        limit_count: limit
      });

    if (journeyError) {
      log.error('Journey RPC failed', { locationId: fromLocationId }, journeyError);
      return databaseError(journeyError, ROUTE);
    }

    // Get total journey count from this location
    const { data: patterns } = await supabase
      .from('journey_patterns')
      .select('journey_count')
      .eq('from_location_id', fromLocationId);

    const totalTravelers = patterns?.reduce((sum, p) => sum + (p.journey_count || 0), 0) || 0;

    timer.end({ locationId: fromLocationId, resultCount: destinations?.length || 0 });

    // Cache journey recommendations for 2 minutes (crowd-sourced data updates more frequently)
    return cachedSuccess({
      from: fromLocation,
      totalTravelers,
      recommendations: (destinations as NextDestination[] | null)?.map((dest) => ({
        locationId: dest.location_id,
        name: dest.name,
        nameKo: dest.name_ko,
        category: dest.category,
        travelerCount: dest.journey_count,
        percentage: dest.percentage
      })) || []
    }, undefined, { maxAge: 120, staleWhileRevalidate: 300 });
  } catch (err) {
    log.error('Unexpected error', {}, err instanceof Error ? err : undefined);
    return databaseError(err instanceof Error ? err : undefined, ROUTE);
  }
}

// POST /api/journeys - Record a new journey pattern
export async function POST(request: NextRequest) {
  const log = logger.api(ROUTE, 'POST');
  const timer = logger.time('POST /api/journeys');

  try {
    const body = await request.json();

    // Validate request body
    const parseResult = postJourneySchema.safeParse(body);

    if (!parseResult.success) {
      return validationError(parseResult.error, ROUTE);
    }

    const { fromLocationId, toLocationId } = parseResult.data;

    const supabase = createServiceClient();

    // Verify both locations exist
    const { data: locations, error: locError } = await supabase
      .from('locations')
      .select('id')
      .in('id', [fromLocationId, toLocationId]);

    if (locError) {
      log.error('Location verification failed', {}, locError);
      return databaseError(locError, ROUTE);
    }

    if (!locations || locations.length !== 2) {
      return notFound('One or both locations', ROUTE);
    }

    // Phase 1.4: 원자적 upsert로 경합 조건 방지
    // RPC 함수로 원자적 증가 연산 수행 (동시 요청 시에도 안전)
    const { data, error } = await supabase.rpc('upsert_journey_pattern', {
      p_from_location_id: fromLocationId,
      p_to_location_id: toLocationId
    });

    if (error) {
      // RPC가 없으면 fallback: 기존 패턴 조회 후 처리
      log.warn('RPC unavailable, using SELECT-then-UPDATE fallback', { error: error.message });

      // 기존 패턴 확인
      const { data: existing } = await supabase
        .from('journey_patterns')
        .select('id, journey_count')
        .eq('from_location_id', fromLocationId)
        .eq('to_location_id', toLocationId)
        .single();

      if (existing) {
        // 기존 패턴 업데이트 (Supabase에서 raw SQL 사용 불가하므로 read-then-write)
        const { data: updateData, error: updateError } = await supabase
          .from('journey_patterns')
          .update({ journey_count: (existing.journey_count || 0) + 1 })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateError) {
          log.error('Pattern update failed', { patternId: existing.id }, updateError);
          return databaseError(updateError, ROUTE);
        }

        timer.end({ action: 'fallback_increment', patternId: updateData?.id });
        return success(updateData);
      } else {
        // 새 패턴 생성
        const { data: insertData, error: insertError } = await supabase
          .from('journey_patterns')
          .insert({
            from_location_id: fromLocationId,
            to_location_id: toLocationId,
            journey_count: 1
          })
          .select()
          .single();

        if (insertError) {
          log.error('Pattern insert failed', {}, insertError);
          return databaseError(insertError, ROUTE);
        }

        timer.end({ action: 'fallback_create', patternId: insertData?.id });
        return created(insertData);
      }
    }

    // RPC 성공 시
    const result = Array.isArray(data) ? data[0] : data;
    timer.end({ action: 'atomic_upsert', result });
    return created(result)
  } catch (err) {
    log.error('Unexpected error', {}, err instanceof Error ? err : undefined);
    return databaseError(err instanceof Error ? err : undefined, ROUTE);
  }
}
