// ZZIK Backend Tests - QR Verification
// Tests for QR verification step

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import {
  testPrisma,
  cleanupTestData,
  createTestUser,
  createTestPlace,
  createTestMission,
} from "./setup";
import { verifyQr } from "@/core/missions/steps/qr";
import { verifyGps } from "@/core/missions/steps/gps";
import { startMissionRun } from "@/core/missions/service";
import { AppError } from "@/core/errors/app-error";

// Helper to generate valid QR payload
function generateQrPayload(params: {
  missionId: string;
  placeId: string;
  nonce: string;
}): string {
  const secret = process.env.QR_SIGNING_SECRET || "test-secret";
  const base = `${params.missionId}.${params.placeId}.${params.nonce}`;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(base);
  const sig = hmac.digest("hex");

  return `zzik://verify?mid=${params.missionId}&pid=${params.placeId}&nonce=${params.nonce}&sig=${sig}`;
}

// Helper to advance MissionRun to PENDING_QR state
async function advanceToPendingQr(params: {
  userId: string;
  missionId: string;
  placeLatitude: number;
  placeLongitude: number;
}) {
  const run = await startMissionRun({
    userId: params.userId,
    missionId: params.missionId,
  });

  await verifyGps({
    missionRunId: run.id,
    userId: params.userId,
    lat: params.placeLatitude,
    lng: params.placeLongitude,
    accuracy: 15,
    provider: "gps",
    timestamp: new Date().toISOString(),
  });

  const updated = await testPrisma.missionRun.findUniqueOrThrow({
    where: { id: run.id },
  });

  assert.strictEqual(updated.status, "PENDING_QR");
  return updated;
}

