// ZZIK LIVE v4 - GET /api/admin/system/stats
// System-wide statistics for admin dashboard

import { handleApi } from "../../../_utils/handleApi";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequestLoose } from "@/core/auth/jwt";

/**
 * GET /api/admin/system/stats
 * Get system-wide statistics (admin-only)
 */
export async function GET(req: Request) {
  return handleApi(async () => {
    // Authenticate and authorize
    const userId = getUserIdFromRequestLoose(req);
    const { requireAdmin } = await import("@/core/auth/rbac");
    await requireAdmin(userId);

    // Get counts
    const [
      totalUsers,
      totalPlaces,
      totalMissions,
      activeMissions,
      totalMissionRuns,
      pendingRuns,
      approvedRuns,
      rejectedRuns,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.place.count(),
      prisma.mission.count(),
      prisma.mission.count({ where: { status: "ACTIVE" } }),
      prisma.missionRun.count(),
      prisma.missionRun.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.missionRun.count({ where: { status: "APPROVED" } }),
      prisma.missionRun.count({ where: { status: "REJECTED" } }),
    ]);

    // Get recent activity (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRuns = await prisma.missionRun.count({
      where: {
        createdAt: {
          gte: oneDayAgo,
        },
      },
    });

    return {
      stats: {
        users: {
          total: totalUsers,
        },
        places: {
          total: totalPlaces,
        },
        missions: {
          total: totalMissions,
          active: activeMissions,
        },
        missionRuns: {
          total: totalMissionRuns,
          pending: pendingRuns,
          approved: approvedRuns,
          rejected: rejectedRuns,
          last24Hours: recentRuns,
        },
        timestamp: new Date().toISOString(),
      },
    };
  });
}
