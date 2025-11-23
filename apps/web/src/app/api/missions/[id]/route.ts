// ZZIK LIVE v4 - GET/PATCH/DELETE /api/missions/[id]

import { handleApi } from "../../_utils/handleApi";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequestLoose } from "@/core/auth/jwt";
import { AppError } from "@/core/errors/app-error";
import { z } from "zod";
import { checkRateLimit, addRateLimitHeaders } from "@/middleware/ratelimit";
import { adminMutationRateLimiter } from "@/lib/ratelimit";

const UpdateMissionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  rewardAmount: z.number().int().min(0).max(1000000).optional(),
  maxRunsPerUser: z.number().int().min(1).optional(),
  status: z.enum(["ACTIVE", "PAUSED", "ENDED"]).optional(),
  endAt: z.string().datetime().nullable().optional(),
});

/**
 * GET /api/missions/[id]
 * Get a single mission by ID
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApi(async () => {
    const { id } = await params;

    const mission = await prisma.mission.findUnique({
      where: { id },
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
        _count: {
          select: {
            missionRuns: true, // Total runs count
          },
        },
      },
    });

    if (!mission) {
      throw new AppError("MISSION_NOT_FOUND", "Mission not found", 404);
    }

    return {
      mission: {
        id: mission.id,
        placeId: mission.placeId,
        placeName: mission.place.name,
        placeCategory: mission.place.category,
        placeLatitude: mission.place.latitude,
        placeLongitude: mission.place.longitude,
        title: mission.title,
        description: mission.description,
        rewardAmount: mission.rewardAmount,
        verificationSpec: mission.verificationSpec,
        maxRunsPerUser: mission.maxRunsPerUser,
        status: mission.status,
        startAt: mission.startAt,
        endAt: mission.endAt,
        createdAt: mission.createdAt,
        totalRuns: mission._count.missionRuns,
      },
    };
  });
}

/**
 * PATCH /api/missions/[id]
 * Update a mission (admin-only)
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
    await requirePermission(userId, "mission:update");

    const body = UpdateMissionSchema.parse(await req.json());

    // Check if mission exists
    const existing = await prisma.mission.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError("MISSION_NOT_FOUND", "Mission not found", 404);
    }

    // Update mission
    const mission = await prisma.mission.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.rewardAmount !== undefined && { rewardAmount: body.rewardAmount }),
        ...(body.maxRunsPerUser !== undefined && {
          maxRunsPerUser: body.maxRunsPerUser,
        }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.endAt !== undefined && {
          endAt: body.endAt ? new Date(body.endAt) : null,
        }),
      },
      include: {
        place: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    return {
      mission: {
        id: mission.id,
        placeId: mission.placeId,
        placeName: mission.place.name,
        title: mission.title,
        description: mission.description,
        rewardAmount: mission.rewardAmount,
        verificationSpec: mission.verificationSpec,
        maxRunsPerUser: mission.maxRunsPerUser,
        status: mission.status,
        startAt: mission.startAt,
        endAt: mission.endAt,
        updatedAt: mission.updatedAt,
      },
    };
  }, { headers });
}

/**
 * DELETE /api/missions/[id]
 * Soft delete a mission (admin-only)
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
    await requirePermission(userId, "mission:delete");

    // Check if mission exists
    const existing = await prisma.mission.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError("MISSION_NOT_FOUND", "Mission not found", 404);
    }

    // Soft delete by setting status to ENDED
    await prisma.mission.update({
      where: { id },
      data: { status: "ENDED" },
    });

    return {
      success: true,
      message: "Mission ended successfully",
    };
  }, { headers });
}
