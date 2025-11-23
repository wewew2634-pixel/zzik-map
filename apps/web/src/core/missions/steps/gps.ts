// ZZIK LIVE v4 - GPS Verification Step

import { prisma } from "@/lib/prisma";
import { logger } from "@/core/observability/logger";
import {
  assertNotExpired,
  assertStatus,
  parseVerificationSpec,
} from "../state";
import { AppError } from "@/core/errors/app-error";
import { haversineDistanceMeters } from "@/core/gps/distance";
import { GpsVerificationConfig } from "@/core/gps/config";
import {
  getGpsAntiSpoofAdapter,
  GpsAntiSpoofInput,
} from "@/core/gps/antiSpoof";

export type VerifyGpsInput = {
  missionRunId: string;
  userId: string;
  lat: number;
  lng: number;
  accuracy: number; // meters
  provider?: string;
  mocked?: boolean;
  deviceId?: string;
  timestamp: string; // ISO string from client
};

export async function verifyGps(input: VerifyGpsInput) {
  const {
    missionRunId,
    userId,
    lat,
    lng,
    accuracy,
    provider,
    mocked,
    deviceId,
    timestamp,
  } = input;

  const traceId = crypto.randomUUID();

  logger.info(
    { traceId, userId, missionRunId, lat, lng, accuracy },
    "mission_run.gps.verify.start",
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
  assertStatus(run, "PENDING_GPS");

  const spec = parseVerificationSpec(run.mission);
  if (spec.gps !== true) {
    throw new AppError(
      "MISSION_RUN_INVALID_STATE",
      "Mission does not require GPS verification",
      400,
    );
  }

  // 1) timestamp freshness 체크
  const clientTs = new Date(timestamp);
  if (
    Number.isNaN(clientTs.getTime()) ||
    Date.now() - clientTs.getTime() > GpsVerificationConfig.MAX_AGE_MS
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      "GPS timestamp too old or invalid",
      400,
    );
  }

  // 2) accuracy 체크
  if (accuracy <= 0 || accuracy > GpsVerificationConfig.MAX_ACCURACY_METERS) {
    throw new AppError(
      "VALIDATION_ERROR",
      `GPS accuracy too low: ${accuracy}m`,
      400,
    );
  }

  // 3) 거리 계산
  const place = run.mission.place;
  const distance = haversineDistanceMeters(
    lat,
    lng,
    place.latitude,
    place.longitude,
  );

  if (distance - accuracy > GpsVerificationConfig.MAX_DISTANCE_METERS) {
    logger.warn(
      {
        traceId,
        userId,
        missionRunId,
        distance,
        accuracy,
      },
      "mission_run.gps.verify.too_far",
    );
    throw new AppError(
      "VALIDATION_ERROR",
      `Too far from place: distance=${Math.round(distance)}m`,
      400,
    );
  }

  // 4) 스푸핑 검사 훅
  const antiSpoofInput: GpsAntiSpoofInput = {
    lat,
    lng,
    accuracy,
    provider,
    mocked,
    deviceId,
    timestamp: clientTs,
  };

  const antiSpoof = await getGpsAntiSpoofAdapter().check(antiSpoofInput);

  if (!antiSpoof.ok) {
    logger.warn(
      {
        traceId,
        userId,
        missionRunId,
        antiSpoof,
      },
      "mission_run.gps.verify.spoof_detected",
    );
    throw new AppError(
      "VALIDATION_ERROR",
      antiSpoof.reason ?? "GPS spoofing suspected",
      400,
    );
  }

  // 5) 다음 상태 계산 (QR / REELS / REVIEW)
  const nextStatus =
    spec.qr === true
      ? "PENDING_QR"
      : spec.reels === true
      ? "PENDING_REELS"
      : "PENDING_REVIEW";

  const updateResult = await prisma.missionRun.updateMany({
    where: {
      id: run.id,
      status: "PENDING_GPS",  // Prevent race condition
    },
    data: {
      status: nextStatus,
      gpsVerifiedAt: new Date(),
    },
  });

  if (updateResult.count === 0) {
    throw new AppError(
      "MISSION_RUN_INVALID_STATE",
      "Mission run state changed during GPS verification",
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
      distance,
      accuracy,
      nextStatus,
    },
    "mission_run.gps.verify.success",
  );

  return updated;
}
