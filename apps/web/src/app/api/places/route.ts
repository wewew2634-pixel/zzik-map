// ZZIK LIVE v4 - GET/POST /api/places

import { handleApi } from "../_utils/handleApi";
import { prisma } from "@/lib/prisma";
import { getCached, setCache } from "@/lib/redis";
import { getUserIdFromRequestLoose } from "@/core/auth/jwt";
import { z } from "zod";
import { checkRateLimit, addRateLimitHeaders, getClientIdentifier } from "@/middleware/ratelimit";
import { adminMutationRateLimiter, publicApiRateLimiter } from "@/lib/ratelimit";
import { logger } from "@/core/observability/logger";

const CACHE_KEY = "places:active";
const CACHE_TTL = 60; // 60 seconds

const CreatePlaceSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
});

/**
 * GET /api/places
 * List all places with optional distance filtering
 */
export async function GET(req: Request) {
  // Rate limit by IP for public API
  const clientId = getClientIdentifier(req);
  const rateLimitResult = await checkRateLimit(
    `public-api:places:${clientId}`,
    publicApiRateLimiter
  );

  const headers = new Headers();
  addRateLimitHeaders(headers, rateLimitResult);

  return handleApi(async () => {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const maxDistance = searchParams.get("maxDistance"); // in meters

    // If no location filtering, try cache
    if (!lat || !lng) {
      const cached = await getCached<{ places: unknown[] }>(CACHE_KEY);

      if (cached) {
        logger.debug({}, "Cache hit for active places");
        return cached;
      }
    }

    // Cache miss or distance filtering - fetch from database
    logger.debug({}, "Cache miss - fetching places from database");
    const places = await prisma.place.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        missions: {
          where: { status: "ACTIVE" },
          select: { id: true, title: true, rewardAmount: true },
        },
      },
    });

    let filteredPlaces = places;

    // Apply distance filtering if coordinates provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxDistanceMeters = maxDistance ? parseInt(maxDistance) : 5000; // default 5km

      filteredPlaces = places.filter((place) => {
        const distance = calculateDistance(
          userLat,
          userLng,
          place.latitude,
          place.longitude
        );
        return distance <= maxDistanceMeters;
      }).map((place) => ({
        ...place,
        distanceMeters: calculateDistance(
          userLat,
          userLng,
          place.latitude,
          place.longitude
        ),
      })).sort((a, b) => (a as any).distanceMeters - (b as any).distanceMeters);
    }

    const result = { places: filteredPlaces };

    // Set cache only if no filtering
    if (!lat && !lng) {
      setCache(CACHE_KEY, result, CACHE_TTL).catch((err) =>
        logger.warn({}, "Failed to set cache for active places", { error: err })
      );
    }

    return result;
  }, { headers });
}

/**
 * POST /api/places
 * Create a new place (admin-only)
 */
export async function POST(req: Request) {
  // Authenticate user
  const userId = getUserIdFromRequestLoose(req);

  // Check rate limit for admin mutations
  const rateLimitResult = await checkRateLimit(
    `admin-mutation:${userId}`,
    adminMutationRateLimiter,
  );

  const headers = new Headers();
  addRateLimitHeaders(headers, rateLimitResult);

  return handleApi(async () => {
    // Verify admin permission
    const { requirePermission } = await import("@/core/auth/rbac");
    await requirePermission(userId, "place:create");

    const body = CreatePlaceSchema.parse(await req.json());

    const place = await prisma.place.create({
      data: {
        name: body.name,
        category: body.category,
        latitude: body.latitude,
        longitude: body.longitude,
        address: body.address,
      },
    });

    return { place };
  }, { headers });
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
