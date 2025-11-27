/**
 * ZZIK MAP - Photos API
 * V2: Zod validation + consistent responses
 */

import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getPhotosSchema, postPhotoSchema } from '@/lib/validations/api';
import { success, created, validationError, databaseError, paginationMeta } from '@/lib/api/response';
import { logger } from '@/lib/logger';

const ROUTE = '/api/photos';

// GET /api/photos - List photos with filtering
export async function GET(request: NextRequest) {
  const log = logger.api(ROUTE, 'GET');
  const timer = logger.time('GET /api/photos');

  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const parseResult = getPhotosSchema.safeParse({
      location: searchParams.get('location') || undefined,
      status: searchParams.get('status') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    });

    if (!parseResult.success) {
      return validationError(parseResult.error, ROUTE);
    }

    const { location: locationId, status, limit, offset } = parseResult.data;

    const supabase = createServiceClient();

    // Build query with count
    let query = supabase
      .from('photos')
      .select(`
        id,
        storage_path,
        thumbnail_path,
        latitude,
        longitude,
        gps_source,
        gps_confidence,
        camera_make,
        camera_model,
        taken_at,
        status,
        vibe_analysis,
        created_at,
        location:locations(id, name, name_ko, category)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: photos, error, count } = await query;

    if (error) {
      log.error('Database query failed', {}, error);
      return databaseError(error, ROUTE);
    }

    timer.end({ resultCount: photos?.length || 0 });

    return success(
      photos || [],
      paginationMeta(limit, offset, count || 0)
    );
  } catch (err) {
    log.error('Unexpected error', {}, err instanceof Error ? err : undefined);
    return databaseError(err instanceof Error ? err : undefined, ROUTE);
  }
}

// POST /api/photos - Create new photo record
export async function POST(request: NextRequest) {
  const log = logger.api(ROUTE, 'POST');
  const timer = logger.time('POST /api/photos');

  try {
    const body = await request.json();

    // Validate request body
    const parseResult = postPhotoSchema.safeParse(body);

    if (!parseResult.success) {
      return validationError(parseResult.error, ROUTE);
    }

    const {
      storagePath,
      thumbnailPath,
      latitude,
      longitude,
      gpsSource,
      gpsConfidence,
      cameraMake,
      cameraModel,
      takenAt,
      locationId
    } = parseResult.data;

    const supabase = createServiceClient();

    const { data: photo, error } = await supabase
      .from('photos')
      .insert({
        storage_path: storagePath,
        thumbnail_path: thumbnailPath,
        latitude,
        longitude,
        gps_source: gpsSource,
        gps_confidence: gpsConfidence,
        camera_make: cameraMake,
        camera_model: cameraModel,
        taken_at: takenAt,
        location_id: locationId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      log.error('Photo insert failed', {}, error);
      return databaseError(error, ROUTE);
    }

    timer.end({ photoId: photo.id });
    return created(photo);
  } catch (err) {
    log.error('Unexpected error', {}, err instanceof Error ? err : undefined);
    return databaseError(err instanceof Error ? err : undefined, ROUTE);
  }
}
