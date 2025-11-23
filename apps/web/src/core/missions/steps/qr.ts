// ZZIK LIVE v4 - QR Verification Step

import { prisma } from "@/lib/prisma";
import { logger } from "@/core/observability/logger";
import {
  assertNotExpired,
  assertStatus,
  parseVerificationSpec,
} from "../state";
import { AppError } from "@/core/errors/app-error";
import { parseZzikQrPayload, verifyQrSignature } from "@/core/qr/verify";

export type VerifyQrInput = {
  missionRunId: string;
  userId: string;
  rawPayload: string; // 모바일에서 읽은 QR content
};

export async function verifyQr(input: VerifyQrInput) {
  const { missionRunId, userId, rawPayload } = input;
  const traceId = crypto.randomUUID();

  logger.info({ traceId, userId, missionRunId }, "mission_run.qr.verify.start");

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
  assertStatus(run, "PENDING_QR");

  const spec = parseVerificationSpec(run.mission);
  if (spec.qr !== true) {
    throw new AppError(
      "MISSION_RUN_INVALID_STATE",
      "Mission does not require QR verification",
      400,
    );
  }

  // 1) QR 파싱
  let payload;
  try {
    payload = parseZzikQrPayload(rawPayload);
  } catch (e) {
    throw new AppError("VALIDATION_ERROR", "Invalid QR payload", 400, e);
  }

  // 2) missionId/placeId 매칭
  if (
    payload.missionId !== run.missionId ||
    payload.placeId !== run.mission.placeId
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      "QR payload does not match mission/place",
      400,
    );
  }

  // 3) HMAC 서명 검증
  const ok = verifyQrSignature(payload);
  if (!ok) {
    throw new AppError(
      "VALIDATION_ERROR",
      "QR signature verification failed",
      400,
    );
  }

  // 4) Nonce replay attack 방지
  const existingNonce = await prisma.qrNonce.findUnique({
    where: { nonce: payload.nonce },
  });

  if (existingNonce) {
    if (existingNonce.usedAt) {
      throw new AppError(
        "VALIDATION_ERROR",
        "QR code already used (replay attack detected)",
        400,
      );
    }
    if (existingNonce.expiresAt < new Date()) {
      throw new AppError(
        "VALIDATION_ERROR",
        "QR code expired",
        400,
      );
    }
    // Mark as used
    await prisma.qrNonce.update({
      where: { nonce: payload.nonce },
      data: {
        usedAt: new Date(),
        usedBy: userId,
      },
    });
  } else {
    throw new AppError(
      "VALIDATION_ERROR",
      "QR code not found or invalid",
      404,
    );
  }

  // 5) 다음 상태 결정
  const nextStatus = spec.reels === true ? "PENDING_REELS" : "PENDING_REVIEW";

  const updateResult = await prisma.missionRun.updateMany({
    where: {
      id: run.id,
      status: "PENDING_QR",  // Prevent race condition
    },
    data: {
      status: nextStatus,
      qrVerifiedAt: new Date(),
    },
  });

  if (updateResult.count === 0) {
    throw new AppError(
      "MISSION_RUN_INVALID_STATE",
      "Mission run state changed during QR verification",
      409,
    );
  }

  const updated = await prisma.missionRun.findUniqueOrThrow({
    where: { id: run.id },
    include: { mission: { include: { place: true } } },
  });

  logger.info(
    {
      traceId,
      userId,
      missionRunId,
      nextStatus,
    },
    "mission_run.qr.verify.success",
  );

  return updated;
}
