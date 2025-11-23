// ZZIK LIVE v4 - GET/PATCH/DELETE /api/places/[id]

import { handleApi } from "../../_utils/handleApi";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequestLoose } from "@/core/auth/jwt";
import { AppError } from "@/core/errors/app-error";
import { z } from "zod";
import { checkRateLimit, addRateLimitHeaders } from "@/middleware/ratelimit";
import { adminMutationRateLimiter } from "@/lib/ratelimit";

const UpdatePlaceSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  category: z.string().min(1).max(100).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().optional(),
});

/**
 * GET /api/places/[id]
 * Get a single place by ID
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApi(async () => {
    const { id } = await params;

    const place = await prisma.place.findUnique({
      where: { id },
      include: {
        missions: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            title: true,
            rewardAmount: true,
            verificationSpec: true,
            startAt: true,
            endAt: true,
          },
        },
        _count: {
          select: {
            missions: true,
          },
        },
      },
    });

    if (!place) {
      throw new AppError("PLACE_NOT_FOUND", "Place not found", 404);
    }

    return { place };
  });
}

/**
 * PATCH /api/places/[id]
 * Update a place (admin-only)
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
    await requirePermission(userId, "place:update");

    const body = UpdatePlaceSchema.parse(await req.json());

    // Check if place exists
    const existing = await prisma.place.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError("PLACE_NOT_FOUND", "Place not found", 404);
    }

    // Update place
    const place = await prisma.place.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.latitude !== undefined && { latitude: body.latitude }),
        ...(body.longitude !== undefined && { longitude: body.longitude }),
        ...(body.address !== undefined && { address: body.address }),
      },
    });

    return { place };
  }, { headers });
}

/**
 * DELETE /api/places/[id]
 * Delete a place (admin-only)
 * WARNING: This will also delete all associated missions
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
    await requirePermission(userId, "place:delete");

    // Check if place exists
    const existing = await prisma.place.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            missions: true,
          },
        },
      },
    });

    if (!existing) {
      throw new AppError("PLACE_NOT_FOUND", "Place not found", 404);
    }

    // Delete place (missions will be cascade deleted)
    await prisma.place.delete({
      where: { id },
    });

    return {
      success: true,
      message: `Place deleted successfully (${existing._count.missions} missions also deleted)`,
    };
  }, { headers });
}
