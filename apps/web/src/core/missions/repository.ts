import { MissionRunStatus, Prisma, PrismaClient } from "@prisma/client";

export type TxClient = Prisma.TransactionClient;
type QueryClient = Prisma.TransactionClient | PrismaClient;

export const ACTIVE_STATUSES: MissionRunStatus[] = [
  "PENDING_GPS",
  "PENDING_QR",
  "PENDING_REELS",
  "PENDING_REVIEW",
];

export async function findActiveMission(tx: TxClient, missionId: string) {
  return tx.mission.findFirst({
    where: { id: missionId, status: "ACTIVE" },
    select: {
      id: true,
      placeId: true,
      title: true,
      description: true,
      rewardAmount: true,
      verificationSpec: true,
      maxRunsPerUser: true,
      status: true,
      startAt: true,
      endAt: true,
    },
  });
}

export async function findBlockingRun(tx: TxClient, missionId: string, userId: string) {
  return tx.missionRun.findFirst({
    where: {
      missionId,
      userId,
      status: { in: ACTIVE_STATUSES },
    },
    select: { id: true },
  });
}

export async function createMissionRun(
  tx: TxClient,
  params: {
    missionId: string;
    userId: string;
    expiresAt: Date;
    activeLockKey: string;
  },
) {
  return tx.missionRun.create({
    data: {
      missionId: params.missionId,
      userId: params.userId,
      status: "PENDING_GPS",
      expiresAt: params.expiresAt,
      activeLockKey: params.activeLockKey,
    },
  });
}

export async function getMissionRunWithGraph(client: QueryClient, runId: string) {
  return client.missionRun.findUnique({
    where: { id: runId },
    select: {
      id: true,
      missionId: true,
      userId: true,
      status: true,
      gpsVerifiedAt: true,
      qrVerifiedAt: true,
      reelsUploadedAt: true,
      reviewedAt: true,
      rewardedAt: true,
      expiresAt: true,
      activeLockKey: true,
      rewardAmount: true,
      createdAt: true,
      updatedAt: true,
      mission: {
        select: {
          id: true,
          title: true,
          description: true,
          rewardAmount: true,
          verificationSpec: true,
          place: {
            select: {
              id: true,
              name: true,
              category: true,
              latitude: true,
              longitude: true,
              address: true,
              trafficSignal: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Count MissionRuns by status for quota checking
 */
export async function countMissionRunsByStatus(
  tx: TxClient,
  params: {
    missionId: string;
    userId: string;
    statuses: MissionRunStatus[];
  },
) {
  return tx.missionRun.count({
    where: {
      missionId: params.missionId,
      userId: params.userId,
      status: { in: params.statuses },
    },
  });
}

/**
 * Find MissionRun with mission and user relations
 */
export async function findMissionRunWithRelations(
  tx: TxClient,
  runId: string,
) {
  return tx.missionRun.findUnique({
    where: { id: runId },
    select: {
      id: true,
      missionId: true,
      userId: true,
      status: true,
      gpsVerifiedAt: true,
      qrVerifiedAt: true,
      reelsUploadedAt: true,
      reviewedAt: true,
      rewardedAt: true,
      expiresAt: true,
      activeLockKey: true,
      createdAt: true,
      updatedAt: true,
      mission: {
        select: {
          id: true,
          title: true,
          rewardAmount: true,
          verificationSpec: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

/**
 * Find existing WalletTransaction for idempotency check
 */
export async function findExistingWalletTransaction(
  tx: TxClient,
  params: {
    idempotencyKey: string;
    missionRunId: string;
  },
) {
  return tx.walletTransaction.findFirst({
    where: {
      OR: [
        { idempotencyKey: params.idempotencyKey },
        {
          missionRunId: params.missionRunId,
          refType: "MissionRun",
          type: "MISSION_REWARD",
          status: { in: ["COMPLETED", "PENDING"] },
        },
      ],
    },
  });
}

/**
 * Update MissionRun to APPROVED status (conditional)
 * Returns count of updated records
 */
export async function updateMissionRunToApproved(
  tx: TxClient,
  params: {
    runId: string;
    currentStatus: MissionRunStatus;
    rewardAmount: number;
    timestamp: Date;
  },
) {
  return tx.missionRun.updateMany({
    where: { id: params.runId, status: params.currentStatus },
    data: {
      status: "APPROVED",
      rewardAmount: params.rewardAmount,
      rewardedAt: params.timestamp,
      reviewedAt: params.timestamp,
      activeLockKey: null,
    },
  });
}

/**
 * Find Wallet by userId
 */
export async function findWallet(tx: TxClient, userId: string) {
  return tx.wallet.findUnique({
    where: { userId },
  });
}

/**
 * Create Wallet
 */
export async function createWallet(tx: TxClient, userId: string) {
  return tx.wallet.create({
    data: {
      userId,
      balance: 0,
      lockedBalance: 0,
      version: 1,
    },
  });
}

/**
 * Ensure Wallet exists (find or create)
 */
export async function ensureWallet(tx: TxClient, userId: string) {
  let wallet = await findWallet(tx, userId);
  if (!wallet) {
    wallet = await createWallet(tx, userId);
  }
  return wallet;
}

/**
 * Create WalletTransaction
 */
export async function createWalletTransaction(
  tx: TxClient,
  params: {
    walletId: string;
    type: "MISSION_REWARD" | "ADJUSTMENT" | "WITHDRAWAL" | "DEPOSIT" | "REFUND";
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    refType: string;
    refId: string;
    idempotencyKey: string;
    missionRunId: string;
  },
) {
  return tx.walletTransaction.create({
    data: {
      walletId: params.walletId,
      type: params.type,
      status: "COMPLETED",
      amount: params.amount,
      balanceBefore: params.balanceBefore,
      balanceAfter: params.balanceAfter,
      refType: params.refType,
      refId: params.refId,
      idempotencyKey: params.idempotencyKey,
      missionRunId: params.missionRunId,
    },
  });
}

/**
 * Update Wallet balance with optimistic locking
 * Returns count of updated records (0 if version conflict)
 */
export async function updateWalletBalance(
  tx: TxClient,
  params: {
    walletId: string;
    currentVersion: number;
    newBalance: number;
  },
) {
  return tx.wallet.updateMany({
    where: {
      id: params.walletId,
      version: params.currentVersion,
    },
    data: {
      balance: params.newBalance,
      version: { increment: 1 },
    },
  });
}
