// ZZIK LIVE v4 - POST /api/admin/mission-runs/[id]/reject
// Admin action: Reject a mission run

import { handleApi } from "@/app/api/_utils/handleApi";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequestLoose } from "@/core/auth/jwt";
import { AppError } from "@/core/errors/app-error";
import { z } from "zod";
import { checkRateLimit, addRateLimitHeaders } from "@/middleware/ratelimit";
import { adminMutationRateLimiter } from "@/lib/ratelimit";

const RejectMissionRunSchema = z.object({
  reason: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Authenticate user first
  const adminId = getUserIdFromRequestLoose(req);

  // Check rate limit for admin mutations
  const rateLimitResult = await checkRateLimit(
    `admin-mutation:${adminId}`,
    adminMutationRateLimiter,
  );

  const headers = new Headers();
  addRateLimitHeaders(headers, rateLimitResult);

  return handleApi(async () => {
    const { id: missionRunId } = await params;

    // Verify admin role
    const { requireAdmin } = await import("@/core/auth/rbac");
    await requireAdmin(adminId);

    const body = RejectMissionRunSchema.parse(await req.json());

    // Check if mission run exists
    const run = await prisma.missionRun.findUnique({
      where: { id: missionRunId },
      include: {
        mission: true,
      },
    });

    if (!run) {
      throw new AppError("MISSION_RUN_NOT_FOUND", "Mission run not found", 404);
    }

    // Can only reject runs in PENDING_REVIEW state
    if (run.status !== "PENDING_REVIEW") {
      throw new AppError(
        "MISSION_RUN_INVALID_STATE",
        `Mission run must be in PENDING_REVIEW state to reject (current: ${run.status})`,
        400
      );
    }

    // Update mission run to REJECTED
    const updated = await prisma.missionRun.update({
      where: { id: missionRunId },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        activeLockKey: null, // Clear lock so user can try again
      },
    });

    return {
      missionRun: {
        id: updated.id,
        status: updated.status,
        reviewedAt: updated.reviewedAt,
      },
      message: "Mission run rejected successfully",
    };
  }, { headers });
}
