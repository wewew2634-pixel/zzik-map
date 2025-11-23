// ZZIK LIVE v4 - POST /api/mission-runs/[id]/approve

import { handleApi } from "@/app/api/_utils/handleApi";
import { approveMissionRunAndReward } from "@/core/missions/service";
import { getUserIdFromRequestLoose } from "@/core/auth/jwt";
import { checkRateLimit, addRateLimitHeaders } from "@/middleware/ratelimit";
import { adminMutationRateLimiter } from "@/lib/ratelimit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Authenticate user first
  const userId = getUserIdFromRequestLoose(req);

  // Check rate limit for admin mutations
  const rateLimitResult = await checkRateLimit(
    `admin-mutation:${userId}`,
    adminMutationRateLimiter,
  );

  const headers = new Headers();
  addRateLimitHeaders(headers, rateLimitResult);

  return handleApi(async () => {
    const { id: missionRunId } = await params;

    // Verify permission
    const { requirePermission } = await import("@/core/auth/rbac");
    await requirePermission(userId, "mission:approve");

    // Generate idempotency key from request headers or body
    const idempotencyKey = req.headers.get("idempotency-key") ?? crypto.randomUUID();

    const result = await approveMissionRunAndReward({
      missionRunId,
      idempotencyKey,
    });

    return {
      missionRun: result.run,
      transaction: result.tx,
    };
  }, { headers });
}
