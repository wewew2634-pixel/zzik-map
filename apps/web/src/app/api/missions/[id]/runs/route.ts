// ZZIK LIVE v4 - POST /api/missions/[id]/runs

import { handleApi } from "@/app/api/_utils/handleApi";
import { startMissionRun } from "@/core/missions/service";
import { validationError } from "@/core/errors/app-error";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  return handleApi(async () => {
    const missionId = params.id;

    // TODO: Get userId from authentication
    // For now, use a placeholder
    const userId = "temp-user-id";

    if (!userId) {
      throw validationError("User ID is required");
    }

    const run = await startMissionRun({ userId, missionId });

    return {
      missionRunId: run.id,
      status: run.status,
      expiresAt: run.expiresAt,
    };
  });
}
