// ZZIK LIVE v4 - Mission State Machine Utilities

import { MissionRunStatus, Mission, MissionRun } from "@prisma/client";
import { AppError } from "@/core/errors/app-error";

type VerificationSpec = {
  gps?: boolean;
  qr?: boolean;
  reels?: boolean;
  review?: boolean;
};

export function parseVerificationSpec(mission: Mission): VerificationSpec {
  const spec = mission.verificationSpec ?? {};
  return spec as VerificationSpec;
}

export function assertNotExpired(run: MissionRun) {
  if (run.expiresAt && run.expiresAt < new Date()) {
    throw new AppError(
      "MISSION_RUN_INVALID_STATE",
      "Mission run expired",
      409,
    );
  }
}

export function assertStatus(run: MissionRun, expected: MissionRunStatus) {
  if (run.status !== expected) {
    throw new AppError(
      "MISSION_RUN_INVALID_STATE",
      `Expected status ${expected}, got ${run.status}`,
      409,
    );
  }
}
