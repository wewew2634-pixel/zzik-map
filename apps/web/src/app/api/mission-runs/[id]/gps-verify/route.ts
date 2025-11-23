// ZZIK LIVE v4 - POST /api/mission-runs/[id]/gps-verify

import { handleApi } from "@/app/api/_utils/handleApi";
import { verifyGps } from "@/core/missions/steps/gps";
import { getUserIdFromRequestLoose } from "@/core/auth/jwt";
import { GpsVerifyBodySchema } from "@/core/missions/validation";
import { checkRateLimit, addRateLimitHeaders } from "@/middleware/ratelimit";
import { missionRunRateLimiter } from "@/lib/ratelimit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Authenticate user first
  const userId = getUserIdFromRequestLoose(req);

  // Check rate limit (10 requests per 5 min per user)
  const rateLimitResult = await checkRateLimit(
    `gps-verify:${userId}`,
    missionRunRateLimiter,
  );

  // Create headers with rate limit info
  const headers = new Headers();
  addRateLimitHeaders(headers, rateLimitResult);

  return handleApi(async () => {
    const { id: missionRunId } = await params;

    // Validate request body with Zod
    const body = GpsVerifyBodySchema.parse(await req.json());

    const updated = await verifyGps({
      missionRunId,
      userId,
      lat: body.lat,
      lng: body.lng,
      accuracy: body.accuracy,
      provider: body.provider,
      mocked: body.mocked,
      deviceId: body.deviceId,
      timestamp: body.timestamp ?? new Date().toISOString(),
    });

    return {
      id: updated.id,
      status: updated.status,
      gpsVerifiedAt: updated.gpsVerifiedAt,
    };
  }, { headers });
}
