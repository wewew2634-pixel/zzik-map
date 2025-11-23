// ZZIK LIVE v4 - POST /api/mission-runs/[id]/reels-verify

import { handleApi } from "@/app/api/_utils/handleApi";
import { verifyReels } from "@/core/missions/steps/reels";
import { getUserIdFromRequestLoose } from "@/core/auth/jwt";
import { ReelsVerifyBodySchema } from "@/core/missions/validation";
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
    `reels-verify:${userId}`,
    missionRunRateLimiter,
  );

  // Create headers with rate limit info
  const headers = new Headers();
  addRateLimitHeaders(headers, rateLimitResult);

  return handleApi(async () => {
    const { id: missionRunId } = await params;

    // Validate request body with Zod
    const body = ReelsVerifyBodySchema.parse(await req.json());

    const updated = await verifyReels({
      missionRunId,
      userId,
      metadata: body.metadata,
    });

    return {
      id: updated.id,
      status: updated.status,
      reelsUploadedAt: updated.reelsUploadedAt,
    };
  }, { headers });
}
