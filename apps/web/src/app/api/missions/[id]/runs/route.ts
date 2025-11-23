// ZZIK LIVE v4 - POST /api/missions/[id]/runs

import { handleApi } from "@/app/api/_utils/handleApi";
import { startMissionRun } from "@/core/missions/service";
import { getUserIdFromRequestLoose } from "@/core/auth/jwt";
import {
  StartMissionRunBodySchema,
  StartMissionRunParamsSchema,
} from "@/core/missions/validation";
import { checkRateLimit, addRateLimitHeaders } from "@/middleware/ratelimit";
import { missionRunRateLimiter } from "@/lib/ratelimit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Authenticate user first
  const userId = getUserIdFromRequestLoose(req);

  // Check rate limit (10 runs per 5 min per user)
  const rateLimitResult = await checkRateLimit(
    `mission-start:${userId}`,
    missionRunRateLimiter,
  );

  // Create headers with rate limit info
  const headers = new Headers();
  addRateLimitHeaders(headers, rateLimitResult);

  return handleApi(async () => {
    const rawParams = await params;
    const parsedParams = StartMissionRunParamsSchema.parse({
      missionId: rawParams.id,
    });
    StartMissionRunBodySchema.parse(
      await req
        .json()
        .catch(() => ({})),
    );

    const run = await startMissionRun({
      userId,
      missionId: parsedParams.missionId,
    });

    return {
      id: run.id,
      missionId: run.missionId,
      status: run.status,
      expiresAt: run.expiresAt?.toISOString() ?? null,
      activeLockKey: run.activeLockKey ?? null,
      createdAt: run.createdAt.toISOString(),
      updatedAt: run.updatedAt.toISOString(),
    };
  }, { headers });
}

