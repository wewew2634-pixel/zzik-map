// ZZIK LIVE v4 - Mission Service
// GPS → QR → Reels → Reward 플로우

import { prisma } from "@/lib/prisma";
import { AppError } from "@/core/errors/app-error";
import { logger } from "@/core/observability/logger";
import { metrics } from "@/core/observability/metrics";
import { trackMissionRunStateChange } from "@/core/observability/error-tracking";
import { Prisma } from "@prisma/client";
import {
  ACTIVE_STATUSES,
  createMissionRun,
  findActiveMission,
  findBlockingRun,
  countMissionRunsByStatus,
  findMissionRunWithRelations,
  findExistingWalletTransaction,
  updateMissionRunToApproved,
  ensureWallet,
  createWalletTransaction,
  updateWalletBalance,
  type TxClient,
} from "./repository";
import type { MissionRunStatus } from "@prisma/client";

const APPROVABLE_STATUS = "PENDING_REVIEW";
const ACTIVE_LOCK_KEY_PREFIX = "mission-run";
const HISTORY_COUNT_STATUSES: MissionRunStatus[] = ["APPROVED", ...ACTIVE_STATUSES];

function buildActiveLockKey(missionId: string, userId: string) {
  return `${ACTIVE_LOCK_KEY_PREFIX}:${missionId}:${userId}`;
}

function isActiveLockConflict(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = Array.isArray(error.meta?.target)
      ? error.meta?.target.join(":")
      : `${error.meta?.target ?? ""}`;
    return (
      target.includes("activeLockKey") ||
      `${error.message ?? ""}`.includes("MissionRun_active_lock_key_unique")
    );
  }
  return false;
}

async function validateMissionWindow(tx: TxClient, missionId: string) {
  const mission = await findActiveMission(tx, missionId);
  if (!mission) {
    throw new AppError("MISSION_NOT_FOUND", "Mission not found", 404);
  }

  const now = new Date();
  if (
    (mission.startAt && mission.startAt > now) ||
    (mission.endAt && mission.endAt < now)
  ) {
    throw new AppError(
      "MISSION_INACTIVE",
      "Mission is outside of active time window",
      400,
    );
  }

  return { mission, now };
}

async function ensureMissionRunQuota(
  tx: TxClient,
  missionId: string,
  userId: string,
  maxRunsPerUser?: number | null,
) {
  if (!maxRunsPerUser) {
    return;
  }

  const count = await countMissionRunsByStatus(tx, {
    missionId,
    userId,
    statuses: HISTORY_COUNT_STATUSES,
  });

  if (count >= maxRunsPerUser) {
    throw new AppError(
      "MISSION_LIMIT_REACHED",
      "User has reached mission limit",
      400,
    );
  }
}

//
// startMissionRun: 미션 시작
//

export type StartMissionRunInput = {
  userId: string;
  missionId: string;
};

export async function startMissionRun(input: StartMissionRunInput) {
  const { userId, missionId } = input;
  const traceId = crypto.randomUUID();

  logger.info(
    { traceId, userId, missionId },
    "mission_run.start.begin",
  );

  try {
    return await prisma.$transaction(async (tx) => {
      const { mission, now } = await validateMissionWindow(tx, missionId);

      const blocking = await findBlockingRun(tx, missionId, userId);
      if (blocking) {
        throw new AppError(
          "MISSION_LIMIT_REACHED",
          "Active mission run already exists",
          409,
        );
      }

      await ensureMissionRunQuota(tx, missionId, userId, mission.maxRunsPerUser);

      const expiresAt = mission.endAt ?? new Date(now.getTime() + 60 * 60 * 1000);
      const activeLockKey = buildActiveLockKey(missionId, userId);

      const run = await createMissionRun(tx, {
        missionId,
        userId,
        expiresAt,
        activeLockKey,
      });

      logger.info(
        { traceId, userId, missionId, missionRunId: run.id, activeLockKey },
        "mission_run.start.success",
      );

      // Track state change in Sentry
      trackMissionRunStateChange(run.id, "none", run.status, {
        missionId,
        userId,
      });

      metrics.incMissionRunStarted();

      return run;
    }, {
      maxWait: 5000, // Wait max 5s to acquire connection
      timeout: 10000, // Transaction must complete in 10s
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    });
  } catch (err) {
    if (isActiveLockConflict(err)) {
      logger.warn(
        { traceId, userId, missionId },
        "mission_run.start.conflict",
      );
      throw new AppError(
        "MISSION_LIMIT_REACHED",
        "Active mission run already exists",
        409,
      );
    }
    throw err;
  }
}

