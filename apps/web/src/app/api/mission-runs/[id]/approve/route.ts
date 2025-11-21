// ZZIK LIVE v4 - POST /api/mission-runs/[id]/approve

import { handleApi } from "@/app/api/_utils/handleApi";
import { approveMissionRunAndReward } from "@/core/missions/service";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  return handleApi(async () => {
    const missionRunId = params.id;

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
  });
}
