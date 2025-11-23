// ZZIK Backend Tests - Complete Verification Flow
// End-to-end tests for GPS → QR → Reels → Approval → Reward flow

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
import { startMissionRun, approveMissionRunAndReward } from "@/core/missions/service";
import { verifyGps } from "@/core/missions/steps/gps";
import { verifyQr } from "@/core/missions/steps/qr";
import { verifyReels } from "@/core/missions/steps/reels";
import type { ReelsMetadata } from "@/core/reels/types";

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

describe("Complete Verification Flow", () => {
  before(async () => {
    await cleanupTestData();
    process.env.QR_SIGNING_SECRET = "test-secret";
  });

  after(async () => {
    await cleanupTestData();
  });

  it("전체 플로우: GPS → QR → Reels → Approval → Reward", async () => {
    const user = await createTestUser();
    const place = await createTestPlace({
      latitude: 37.5665,
      longitude: 126.978,
    });
    const mission = await createTestMission(place.id, {
      title: "Complete Flow Test Mission",
      rewardAmount: 1000,
      verificationSpec: {
        steps: ["GPS", "QR", "REELS"],
        gps: true,
        qr: true,
        reels: true,
      },
    });

    // Step 1: Start mission run
    const run = await startMissionRun({
      userId: user.id,
      missionId: mission.id,
    });

    assert.strictEqual(run.status, "PENDING_GPS");
    assert.ok(run.activeLockKey);

    // Step 2: GPS verification
    const gpsResult = await verifyGps({
      missionRunId: run.id,
      userId: user.id,
      lat: 37.5665,
      lng: 126.978,
      accuracy: 15,
      provider: "gps",
      timestamp: new Date().toISOString(),
    });

    assert.strictEqual(gpsResult.status, "PENDING_QR");
    assert.ok(gpsResult.gpsVerifiedAt);

    // Step 3: QR verification
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

    const qrResult = await verifyQr({
      missionRunId: run.id,
      userId: user.id,
      rawPayload: qrPayload,
    });

    assert.strictEqual(qrResult.status, "PENDING_REELS");
    assert.ok(qrResult.qrVerifiedAt);

    // Verify nonce was marked as used
    const usedNonce = await testPrisma.qrNonce.findUnique({
      where: { nonce },
    });
    assert.ok(usedNonce?.usedAt);
    assert.strictEqual(usedNonce?.usedBy, user.id);

    // Step 4: Reels verification
    const reelsMetadata: ReelsMetadata = {
      platform: "instagram",
      url: "https://www.instagram.com/reel/ABC123/",
      hashtags: ["zzik", mission.id],
      caption: "Test mission completion!",
    };

    const reelsResult = await verifyReels({
      missionRunId: run.id,
      userId: user.id,
      metadata: reelsMetadata,
    });

    assert.strictEqual(reelsResult.status, "PENDING_REVIEW");
    assert.ok(reelsResult.reelsUploadedAt);

    // Step 5: Approval and reward
    const { run: approvedRun, tx } = await approveMissionRunAndReward({
      missionRunId: run.id,
    });

    assert.strictEqual(approvedRun.status, "APPROVED");
    assert.strictEqual(approvedRun.rewardAmount, 1000);
    assert.ok(approvedRun.reviewedAt);
    assert.ok(approvedRun.rewardedAt);
    assert.ok(tx);

    // Verify wallet was credited
    const wallet = await testPrisma.wallet.findUnique({
      where: { userId: user.id },
    });
    assert.strictEqual(wallet?.balance, 1000);
    assert.strictEqual(wallet?.version, 2); // 1 + 1

    // Verify transaction was recorded
    const transaction = await testPrisma.walletTransaction.findUnique({
      where: { id: tx.id },
    });
    assert.strictEqual(transaction?.amount, 1000);
    assert.strictEqual(transaction?.type, "MISSION_REWARD");
    assert.strictEqual(transaction?.refId, run.id);

    // Verify activeLockKey was cleared
    const finalRun = await testPrisma.missionRun.findUnique({
      where: { id: run.id },
    });
    assert.strictEqual(finalRun?.activeLockKey, null);
  });

  it("GPS만 있는 미션: GPS → Approval → Reward", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id, {
      title: "GPS Only Mission",
      rewardAmount: 500,
      verificationSpec: {
        steps: ["GPS"],
        gps: true,
      },
    });

    const run = await startMissionRun({
      userId: user.id,
      missionId: mission.id,
    });

    const gpsResult = await verifyGps({
      missionRunId: run.id,
      userId: user.id,
      lat: place.latitude,
      lng: place.longitude,
      accuracy: 15,
      provider: "gps",
      timestamp: new Date().toISOString(),
    });

    assert.strictEqual(gpsResult.status, "PENDING_REVIEW");

    const { run: approvedRun } = await approveMissionRunAndReward({
      missionRunId: run.id,
    });

    assert.strictEqual(approvedRun.status, "APPROVED");
    assert.strictEqual(approvedRun.rewardAmount, 500);

    const wallet = await testPrisma.wallet.findUnique({
      where: { userId: user.id },
    });
    assert.strictEqual(wallet?.balance, 500);
  });

  it("GPS + QR 미션: GPS → QR → Approval → Reward", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id, {
      title: "GPS + QR Mission",
      rewardAmount: 750,
      verificationSpec: {
        steps: ["GPS", "QR"],
        gps: true,
        qr: true,
      },
    });

    const run = await startMissionRun({
      userId: user.id,
      missionId: mission.id,
    });

    // GPS
    await verifyGps({
      missionRunId: run.id,
      userId: user.id,
      lat: place.latitude,
      lng: place.longitude,
      accuracy: 15,
      provider: "gps",
      timestamp: new Date().toISOString(),
    });

    // QR
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

    const qrResult = await verifyQr({
      missionRunId: run.id,
      userId: user.id,
      rawPayload: qrPayload,
    });

    assert.strictEqual(qrResult.status, "PENDING_REVIEW");

    // Approval
    const { run: approvedRun } = await approveMissionRunAndReward({
      missionRunId: run.id,
    });

    assert.strictEqual(approvedRun.status, "APPROVED");
    assert.strictEqual(approvedRun.rewardAmount, 750);

    const wallet = await testPrisma.wallet.findUnique({
      where: { userId: user.id },
    });
    assert.strictEqual(wallet?.balance, 750);
  });

  it("여러 유저가 동일 미션을 완료하면 각각 리워드를 받는다", async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id, {
      title: "Multi-user Mission",
      rewardAmount: 1000,
      verificationSpec: {
        steps: ["GPS"],
        gps: true,
      },
    });

    // User 1 completes mission
    const run1 = await startMissionRun({
      userId: user1.id,
      missionId: mission.id,
    });

    await verifyGps({
      missionRunId: run1.id,
      userId: user1.id,
      lat: place.latitude,
      lng: place.longitude,
      accuracy: 15,
      provider: "gps",
      timestamp: new Date().toISOString(),
    });

    await approveMissionRunAndReward({ missionRunId: run1.id });

    // User 2 completes mission
    const run2 = await startMissionRun({
      userId: user2.id,
      missionId: mission.id,
    });

    await verifyGps({
      missionRunId: run2.id,
      userId: user2.id,
      lat: place.latitude,
      lng: place.longitude,
      accuracy: 15,
      provider: "gps",
      timestamp: new Date().toISOString(),
    });

    await approveMissionRunAndReward({ missionRunId: run2.id });

    // Both wallets should have 1000
    const wallet1 = await testPrisma.wallet.findUnique({
      where: { userId: user1.id },
    });
    const wallet2 = await testPrisma.wallet.findUnique({
      where: { userId: user2.id },
    });

    assert.strictEqual(wallet1?.balance, 1000);
    assert.strictEqual(wallet2?.balance, 1000);
  });

  it("한 유저가 여러 미션을 완료하면 잔액이 누적된다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();

    const mission1 = await createTestMission(place.id, {
      title: "Mission 1",
      rewardAmount: 500,
      verificationSpec: {
        steps: ["GPS"],
        gps: true,
      },
    });

    const mission2 = await createTestMission(place.id, {
      title: "Mission 2",
      rewardAmount: 750,
      verificationSpec: {
        steps: ["GPS"],
        gps: true,
      },
    });

    // Complete mission 1
    const run1 = await startMissionRun({
      userId: user.id,
      missionId: mission1.id,
    });

    await verifyGps({
      missionRunId: run1.id,
      userId: user.id,
      lat: place.latitude,
      lng: place.longitude,
      accuracy: 15,
      provider: "gps",
      timestamp: new Date().toISOString(),
    });

    await approveMissionRunAndReward({ missionRunId: run1.id });

    let wallet = await testPrisma.wallet.findUnique({
      where: { userId: user.id },
    });
    assert.strictEqual(wallet?.balance, 500);

    // Complete mission 2
    const run2 = await startMissionRun({
      userId: user.id,
      missionId: mission2.id,
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

    await approveMissionRunAndReward({ missionRunId: run2.id });

    wallet = await testPrisma.wallet.findUnique({
      where: { userId: user.id },
    });
    assert.strictEqual(wallet?.balance, 1250); // 500 + 750
  });

  it("검증 단계를 건너뛸 수 없다 (GPS를 건너뛰고 QR 시도)", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);

    const run = await startMissionRun({
      userId: user.id,
      missionId: mission.id,
    });

    // Try to verify QR without GPS
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
      {
        code: "MISSION_RUN_INVALID_STATE",
      },
    );
  });
});