describe("QR Verification", () => {
  before(async () => {
    await cleanupTestData();
    // Set QR secret for tests
    process.env.QR_SIGNING_SECRET = "test-secret";
  });

  after(async () => {
    await cleanupTestData();
  });

  it("정상적인 QR 코드로 검증에 성공한다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);

    // Advance to PENDING_QR
    const run = await advanceToPendingQr({
      userId: user.id,
      missionId: mission.id,
      placeLatitude: place.latitude,
      placeLongitude: place.longitude,
    });

    // Create nonce
    const nonce = crypto.randomUUID();
    await testPrisma.qrNonce.create({
      data: {
        nonce,
        missionId: mission.id,
        placeId: place.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    // Generate valid QR payload
    const qrPayload = generateQrPayload({
      missionId: mission.id,
      placeId: place.id,
      nonce,
    });

    const result = await verifyQr({
      missionRunId: run.id,
      userId: user.id,
      rawPayload: qrPayload,
    });

    assert.strictEqual(result.status, "PENDING_REELS");
    assert.ok(result.qrVerifiedAt);

    // Nonce should be marked as used
    const usedNonce = await testPrisma.qrNonce.findUnique({
      where: { nonce },
    });
    assert.ok(usedNonce?.usedAt);
    assert.strictEqual(usedNonce?.usedBy, user.id);
  });

  it("잘못된 서명을 가진 QR 코드는 거부된다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);

    const run = await advanceToPendingQr({
      userId: user.id,
      missionId: mission.id,
      placeLatitude: place.latitude,
      placeLongitude: place.longitude,
    });

    const nonce = crypto.randomUUID();
    await testPrisma.qrNonce.create({
      data: {
        nonce,
        missionId: mission.id,
        placeId: place.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    // Invalid signature
    const invalidQr = `zzik://verify?mid=${mission.id}&pid=${place.id}&nonce=${nonce}&sig=invalid`;

    await assert.rejects(
      async () => {
        await verifyQr({
          missionRunId: run.id,
          userId: user.id,
          rawPayload: invalidQr,
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "VALIDATION_ERROR");
        assert.ok(err.message.includes("signature"));
        return true;
      },
    );
  });

  it("missionId가 일치하지 않는 QR 코드는 거부된다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission1 = await createTestMission(place.id, { title: "Mission 1" });
    const mission2 = await createTestMission(place.id, { title: "Mission 2" });

    const run = await advanceToPendingQr({
      userId: user.id,
      missionId: mission1.id,
      placeLatitude: place.latitude,
      placeLongitude: place.longitude,
    });

    const nonce = crypto.randomUUID();
    await testPrisma.qrNonce.create({
      data: {
        nonce,
        missionId: mission2.id, // Different mission
        placeId: place.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const qrPayload = generateQrPayload({
      missionId: mission2.id,
      placeId: place.id,
      nonce,
    });

    await assert.rejects(
      async () => {
        await verifyQr({
          missionRunId: run.id,
          userId: user.id,
          rawPayload: qrPayload,
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "VALIDATION_ERROR");
        assert.ok(err.message.includes("match mission"));
        return true;
      },
    );
  });

  it("이미 사용된 nonce는 재사용할 수 없다 (replay attack 방지)", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);

    // First run
    const run1 = await advanceToPendingQr({
      userId: user.id,
      missionId: mission.id,
      placeLatitude: place.latitude,
      placeLongitude: place.longitude,
    });

    const nonce = crypto.randomUUID();
    await testPrisma.qrNonce.create({
      data: {
        nonce,
        missionId: mission.id,
        placeId: place.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const qrPayload = generateQrPayload({
      missionId: mission.id,
      placeId: place.id,
      nonce,
    });

    // First verification succeeds
    await verifyQr({
      missionRunId: run1.id,
      userId: user.id,
      rawPayload: qrPayload,
    });

    // Complete the first run by marking it as REJECTED
    // This clears the activeLockKey and allows a second run
    await testPrisma.missionRun.update({
      where: { id: run1.id },
      data: {
        status: "REJECTED",
        activeLockKey: null,
      },
    });

    const run2 = await startMissionRun({
      userId: user.id,
      missionId: mission.id,
    });

    await verifyGps({
      missionRunId: run2.id,
      userId: user.id,
      lat: place.latitude,
      lng: place.longitude,
      accuracy: 15,
      provider: "gps",
      timestamp: new Date().toISOString(),
    });

    // Second verification with same nonce should fail
    await assert.rejects(
      async () => {
        await verifyQr({
          missionRunId: run2.id,
          userId: user.id,
          rawPayload: qrPayload, // Same QR code
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "VALIDATION_ERROR");
        assert.ok(err.message.includes("already used") || err.message.includes("replay"));
        return true;
      },
    );
  });

  it("만료된 nonce는 사용할 수 없다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);

    const run = await advanceToPendingQr({
      userId: user.id,
      missionId: mission.id,
      placeLatitude: place.latitude,
      placeLongitude: place.longitude,
    });

    const nonce = crypto.randomUUID();
    await testPrisma.qrNonce.create({
      data: {
        nonce,
        missionId: mission.id,
        placeId: place.id,
        expiresAt: new Date(Date.now() - 1000), // Already expired
      },
    });

    const qrPayload = generateQrPayload({
      missionId: mission.id,
      placeId: place.id,
      nonce,
    });

    await assert.rejects(
      async () => {
        await verifyQr({
          missionRunId: run.id,
          userId: user.id,
          rawPayload: qrPayload,
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "VALIDATION_ERROR");
        assert.ok(err.message.includes("expired"));
        return true;
      },
    );
  });

  it("존재하지 않는 nonce는 거부된다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);

    const run = await advanceToPendingQr({
      userId: user.id,
      missionId: mission.id,
      placeLatitude: place.latitude,
      placeLongitude: place.longitude,
    });

    const nonce = crypto.randomUUID();
    // No nonce created in DB

    const qrPayload = generateQrPayload({
      missionId: mission.id,
      placeId: place.id,
      nonce,
    });

    await assert.rejects(
      async () => {
        await verifyQr({
          missionRunId: run.id,
          userId: user.id,
          rawPayload: qrPayload,
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "VALIDATION_ERROR");
        assert.ok(err.message.includes("not found") || err.message.includes("invalid"));
        return true;
      },
    );
  });

  it("다른 사용자의 MissionRun에 대해 QR 검증을 시도하면 권한 에러", async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);

    const run = await advanceToPendingQr({
      userId: user1.id,
      missionId: mission.id,
      placeLatitude: place.latitude,
      placeLongitude: place.longitude,
    });

    const nonce = crypto.randomUUID();
    await testPrisma.qrNonce.create({
      data: {
        nonce,
        missionId: mission.id,
        placeId: place.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const qrPayload = generateQrPayload({
      missionId: mission.id,
      placeId: place.id,
      nonce,
    });

    await assert.rejects(
      async () => {
        await verifyQr({
          missionRunId: run.id,
          userId: user2.id, // Different user
          rawPayload: qrPayload,
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "PERMISSION_DENIED");
        return true;
      },
    );
  });

  it("PENDING_QR 상태가 아니면 QR 검증을 할 수 없다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);

    // Start mission run (status: PENDING_GPS, not PENDING_QR)
    const run = await startMissionRun({
      userId: user.id,
      missionId: mission.id,
    });

    const nonce = crypto.randomUUID();
    await testPrisma.qrNonce.create({
      data: {
        nonce,
        missionId: mission.id,
        placeId: place.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const qrPayload = generateQrPayload({
      missionId: mission.id,
      placeId: place.id,
      nonce,
    });

    await assert.rejects(
      async () => {
        await verifyQr({
          missionRunId: run.id,
          userId: user.id,
          rawPayload: qrPayload,
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "MISSION_RUN_INVALID_STATE");
        return true;
      },
    );
  });

  it("GPS + QR 미션은 검증 후 PENDING_REVIEW로 이동한다 (Reels 없음)", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id, {
      verificationSpec: {
        steps: ["GPS", "QR"],
        gps: true,
        qr: true,
      },
    });

    const run = await advanceToPendingQr({
      userId: user.id,
      missionId: mission.id,
      placeLatitude: place.latitude,
      placeLongitude: place.longitude,
    });

    const nonce = crypto.randomUUID();
    await testPrisma.qrNonce.create({
      data: {
        nonce,
        missionId: mission.id,
        placeId: place.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const qrPayload = generateQrPayload({
      missionId: mission.id,
      placeId: place.id,
      nonce,
    });

    const result = await verifyQr({
      missionRunId: run.id,
      userId: user.id,
      rawPayload: qrPayload,
    });

    assert.strictEqual(result.status, "PENDING_REVIEW");
  });
});
