/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { approveMissionRunAndReward } from '@/core/missions/service';

describe('Wallet Optimistic Locking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle concurrent approveMissionRunAndReward calls - one succeeds, one fails with WALLET_VERSION_CONFLICT', async () => {
    const missionRunId = 'test-run-id';
    const userId = 'test-user-id';
    const walletId = 'test-wallet-id';
    const rewardAmount = 100;

    // Mock mission run data
    const mockMissionRun = {
      id: missionRunId,
      userId,
      missionId: 'test-mission-id',
      status: 'PENDING_REVIEW',
      gpsVerifiedAt: new Date(),
      qrVerifiedAt: new Date(),
      reelsUploadedAt: new Date(),
      reviewedAt: null,
      rejectedAt: null,
      rejectReason: null,
      expiresAt: new Date(Date.now() + 3600000),
      rewardAmount: null,
      rewardedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      activeLockKey: null,
      mission: {
        id: 'test-mission-id',
        rewardAmount,
        placeId: 'test-place-id',
        title: 'Test Mission',
        description: 'Test Description',
        status: 'ACTIVE',
        maxRunsPerUser: null,
        maxTotalRuns: null,
        startAt: null,
        endAt: null,
        verificationSpec: { gps: true, qr: true, reels: true },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      user: {
        id: userId,
        email: 'test@example.com',
        phone: null,
        authProvider: null,
        providerUserId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    // Mock wallet with version 1
    const mockWallet = {
      id: walletId,
      userId,
      balance: 500,
      lockedBalance: 0,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Track transaction callback to simulate concurrent behavior
    let transactionCallCount = 0;

    // Mock $transaction to simulate concurrent execution
    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      transactionCallCount++;
      const currentCall = transactionCallCount;

      const mockTxClient = {
        missionRun: {
          findUnique: vi.fn().mockResolvedValue(mockMissionRun),
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        walletTransaction: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({
            id: `tx-${currentCall}`,
            walletId,
            type: 'MISSION_REWARD',
            status: 'COMPLETED',
            amount: rewardAmount,
            balanceBefore: mockWallet.balance,
            balanceAfter: mockWallet.balance + rewardAmount,
            refType: 'MissionRun',
            refId: missionRunId,
            idempotencyKey: `mission-run:${missionRunId}:approve-${currentCall}`,
            missionRunId,
            createdAt: new Date(),
          }),
        },
        wallet: {
          findUnique: vi.fn().mockResolvedValue(mockWallet),
          updateMany: vi.fn().mockImplementation(async (args: any) => {
            // First call succeeds (version matches)
            if (currentCall === 1) {
              return { count: 1 };
            }
            // Second call fails (version mismatch - someone else updated it)
            return { count: 0 };
          }),
        },
      };

      return callback(mockTxClient);
    });

    // First approval - should succeed
    const result1 = await approveMissionRunAndReward({
      missionRunId,
      idempotencyKey: `mission-run:${missionRunId}:approve-1`,
    });

    expect(result1).toBeDefined();
    expect(result1.tx).toBeDefined();
    expect(result1.tx?.amount).toBe(rewardAmount);

    // Second concurrent approval - should fail with WALLET_VERSION_CONFLICT
    await expect(
      approveMissionRunAndReward({
        missionRunId,
        idempotencyKey: `mission-run:${missionRunId}:approve-2`,
      })
    ).rejects.toThrow('Wallet was modified by another transaction');

    await expect(
      approveMissionRunAndReward({
        missionRunId,
        idempotencyKey: `mission-run:${missionRunId}:approve-2`,
      })
    ).rejects.toMatchObject({
      code: 'WALLET_VERSION_CONFLICT',
      httpStatus: 409,
    });
  });

  it('should succeed when idempotency key matches existing transaction', async () => {
    const missionRunId = 'test-run-id';
    const idempotencyKey = 'test-idempotency-key';
    const existingTxId = 'existing-tx-id';

    const mockMissionRun = {
      id: missionRunId,
      userId: 'test-user-id',
      status: 'PENDING_REVIEW',
      mission: {
        rewardAmount: 100,
      },
      user: {},
    };

    const existingTransaction = {
      id: existingTxId,
      walletId: 'test-wallet-id',
      type: 'MISSION_REWARD',
      status: 'COMPLETED',
      amount: 100,
      balanceBefore: 500,
      balanceAfter: 600,
      idempotencyKey,
      createdAt: new Date(),
    };

    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      const mockTxClient = {
        missionRun: {
          findUnique: vi.fn().mockResolvedValue(mockMissionRun),
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        walletTransaction: {
          findFirst: vi.fn().mockResolvedValue(existingTransaction),
        },
      };

      return callback(mockTxClient);
    });

    const result = await approveMissionRunAndReward({
      missionRunId,
      idempotencyKey,
    });

    expect(result).toBeDefined();
    expect(result.tx).toEqual(existingTransaction);
  });

  it('should handle wallet creation if not exists', async () => {
    const missionRunId = 'test-run-id';
    const userId = 'test-user-id';

    const mockMissionRun = {
      id: missionRunId,
      userId,
      status: 'PENDING_REVIEW',
      mission: {
        rewardAmount: 100,
      },
      user: {},
    };

    const newWallet = {
      id: 'new-wallet-id',
      userId,
      balance: 0,
      lockedBalance: 0,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      const mockTxClient = {
        missionRun: {
          findUnique: vi.fn().mockResolvedValue(mockMissionRun),
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        walletTransaction: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({
            id: 'new-tx-id',
            walletId: newWallet.id,
            type: 'MISSION_REWARD',
            status: 'COMPLETED',
            amount: 100,
            balanceBefore: 0,
            balanceAfter: 100,
            createdAt: new Date(),
          }),
        },
        wallet: {
          findUnique: vi.fn().mockResolvedValue(null), // Wallet doesn't exist
          create: vi.fn().mockResolvedValue(newWallet), // Create new wallet
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
      };

      return callback(mockTxClient);
    });

    const result = await approveMissionRunAndReward({
      missionRunId,
    });

    expect(result).toBeDefined();
    expect(result.tx).toBeDefined();
  });

  it('should fail if mission run is not in PENDING_REVIEW status', async () => {
    const missionRunId = 'test-run-id';

    const mockMissionRun = {
      id: missionRunId,
      userId: 'test-user-id',
      status: 'APPROVED', // Already approved
      mission: {
        rewardAmount: 100,
      },
      user: {},
    };

    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      const mockTxClient = {
        missionRun: {
          findUnique: vi.fn().mockResolvedValue(mockMissionRun),
        },
        walletTransaction: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      };

      return callback(mockTxClient);
    });

    const result = await approveMissionRunAndReward({
      missionRunId,
    });

    // Should return existing run without creating new transaction
    expect(result.run.status).toBe('APPROVED');
    expect(result.tx).toBeNull();
  });

  it('should fail if mission run status changes during approval', async () => {
    const missionRunId = 'test-run-id';

    const mockMissionRun = {
      id: missionRunId,
      userId: 'test-user-id',
      status: 'PENDING_REVIEW',
      mission: {
        rewardAmount: 100,
      },
      user: {},
    };

    const mockWallet = {
      id: 'wallet-id',
      userId: 'test-user-id',
      balance: 500,
      lockedBalance: 0,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      const mockTxClient = {
        missionRun: {
          findUnique: vi.fn().mockResolvedValue(mockMissionRun),
          updateMany: vi.fn().mockResolvedValue({ count: 0 }), // Status changed
        },
        walletTransaction: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
        wallet: {
          findUnique: vi.fn().mockResolvedValue(mockWallet),
        },
      };

      return callback(mockTxClient);
    });

    await expect(
      approveMissionRunAndReward({ missionRunId })
    ).rejects.toThrow('Mission run state changed during approval');

    await expect(
      approveMissionRunAndReward({ missionRunId })
    ).rejects.toMatchObject({
      code: 'MISSION_RUN_INVALID_STATE',
      httpStatus: 409,
    });
  });
});
