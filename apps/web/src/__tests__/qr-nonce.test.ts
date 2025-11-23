/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { verifyQr } from '@/core/missions/steps/qr';

// Mock QR verification functions
vi.mock('@/core/qr/verify', () => ({
  parseZzikQrPayload: vi.fn((raw: string) => {
    try {
      const data = JSON.parse(raw);
      return {
        missionId: data.missionId,
        placeId: data.placeId,
        nonce: data.nonce,
        timestamp: data.timestamp,
        signature: data.signature,
      };
    } catch {
      throw new Error('Invalid QR payload');
    }
  }),
  verifyQrSignature: vi.fn(() => true), // Always verify signature for testing
}));

describe('QR Nonce Replay Attack Prevention', () => {
  const validNonce = 'test-nonce-12345';
  const missionId = 'test-mission-id';
  const placeId = 'test-place-id';
  const userId = 'test-user-id';

  const mockMissionRun = {
    id: 'test-run-id',
    userId,
    missionId,
    status: 'PENDING_QR',
    expiresAt: new Date(Date.now() + 3600000),
    mission: {
      placeId,
      verificationSpec: { gps: true, qr: true, reels: false },
      place: {
        id: placeId,
        name: 'Test Place',
      },
    },
  };

  const createQrPayload = (nonce: string) => {
    return JSON.stringify({
      missionId,
      placeId,
      nonce,
      timestamp: Date.now(),
      signature: 'valid-signature',
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Prisma responses
    (prisma.missionRun.findUnique as any).mockResolvedValue(mockMissionRun);
    (prisma.missionRun.updateMany as any).mockResolvedValue({ count: 1 });
    (prisma.missionRun.findUniqueOrThrow as any).mockResolvedValue({
      ...mockMissionRun,
      status: 'PENDING_REVIEW',
      qrVerifiedAt: new Date(),
    });
  });

  it('should succeed on first QR scan with valid nonce', async () => {
    const unusedNonce = {
      id: 'nonce-id',
      nonce: validNonce,
      missionId,
      placeId,
      usedAt: null,
      usedBy: null,
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
    };

    (prisma.qrNonce.findUnique as any).mockResolvedValue(unusedNonce);
    (prisma.qrNonce.update as any).mockResolvedValue({
      ...unusedNonce,
      usedAt: new Date(),
      usedBy: userId,
    });

    const result = await verifyQr({
      missionRunId: 'test-run-id',
      userId,
      rawPayload: createQrPayload(validNonce),
    });

    expect(result).toBeDefined();
    expect(result.status).toBe('PENDING_REVIEW');
    expect(result.qrVerifiedAt).toBeDefined();

    // Verify nonce was marked as used
    expect(prisma.qrNonce.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { nonce: validNonce },
        data: expect.objectContaining({
          usedAt: expect.any(Date),
          usedBy: userId,
        }),
      })
    );
  });

  it('should fail on duplicate QR scan (replay attack)', async () => {
    const usedNonce = {
      id: 'nonce-id',
      nonce: validNonce,
      missionId,
      placeId,
      usedAt: new Date(Date.now() - 60000), // Used 1 minute ago
      usedBy: 'another-user-id',
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
    };

    (prisma.qrNonce.findUnique as any).mockResolvedValue(usedNonce);

    await expect(
      verifyQr({
        missionRunId: 'test-run-id',
        userId,
        rawPayload: createQrPayload(validNonce),
      })
    ).rejects.toThrow('QR code already used (replay attack detected)');

    await expect(
      verifyQr({
        missionRunId: 'test-run-id',
        userId,
        rawPayload: createQrPayload(validNonce),
      })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      httpStatus: 400,
    });

    // Verify nonce was NOT updated again
    expect(prisma.qrNonce.update).not.toHaveBeenCalled();
  });

  it('should fail if nonce does not exist in database', async () => {
    (prisma.qrNonce.findUnique as any).mockResolvedValue(null);

    await expect(
      verifyQr({
        missionRunId: 'test-run-id',
        userId,
        rawPayload: createQrPayload('non-existent-nonce'),
      })
    ).rejects.toThrow('QR code not found or invalid');

    await expect(
      verifyQr({
        missionRunId: 'test-run-id',
        userId,
        rawPayload: createQrPayload('non-existent-nonce'),
      })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      httpStatus: 404,
    });
  });

  it('should fail if QR code is expired', async () => {
    const expiredNonce = {
      id: 'nonce-id',
      nonce: validNonce,
      missionId,
      placeId,
      usedAt: null,
      usedBy: null,
      expiresAt: new Date(Date.now() - 3600000), // Expired 1 hour ago
      createdAt: new Date(),
    };

    (prisma.qrNonce.findUnique as any).mockResolvedValue(expiredNonce);

    await expect(
      verifyQr({
        missionRunId: 'test-run-id',
        userId,
        rawPayload: createQrPayload(validNonce),
      })
    ).rejects.toThrow('QR code expired');

    await expect(
      verifyQr({
        missionRunId: 'test-run-id',
        userId,
        rawPayload: createQrPayload(validNonce),
      })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      httpStatus: 400,
    });

    // Verify nonce was NOT marked as used
    expect(prisma.qrNonce.update).not.toHaveBeenCalled();
  });

  it('should fail if missionId does not match', async () => {
    const mismatchedMissionId = 'different-mission-id';

    const unusedNonce = {
      id: 'nonce-id',
      nonce: validNonce,
      missionId,
      placeId,
      usedAt: null,
      usedBy: null,
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
    };

    (prisma.qrNonce.findUnique as any).mockResolvedValue(unusedNonce);

    const mismatchedPayload = JSON.stringify({
      missionId: mismatchedMissionId,
      placeId,
      nonce: validNonce,
      timestamp: Date.now(),
      signature: 'valid-signature',
    });

    await expect(
      verifyQr({
        missionRunId: 'test-run-id',
        userId,
        rawPayload: mismatchedPayload,
      })
    ).rejects.toThrow('QR payload does not match mission/place');
  });

  it('should fail if placeId does not match', async () => {
    const mismatchedPlaceId = 'different-place-id';

    const unusedNonce = {
      id: 'nonce-id',
      nonce: validNonce,
      missionId,
      placeId,
      usedAt: null,
      usedBy: null,
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
    };

    (prisma.qrNonce.findUnique as any).mockResolvedValue(unusedNonce);

    const mismatchedPayload = JSON.stringify({
      missionId,
      placeId: mismatchedPlaceId,
      nonce: validNonce,
      timestamp: Date.now(),
      signature: 'valid-signature',
    });

    await expect(
      verifyQr({
        missionRunId: 'test-run-id',
        userId,
        rawPayload: mismatchedPayload,
      })
    ).rejects.toThrow('QR payload does not match mission/place');
  });

  it('should handle concurrent scans of the same QR code', async () => {
    const unusedNonce = {
      id: 'nonce-id',
      nonce: validNonce,
      missionId,
      placeId,
      usedAt: null,
      usedBy: null,
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
    };

    // First scan succeeds
    (prisma.qrNonce.findUnique as any).mockResolvedValueOnce(unusedNonce);
    (prisma.qrNonce.update as any).mockResolvedValueOnce({
      ...unusedNonce,
      usedAt: new Date(),
      usedBy: userId,
    });

    const result1 = await verifyQr({
      missionRunId: 'test-run-id',
      userId,
      rawPayload: createQrPayload(validNonce),
    });

    expect(result1).toBeDefined();
    expect(result1.status).toBe('PENDING_REVIEW');

    // Second concurrent scan fails (nonce already marked as used)
    const usedNonce = {
      ...unusedNonce,
      usedAt: new Date(),
      usedBy: userId,
    };

    const differentUserId = 'different-user';
    const mockMissionRun2 = {
      id: 'test-run-id-2',
      userId: differentUserId,
      missionId,
      status: 'PENDING_QR',
      expiresAt: new Date(Date.now() + 3600000),
      mission: {
        placeId,
        verificationSpec: { gps: true, qr: true, reels: false },
        place: {
          id: placeId,
          name: 'Test Place',
        },
      },
    };

    (prisma.missionRun.findUnique as any).mockResolvedValueOnce(mockMissionRun2);
    (prisma.qrNonce.findUnique as any).mockResolvedValueOnce(usedNonce);

    await expect(
      verifyQr({
        missionRunId: 'test-run-id-2',
        userId: differentUserId,
        rawPayload: createQrPayload(validNonce),
      })
    ).rejects.toThrow('QR code already used (replay attack detected)');
  });

  it('should reject invalid QR payload format', async () => {
    await expect(
      verifyQr({
        missionRunId: 'test-run-id',
        userId,
        rawPayload: 'invalid-json-payload',
      })
    ).rejects.toThrow('Invalid QR payload');
  });

  it('should allow multiple unique nonces for the same mission', async () => {
    const nonce1 = 'unique-nonce-1';
    const nonce2 = 'unique-nonce-2';

    // First QR scan with nonce1
    (prisma.qrNonce.findUnique as any).mockResolvedValueOnce({
      id: 'nonce-id-1',
      nonce: nonce1,
      missionId,
      placeId,
      usedAt: null,
      usedBy: null,
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
    });
    (prisma.qrNonce.update as any).mockResolvedValueOnce({
      id: 'nonce-id-1',
      nonce: nonce1,
      missionId,
      placeId,
      usedAt: new Date(),
      usedBy: userId,
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
    });

    const result1 = await verifyQr({
      missionRunId: 'test-run-id',
      userId,
      rawPayload: createQrPayload(nonce1),
    });

    expect(result1.status).toBe('PENDING_REVIEW');

    // Second QR scan with nonce2 (different nonce, same mission)
    const mockMissionRun2 = {
      id: 'test-run-id-2',
      userId,
      missionId,
      status: 'PENDING_QR',
      expiresAt: new Date(Date.now() + 3600000),
      mission: {
        placeId,
        verificationSpec: { gps: true, qr: true, reels: false },
        place: {
          id: placeId,
          name: 'Test Place',
        },
      },
    };

    (prisma.missionRun.findUnique as any).mockResolvedValueOnce(mockMissionRun2);
    (prisma.missionRun.updateMany as any).mockResolvedValueOnce({ count: 1 });
    (prisma.missionRun.findUniqueOrThrow as any).mockResolvedValueOnce({
      ...mockMissionRun2,
      status: 'PENDING_REVIEW',
      qrVerifiedAt: new Date(),
    });

    (prisma.qrNonce.findUnique as any).mockResolvedValueOnce({
      id: 'nonce-id-2',
      nonce: nonce2,
      missionId,
      placeId,
      usedAt: null,
      usedBy: null,
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
    });
    (prisma.qrNonce.update as any).mockResolvedValueOnce({
      id: 'nonce-id-2',
      nonce: nonce2,
      missionId,
      placeId,
      usedAt: new Date(),
      usedBy: userId,
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
    });

    const result2 = await verifyQr({
      missionRunId: 'test-run-id-2',
      userId,
      rawPayload: createQrPayload(nonce2),
    });

    expect(result2.status).toBe('PENDING_REVIEW');
  });
});
