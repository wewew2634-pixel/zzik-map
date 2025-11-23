// ZZIK LIVE v4 - GET/POST /api/missions

import { handleApi } from "../_utils/handleApi";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequestLoose } from "@/core/auth/jwt";
import { AppError } from "@/core/errors/app-error";
import { z } from "zod";
import { getCached, setCache } from "@/lib/redis";
import { checkRateLimit, addRateLimitHeaders, getClientIdentifier } from "@/middleware/ratelimit";
import { adminMutationRateLimiter, publicApiRateLimiter } from "@/lib/ratelimit";
import { logger } from "@/core/observability/logger";

const CACHE_KEY_ACTIVE = "missions:active";
const CACHE_TTL = 30; // 30 seconds

// Validation schema for creating missions
const CreateMissionSchema = z.object({
  placeId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  rewardAmount: z.number().int().min(0).max(1000000),
  verificationSpec: z.object({
    steps: z.array(z.enum(["GPS", "QR", "REELS"])),
    gps: z.boolean().optional(),
    qr: z.boolean().optional(),
    reels: z.boolean().optional(),
  }),
  maxRunsPerUser: z.number().int().min(1).optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
});

/**
 * GET /api/missions
 * List all active missions with optional filters
 */
export async function GET(req: Request) {
  // Rate limit by IP for public API
  const clientId = getClientIdentifier(req);
  const rateLimitResult = await checkRateLimit(
    `public-api:missions:${clientId}`,
    publicApiRateLimiter
  );

  const headers = new Headers();
  addRateLimitHeaders(headers, rateLimitResult);

  return handleApi(async () => {
    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get("placeId");
    const status = searchParams.get("status") || "ACTIVE";
    const userId = searchParams.get("userId"); // For filtering user's missions

    // Try cache for active missions without filters
    if (status === "ACTIVE" && !placeId && !userId) {
      const cached = await getCached<{ missions: unknown[] }>(CACHE_KEY_ACTIVE);
      if (cached) {
        logger.debug({}, "Cache hit for active missions");
        return cached;
      }
    }

    const where: any = {};

    if (placeId) {
      where.placeId = placeId;
    }

    if (status) {
      where.status = status;
    }

    const missions = await prisma.mission.findMany({
      where,
      include: {
        place: {
          select: {
            id: true,
            name: true,
            category: true,
            latitude: true,
            longitude: true,
          },
        },
        ...(userId && {
          runs: {
            where: { userId },
            select: {
              id: true,
              status: true,
              gpsVerifiedAt: true,
              qrVerifiedAt: true,
              reelsUploadedAt: true,
              reviewedAt: true,
              rewardedAt: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        }),
      },
      orderBy: [
        { status: "asc" }, // ACTIVE first
        { createdAt: "desc" },
      ],
    });

    const result = {
      missions: missions.map((m) => ({
        id: m.id,
        placeId: m.placeId,
        placeName: m.place.name,
        placeCategory: m.place.category,
        placeLatitude: m.place.latitude,
        placeLongitude: m.place.longitude,
        title: m.title,
        description: m.description,
        rewardAmount: m.rewardAmount,
        verificationSpec: m.verificationSpec,
        maxRunsPerUser: m.maxRunsPerUser,
        status: m.status,
        startAt: m.startAt,
        endAt: m.endAt,
        createdAt: m.createdAt,
        ...(userId && { currentRun: (m as any).runs?.[0] }),
      })),
    };

    // Cache active missions without filters
    if (status === "ACTIVE" && !placeId && !userId) {
      setCache(CACHE_KEY_ACTIVE, result, CACHE_TTL).catch((err) =>
        logger.warn({}, "Failed to set cache for active missions", { error: err })
      );
    }

    return result;
  }, { headers });
}

/**
 * POST /api/missions
 * Create a new mission (admin-only)
 */
export async function POST(req: Request) {
  return handleApi(async () => {
    // Authenticate user first
    const userId = getUserIdFromRequestLoose(req);

    // Check rate limit for admin mutations
    const rateLimitResult = await checkRateLimit(
      `admin-mutation:${userId}`,
      adminMutationRateLimiter,
    );

    const headers = new Headers();
    addRateLimitHeaders(headers, rateLimitResult);

    // Verify permission
    const { requirePermission } = await import("@/core/auth/rbac");
    await requirePermission(userId, "mission:create");

    const body = CreateMissionSchema.parse(await req.json());

    // Verify place exists
    const place = await prisma.place.findUnique({
      where: { id: body.placeId },
    });

    if (!place) {
      throw new AppError("PLACE_NOT_FOUND", "Place not found", 404);
    }

    // Create mission
    const mission = await prisma.mission.create({
      data: {
        placeId: body.placeId,
        title: body.title,
        description: body.description,
        rewardAmount: body.rewardAmount,
        verificationSpec: body.verificationSpec,
        maxRunsPerUser: body.maxRunsPerUser,
        status: "ACTIVE",
        startAt: body.startAt ? new Date(body.startAt) : new Date(),
        endAt: body.endAt ? new Date(body.endAt) : null,
      },
      include: {
        place: {
          select: {
            id: true,
            name: true,
            category: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    return {
      mission: {
        id: mission.id,
        placeId: mission.placeId,
        placeName: mission.place.name,
        placeCategory: mission.place.category,
        title: mission.title,
        description: mission.description,
        rewardAmount: mission.rewardAmount,
        verificationSpec: mission.verificationSpec,
        maxRunsPerUser: mission.maxRunsPerUser,
        status: mission.status,
        startAt: mission.startAt,
        endAt: mission.endAt,
        createdAt: mission.createdAt,
      },
    };
  });
}
