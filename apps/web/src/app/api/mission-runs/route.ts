// ZZIK LIVE v4 - GET/POST /api/mission-runs

import { handleApi } from "../_utils/handleApi";
import { startMissionRun } from "@/core/missions/service";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequestLoose } from "@/core/auth/jwt";
import { z } from "zod";
import { checkRateLimit, addRateLimitHeaders } from "@/middleware/ratelimit";
import { missionRunRateLimiter } from "@/lib/ratelimit";

const StartMissionRunSchema = z.object({
  missionId: z.string().uuid(),
});

/**
 * GET /api/mission-runs
 * List mission runs for the authenticated user
 */
export async function GET(req: Request) {
  return handleApi(async () => {
    const userId = getUserIdFromRequestLoose(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const missionId = searchParams.get("missionId");

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (missionId) {
      where.missionId = missionId;
    }

    const runs = await prisma.missionRun.findMany({
      where,
      include: {
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
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to most recent 50
    });

    return {
      runs: runs.map((r) => ({
        id: r.id,
        missionId: r.missionId,
        missionTitle: r.mission.title,
        placeName: r.mission.place.name,
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
    };
  });
}

/**
 * POST /api/mission-runs
 * Start a new mission run
 */
export async function POST(req: Request) {
  // Authenticate user first
  const userId = getUserIdFromRequestLoose(req);

  // Check rate limit (10 requests per 5 min per user)
  const rateLimitResult = await checkRateLimit(
    `mission-run-start:${userId}`,
    missionRunRateLimiter,
  );

  // Create headers with rate limit info
  const headers = new Headers();
  addRateLimitHeaders(headers, rateLimitResult);

  return handleApi(async () => {
    const body = StartMissionRunSchema.parse(await req.json());

    const run = await startMissionRun({
      userId,
      missionId: body.missionId,
    });

    return {
      run: {
        id: run.id,
        missionId: run.missionId,
        status: run.status,
        expiresAt: run.expiresAt,
        createdAt: run.createdAt,
      },
    };
  }, { headers });
}
