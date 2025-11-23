/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { verifyGps } from '@/core/missions/steps/gps';
import { setGpsAntiSpoofAdapter, type GpsAntiSpoofAdapter, type GpsAntiSpoofInput } from '@/core/gps/antiSpoof';

describe('GPS Anti-Spoofing', () => {
  const mockMissionRun = {
    id: 'test-run-id',
    userId: 'test-user-id',
    missionId: 'test-mission-id',
    status: 'PENDING_GPS',
    expiresAt: new Date(Date.now() + 3600000),
    mission: {
      verificationSpec: { gps: true, qr: false, reels: false },
      place: {
        latitude: 37.5665,
        longitude: 126.9780,
        name: 'Test Place',
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Prisma responses
    (prisma.missionRun.findUnique as any).mockResolvedValue(mockMissionRun);
    (prisma.missionRun.updateMany as any).mockResolvedValue({ count: 1 });
    (prisma.missionRun.findUniqueOrThrow as any).mockResolvedValue({
      ...mockMissionRun,
      status: 'PENDING_REVIEW',
      gpsVerifiedAt: new Date(),
    });
  });

  it('should reject GPS with mock provider', async () => {
    // Create mock adapter that rejects mock provider
    const mockAdapter: GpsAntiSpoofAdapter = {
      check: vi.fn().mockResolvedValue({
        ok: false,
        reason: 'Mock provider detected',
        score: 0,
      }),
    };

    setGpsAntiSpoofAdapter(mockAdapter);

    await expect(
      verifyGps({
        missionRunId: 'test-run-id',
        userId: 'test-user-id',
        lat: 37.5665,
        lng: 126.9780,
        accuracy: 10,
        provider: 'mock',
        mocked: false,
        timestamp: new Date().toISOString(),
      })
    ).rejects.toThrow('Mock provider detected');

    await expect(
      verifyGps({
        missionRunId: 'test-run-id',
        userId: 'test-user-id',
        lat: 37.5665,
        lng: 126.9780,
        accuracy: 10,
        provider: 'mock',
        mocked: false,
        timestamp: new Date().toISOString(),
      })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      httpStatus: 400,
    });

    expect(mockAdapter.check).toHaveBeenCalled();
  });

  it('should reject GPS with mocked=true flag', async () => {
    // Create mock adapter that checks mocked flag
    const mockAdapter: GpsAntiSpoofAdapter = {
      check: vi.fn().mockResolvedValue({
        ok: false,
        reason: 'Mock location detected',
        score: 0,
      }),
    };

    setGpsAntiSpoofAdapter(mockAdapter);

    await expect(
      verifyGps({
        missionRunId: 'test-run-id',
        userId: 'test-user-id',
        lat: 37.5665,
        lng: 126.9780,
        accuracy: 10,
        provider: 'gps',
        mocked: true,
        timestamp: new Date().toISOString(),
      })
    ).rejects.toThrow('Mock location detected');

    await expect(
      verifyGps({
        missionRunId: 'test-run-id',
        userId: 'test-user-id',
        lat: 37.5665,
        lng: 126.9780,
        accuracy: 10,
        provider: 'gps',
        mocked: true,
        timestamp: new Date().toISOString(),
      })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      httpStatus: 400,
    });
  });

  it('should accept normal GPS with legitimate provider', async () => {
    // Create mock adapter that accepts legitimate GPS
    const mockAdapter: GpsAntiSpoofAdapter = {
      check: vi.fn().mockResolvedValue({
        ok: true,
        score: 1.0,
      }),
    };

    setGpsAntiSpoofAdapter(mockAdapter);

    const result = await verifyGps({
      missionRunId: 'test-run-id',
      userId: 'test-user-id',
      lat: 37.5665,
      lng: 126.9780,
      accuracy: 10,
      provider: 'gps',
      mocked: false,
      timestamp: new Date().toISOString(),
    });

    expect(result).toBeDefined();
    expect(result.status).toBe('PENDING_REVIEW');
    expect(result.gpsVerifiedAt).toBeDefined();
    expect(mockAdapter.check).toHaveBeenCalledWith(
      expect.objectContaining({
        lat: 37.5665,
        lng: 126.9780,
        accuracy: 10,
        provider: 'gps',
        mocked: false,
      })
    );
  });

  it('should reject GPS if accuracy is too low', async () => {
    const mockAdapter: GpsAntiSpoofAdapter = {
      check: vi.fn().mockResolvedValue({
        ok: true,
        score: 1.0,
      }),
    };

    setGpsAntiSpoofAdapter(mockAdapter);

    await expect(
      verifyGps({
        missionRunId: 'test-run-id',
        userId: 'test-user-id',
        lat: 37.5665,
        lng: 126.9780,
        accuracy: 5000, // Too inaccurate
        provider: 'gps',
        mocked: false,
        timestamp: new Date().toISOString(),
      })
    ).rejects.toThrow('GPS accuracy too low');

    await expect(
      verifyGps({
        missionRunId: 'test-run-id',
        userId: 'test-user-id',
        lat: 37.5665,
        lng: 126.9780,
        accuracy: 5000,
        provider: 'gps',
        mocked: false,
        timestamp: new Date().toISOString(),
      })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      httpStatus: 400,
    });
  });

  it('should reject GPS if timestamp is too old', async () => {
    const mockAdapter: GpsAntiSpoofAdapter = {
      check: vi.fn().mockResolvedValue({
        ok: true,
        score: 1.0,
      }),
    };

    setGpsAntiSpoofAdapter(mockAdapter);

    // Timestamp from 10 minutes ago
    const oldTimestamp = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    await expect(
      verifyGps({
        missionRunId: 'test-run-id',
        userId: 'test-user-id',
        lat: 37.5665,
        lng: 126.9780,
        accuracy: 10,
        provider: 'gps',
        mocked: false,
        timestamp: oldTimestamp,
      })
    ).rejects.toThrow('GPS timestamp too old or invalid');
  });

  it('should reject GPS if location is too far from place', async () => {
    const mockAdapter: GpsAntiSpoofAdapter = {
      check: vi.fn().mockResolvedValue({
        ok: true,
        score: 1.0,
      }),
    };

    setGpsAntiSpoofAdapter(mockAdapter);

    // Location far from Seoul (e.g., Busan)
    await expect(
      verifyGps({
        missionRunId: 'test-run-id',
        userId: 'test-user-id',
        lat: 35.1796, // Busan
        lng: 129.0756,
        accuracy: 10,
        provider: 'gps',
        mocked: false,
        timestamp: new Date().toISOString(),
      })
    ).rejects.toThrow(/Too far from place/);
  });

  it('should detect multiple anti-spoofing signals', async () => {
    // Create sophisticated adapter that checks multiple signals
    const mockAdapter: GpsAntiSpoofAdapter = {
      check: vi.fn().mockImplementation(async (input: GpsAntiSpoofInput) => {
        // Check multiple signals
        if (input.mocked === true) {
          return { ok: false, reason: 'Mock location flag detected', score: 0 };
        }
        if (input.provider === 'mock') {
          return { ok: false, reason: 'Mock provider detected', score: 0 };
        }
        if (input.accuracy > 50 && input.accuracy <= 100) {
          return { ok: false, reason: 'Suspiciously high accuracy value', score: 0.3 };
        }
        return { ok: true, score: 1.0 };
      }),
    };

    setGpsAntiSpoofAdapter(mockAdapter);

    // Test mock flag
    await expect(
      verifyGps({
        missionRunId: 'test-run-id',
        userId: 'test-user-id',
        lat: 37.5665,
        lng: 126.9780,
        accuracy: 10,
        provider: 'gps',
        mocked: true,
        timestamp: new Date().toISOString(),
      })
    ).rejects.toThrow('Mock location flag detected');

    // Test mock provider
    await expect(
      verifyGps({
        missionRunId: 'test-run-id',
        userId: 'test-user-id',
        lat: 37.5665,
        lng: 126.9780,
        accuracy: 10,
        provider: 'mock',
        mocked: false,
        timestamp: new Date().toISOString(),
      })
    ).rejects.toThrow('Mock provider detected');

    // Test suspicious accuracy (using value within valid range but flagged by anti-spoof)
    await expect(
      verifyGps({
        missionRunId: 'test-run-id',
        userId: 'test-user-id',
        lat: 37.5665,
        lng: 126.9780,
        accuracy: 75,
        provider: 'gps',
        mocked: false,
        timestamp: new Date().toISOString(),
      })
    ).rejects.toThrow('Suspiciously high accuracy value');
  });

  it('should pass with legitimate GPS data', async () => {
    const mockAdapter: GpsAntiSpoofAdapter = {
      check: vi.fn().mockResolvedValue({
        ok: true,
        score: 0.95,
      }),
    };

    setGpsAntiSpoofAdapter(mockAdapter);

    const result = await verifyGps({
      missionRunId: 'test-run-id',
      userId: 'test-user-id',
      lat: 37.5665,
      lng: 126.9780,
      accuracy: 15,
      provider: 'gps',
      mocked: false,
      deviceId: 'device-123',
      timestamp: new Date().toISOString(),
    });

    expect(result).toBeDefined();
    expect(result.status).toBe('PENDING_REVIEW');
    expect(mockAdapter.check).toHaveBeenCalledWith(
      expect.objectContaining({
        lat: 37.5665,
        lng: 126.9780,
        accuracy: 15,
        provider: 'gps',
        mocked: false,
        deviceId: 'device-123',
      })
    );
  });
});
