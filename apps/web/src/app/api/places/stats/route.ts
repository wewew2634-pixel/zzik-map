// ZZIK LIVE v4 - GET /api/places/stats
// Place statistics (public or filtered by place)

import { handleApi } from "../../_utils/handleApi";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/places/stats
 * Get place statistics
 * Query params:
 * - placeId: Filter by specific place ID
 */
export async function GET(req: Request) {
  return handleApi(async () => {
    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get("placeId");

    if (placeId) {
      // Get stats for specific place
      const place = await prisma.place.findUnique({
        where: { id: placeId },
        include: {
          missions: {
            select: {
              id: true,
              status: true,
              _count: {
                select: {
                  missionRuns: true,
                },
              },
            },
          },
        },
      });

      if (!place) {
        const { AppError } = await import("@/core/errors/app-error");
        throw new AppError("PLACE_NOT_FOUND", "Place not found", 404);
      }

      const totalMissions = place.missions.length;
      const activeMissions = place.missions.filter(
        (m) => m.status === "ACTIVE"
      ).length;
      const totalRuns = place.missions.reduce(
        (sum, m) => sum + m._count.missionRuns,
        0
      );

      return {
        stats: {
          placeId: place.id,
          placeName: place.name,
          category: place.category,
          missions: {
            total: totalMissions,
            active: activeMissions,
          },
          missionRuns: {
            total: totalRuns,
          },
          isGold: place.isGold,
          successRate: place.successRate,
        },
      };
    }

    // Get aggregated stats for all places
    const [totalPlaces, totalMissions, totalRuns] = await Promise.all([
      prisma.place.count(),
      prisma.mission.count(),
      prisma.missionRun.count(),
    ]);

    // Get top places by mission count
    const topPlaces = await prisma.place.findMany({
      take: 10,
      include: {
        _count: {
          select: {
            missions: true,
          },
        },
      },
      orderBy: {
        missions: {
          _count: "desc",
        },
      },
    });

    return {
      stats: {
        overview: {
          totalPlaces,
          totalMissions,
          totalMissionRuns: totalRuns,
        },
        topPlaces: topPlaces.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          missionsCount: p._count.missions,
          isGold: p.isGold,
        })),
      },
    };
  });
}
