// ZZIK LIVE v4 - Reels Verification Step

import { prisma } from "@/lib/prisma";
import { logger } from "@/core/observability/logger";
import { assertNotExpired, assertStatus } from "../state";
import { AppError } from "@/core/errors/app-error";
import { ReelsMetadata } from "@/core/reels/types";
import { verifyReelsUrl, verifyReelsHashtags } from "@/core/reels/verify";

export type VerifyReelsInput = {
  missionRunId: string;
  userId: string;
  metadata: ReelsMetadata;
};

export async function verifyReels(input: VerifyReelsInput) {
  const { missionRunId, userId, metadata } = input;
  const traceId = crypto.randomUUID();

  logger.info(
    { traceId, userId, missionRunId, metadata },
    "mission_run.reels.verify.start",
  );

  const run = await prisma.missionRun.findUnique({
    where: { id: missionRunId },
    include: { mission: { include: { place: true } } },
  });

  if (!run) {
    throw new AppError("MISSION_RUN_NOT_FOUND", "Mission run not found", 404);
  }

  if (run.userId !== userId) {
    throw new AppError(
      "PERMISSION_DENIED",
      "User not authorized for this mission run",
      403,
    );
  }

  assertNotExpired(run);
  assertStatus(run, "PENDING_REELS");

  // 1) URL 검증
  const urlResult = verifyReelsUrl(metadata);
  if (!urlResult.ok) {
    throw new AppError(
      "VALIDATION_ERROR",
      urlResult.reason ?? "Invalid reels URL",
      400,
    );
  }

  // 2) 해시태그 검증
  const hashtagResult = verifyReelsHashtags(metadata, {
    missionId: run.missionId,
    placeId: run.mission.placeId,
    missionRunId: run.id,
  });

  if (!hashtagResult.ok) {
    throw new AppError(
      "VALIDATION_ERROR",
      hashtagResult.reason ?? "Invalid reels hashtags",
      400,
    );
  }

  // TODO: 나중에 실제 플랫폼 API 호출하여 영상 존재 여부/길이/게시 시간 검증

  const updateResult = await prisma.missionRun.updateMany({
    where: {
      id: run.id,
      status: "PENDING_REELS",  // Prevent race condition
    },
    data: {
      status: "PENDING_REVIEW",
      reelsUploadedAt: new Date(),
    },
  });

  if (updateResult.count === 0) {
    throw new AppError(
      "MISSION_RUN_INVALID_STATE",
      "Mission run state changed during Reels verification",
      409,
    );
  }

  const updated = await prisma.missionRun.findUniqueOrThrow({
    where: { id: run.id },
    include: { mission: { include: { place: true } } },
  });

  logger.info(
    { traceId, userId, missionRunId },
    "mission_run.reels.verify.success",
  );

  return updated;
}
