// ZZIK LIVE v4 - Mission Service
// GPS → QR → Reels → Reward 플로우

import { prisma } from "@/lib/prisma";
import { AppError } from "@/core/errors/app-error";
import { logger } from "@/core/observability/logger";
import { metrics } from "@/core/observability/metrics";

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

  return prisma.$transaction(async (tx) => {
    const mission = await tx.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      throw new AppError("MISSION_NOT_FOUND", "Mission not found", 404);
    }

    if (mission.status !== "ACTIVE") {
      throw new AppError("MISSION_INACTIVE", "Mission is not active", 400);
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

    if (mission.maxRunsPerUser) {
      const count = await tx.missionRun.count({
        where: {
          missionId,
          userId,
          status: {
            in: [
              "APPROVED",
              "PENDING_GPS",
              "PENDING_QR",
              "PENDING_REELS",
              "PENDING_REVIEW",
            ],
          },
        },
      });
      if (count >= mission.maxRunsPerUser) {
        throw new AppError(
          "MISSION_LIMIT_REACHED",
          "User has reached mission limit",
          400,
        );
      }
    }

    const expiresAt = mission.endAt ?? new Date(now.getTime() + 1000 * 60 * 60); // 기본 1시간

    const run = await tx.missionRun.create({
      data: {
        missionId,
        userId,
        status: "PENDING_GPS",
        expiresAt,
      },
    });

    logger.info(
      { traceId, userId, missionId, missionRunId: run.id },
      "mission_run.start.success",
    );

    metrics.incMissionRunStarted();

    return run;
  });
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

  logger.info(
    { traceId, missionRunId },
    "mission_run.approve.begin",
  );

  return prisma.$transaction(async (tx) => {
    const run = await tx.missionRun.findUnique({
      where: { id: missionRunId },
      include: { mission: true, user: true },
    });

    if (!run) {
      throw new AppError(
        "MISSION_RUN_NOT_FOUND",
        "Mission run not found",
        404,
      );
    }

    if (run.status === "APPROVED") {
      // 멱등성: 이미 승인된 경우
      logger.info(
        { traceId, missionRunId },
        "mission_run.approve.already_approved",
      );
      return run;
    }

    if (run.status !== "PENDING_REVIEW") {
      throw new AppError(
        "MISSION_RUN_INVALID_STATE",
        `Mission run is in invalid state: ${run.status}`,
        409,
      );
    }

    const rewardAmount = run.mission.rewardAmount;

    // Wallet 준비
    let wallet = await tx.wallet.findUnique({
      where: { userId: run.userId },
    });

    if (!wallet) {
      wallet = await tx.wallet.create({
        data: {
          userId: run.userId,
          balance: 0,
          lockedBalance: 0,
          version: 1,
        },
      });
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + rewardAmount;

    // 멱등성 체크
    if (idempotencyKey) {
      const existingTx = await tx.walletTransaction.findUnique({
        where: { idempotencyKey },
      });
      if (existingTx) {
        logger.info(
          { traceId, missionRunId, idempotencyKey },
          "mission_run.approve.idempotent_skip",
        );
        return run;
      }
    }

    const txRecord = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "MISSION_REWARD",
        status: "COMPLETED",
        amount: rewardAmount,
        balanceBefore,
        balanceAfter,
        refType: "MissionRun",
        refId: run.id,
        idempotencyKey,
        missionRunId: run.id,
      },
    });

    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: balanceAfter,
        version: { increment: 1 },
      },
    });

    const updatedRun = await tx.missionRun.update({
      where: { id: run.id },
      data: {
        status: "APPROVED",
        rewardAmount,
        rewardedAt: new Date(),
        reviewedAt: new Date(),
      },
    });

    logger.info(
      { traceId, missionRunId, userId: run.userId, rewardAmount },
      "mission_run.approve.success",
    );

    metrics.incMissionRunApproved();
    metrics.incWalletTransaction("mission_reward");

    return { run: updatedRun, tx: txRecord };
  });
}
