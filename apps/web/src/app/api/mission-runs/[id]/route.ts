// ZZIK LIVE v4 - GET /api/mission-runs/[id]

import { handleApi } from "@/app/api/_utils/handleApi";
import { getUserIdFromRequestLoose } from "@/core/auth/jwt";
import { getMissionRunStatus } from "@/core/missions/query";
import { MissionRunIdSchema } from "@/core/missions/validation";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleApi(async () => {
    const rawParams = await params;
    const { missionRunId } = MissionRunIdSchema.parse({
      missionRunId: rawParams.id,
    });
    const userId = getUserIdFromRequestLoose(req);
    return getMissionRunStatus(missionRunId, userId);
  });
}