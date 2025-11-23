// ZZIK LIVE v4 - GET /api/admin/mission-runs
// Admin dashboard: List mission runs pending review

import { handleApi } from "../../_utils/handleApi";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequestLoose } from "@/core/auth/jwt";

export async function GET(req: Request) {
  return handleApi(async () => {
    // Authenticate user and verify admin role
    const userId = getUserIdFromRequestLoose(req);
    const { requireAdmin } = await import("@/core/auth/rbac");
    await requireAdmin(userId);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING_REVIEW";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};

    if (status) {
      where.status = status;
    }

    // Get total count
    const total = await prisma.missionRun.count({ where });

    // Get paginated results
    const runs = await prisma.missionRun.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        mission: {
          select: {
            id: true,
            title: true,
            rewardAmount: true,
            verificationSpec: true,
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
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    return {
      runs: runs.map((r) => ({
        id: r.id,
        userId: r.userId,
        userName: r.user.name,
        userEmail: r.user.email,
        missionId: r.missionId,
        missionTitle: r.mission.title,
        placeName: r.mission.place.name,
        placeCategory: r.mission.place.category,
        expectedReward: r.mission.rewardAmount,
        status: r.status,
        gpsVerifiedAt: r.gpsVerifiedAt,
        qrVerifiedAt: r.qrVerifiedAt,
        reelsUploadedAt: r.reelsUploadedAt,
        reviewedAt: r.reviewedAt,
        rewardedAt: r.rewardedAt,
        rewardAmount: r.rewardAmount,
        expiresAt: r.expiresAt,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  });
}