//
// approveMissionRunAndReward: 미션 승인 + 리워드 지급
//

export type ApproveMissionRunInput = {
  missionRunId: string;
  reviewerId?: string;
  idempotencyKey?: string;
};

export async function approveMissionRunAndReward(
  input: ApproveMissionRunInput,
) {
  const { missionRunId, idempotencyKey } = input;
  const traceId = crypto.randomUUID();
  const effectiveIdempotencyKey =
    idempotencyKey ?? `mission-run:${missionRunId}:approve`;

  logger.info(
    { traceId, missionRunId },
    "mission_run.approve.begin",
  );

  // Track mission run duration (from creation to approval)
  const approveStartTime = Date.now();

  return prisma.$transaction(async (tx) => {
    let run = await findMissionRunWithRelations(tx, missionRunId);

    if (!run) {
      throw new AppError(
        "MISSION_RUN_NOT_FOUND",
        "Mission run not found",
        404,
      );
    }

    const existingTx = await findExistingWalletTransaction(tx, {
      idempotencyKey: effectiveIdempotencyKey,
      missionRunId,
    });

    if (existingTx) {
      if (run.status === APPROVABLE_STATUS) {
        const ts = existingTx.createdAt ?? new Date();
        await updateMissionRunToApproved(tx, {
          runId: run.id,
          currentStatus: APPROVABLE_STATUS,
          rewardAmount: run.mission.rewardAmount,
          timestamp: ts,
        });
        run = (await findMissionRunWithRelations(tx, run.id)) ?? run;
      }
      logger.info(
        { traceId, missionRunId, idempotencyKey: effectiveIdempotencyKey },
        "mission_run.approve.idempotent_existing_tx",
      );
      return { run, tx: existingTx };
    }

    if (run.status === "APPROVED") {
      logger.info(
        { traceId, missionRunId },
        "mission_run.approve.already_approved",
      );
      return { run, tx: null };
    }

    if (run.status !== APPROVABLE_STATUS) {
      throw new AppError(
        "MISSION_RUN_INVALID_STATE",
        "Mission run is in invalid state: " + run.status,
        409,
      );
    }

    const rewardAmount = run.mission.rewardAmount;

    // Wallet 준비 (조회 또는 생성)
    const wallet = await ensureWallet(tx, run.userId);

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + rewardAmount;
    const now = new Date();

    const updatedRun = await updateMissionRunToApproved(tx, {
      runId: run.id,
      currentStatus: APPROVABLE_STATUS,
      rewardAmount,
      timestamp: now,
    });

    if (updatedRun.count === 0) {
      throw new AppError(
        "MISSION_RUN_INVALID_STATE",
        "Mission run state changed during approval",
        409,
      );
    }

    const txRecord = await createWalletTransaction(tx, {
      walletId: wallet.id,
      type: "MISSION_REWARD",
      amount: rewardAmount,
      balanceBefore,
      balanceAfter,
      refType: "MissionRun",
      refId: run.id,
      idempotencyKey: effectiveIdempotencyKey,
      missionRunId: run.id,
    });

    const walletUpdate = await updateWalletBalance(tx, {
      walletId: wallet.id,
      currentVersion: wallet.version,
      newBalance: balanceAfter,
    });

    if (walletUpdate.count === 0) {
      throw new AppError(
        "WALLET_VERSION_CONFLICT",
        "Wallet was modified by another transaction",
        409,
      );
    }

    run = (await findMissionRunWithRelations(tx, run.id)) ?? run;

    // Calculate mission run duration (from creation to completion)
    const missionDuration = run.createdAt
      ? Date.now() - run.createdAt.getTime()
      : Date.now() - approveStartTime;

    logger.info(
      { traceId, missionRunId, userId: run.userId, rewardAmount, durationMs: missionDuration },
      "mission_run.approve.success",
    );

    // Track state change in Sentry
    trackMissionRunStateChange(run.id, APPROVABLE_STATUS, "APPROVED", {
      missionId: run.missionId,
      userId: run.userId,
      rewardAmount,
      durationMs: missionDuration,
    });

    metrics.incMissionRunApproved();
    metrics.incWalletTransaction("mission_reward");
    metrics.observeMissionRunDuration(missionDuration);

    return { run, tx: txRecord };
  }, {
    maxWait: 5000, // Wait max 5s to acquire connection
    timeout: 15000, // Transaction must complete in 15s (longer for wallet operations)
    isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
  });
}
