// ZZIK Backend Tests - Concurrency and Race Conditions
// Tests for concurrent operations and race condition handling

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  testPrisma,
  cleanupTestData,
  createTestUser,
  createTestPlace,
  createTestMission,
} from "./setup";
import { startMissionRun, approveMissionRunAndReward } from "@/core/missions/service";
import { verifyGps } from "@/core/missions/steps/gps";

describe("Concurrency and Race Conditions", () => {
  before(async () => {
    await cleanupTestData();
  });

  after(async () => {
    await cleanupTestData();
  });

  it("여러 유저가 동시에 같은 미션을 시작할 수 있다", async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const user3 = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id, {
      title: "Concurrent Mission Start",
      rewardAmount: 1000,
    });

    // Start missions concurrently
    const [run1, run2, run3] = await Promise.all([
      startMissionRun({ userId: user1.id, missionId: mission.id }),
      startMissionRun({ userId: user2.id, missionId: mission.id }),
      startMissionRun({ userId: user3.id, missionId: mission.id }),
    ]);

    // All runs should be created successfully
    assert.ok(run1.id);
    assert.ok(run2.id);
    assert.ok(run3.id);

    // All runs should be in PENDING_GPS state
    assert.strictEqual(run1.status, "PENDING_GPS");
    assert.strictEqual(run2.status, "PENDING_GPS");
    assert.strictEqual(run3.status, "PENDING_GPS");

    // Each run should have a different ID
    assert.notStrictEqual(run1.id, run2.id);
    assert.notStrictEqual(run2.id, run3.id);
    assert.notStrictEqual(run1.id, run3.id);
  });

  it("한 유저가 같은 미션을 동시에 여러 번 시작하면 하나만 성공한다 (activeLockKey)", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);

    // Try to start mission twice concurrently
    const results = await Promise.allSettled([
      startMissionRun({ userId: user.id, missionId: mission.id }),
      startMissionRun({ userId: user.id, missionId: mission.id }),
      startMissionRun({ userId: user.id, missionId: mission.id }),
    ]);

    // Only one should succeed
    const successful = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected");

    assert.strictEqual(successful.length, 1, "Only one mission run should succeed");
    assert.strictEqual(failed.length, 2, "Two should fail");

    // Failed ones should have error about active mission
    for (const result of failed) {
      if (result.status === "rejected") {
        assert.ok(
          result.reason.message.includes("active") ||
          result.reason.code === "ACTIVE_MISSION_RUN_EXISTS"
        );
      }
    }
  });

  it("여러 유저의 지갑에 동시에 리워드를 지급해도 정확하게 처리된다 (Optimistic Locking)", async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const user3 = await createTestUser();
    const place = await createTestPlace();

    const mission1 = await createTestMission(place.id, {
      title: "Mission 1",
      rewardAmount: 1000,
      verificationSpec: { steps: ["GPS"], gps: true },
    });

    const mission2 = await createTestMission(place.id, {
      title: "Mission 2",
      rewardAmount: 1500,
      verificationSpec: { steps: ["GPS"], gps: true },
    });

    const mission3 = await createTestMission(place.id, {
      title: "Mission 3",
      rewardAmount: 2000,
      verificationSpec: { steps: ["GPS"], gps: true },
    });

    // Complete missions for all users
    const run1 = await startMissionRun({ userId: user1.id, missionId: mission1.id });
    const run2 = await startMissionRun({ userId: user2.id, missionId: mission2.id });
    const run3 = await startMissionRun({ userId: user3.id, missionId: mission3.id });

    await Promise.all([
      verifyGps({
        missionRunId: run1.id,
        userId: user1.id,
        lat: place.latitude,
        lng: place.longitude,
        accuracy: 15,
        provider: "gps",
        timestamp: new Date().toISOString(),
      }),
      verifyGps({
        missionRunId: run2.id,
        userId: user2.id,
        lat: place.latitude,
        lng: place.longitude,
        accuracy: 15,
        provider: "gps",
        timestamp: new Date().toISOString(),
      }),
      verifyGps({
        missionRunId: run3.id,
        userId: user3.id,
        lat: place.latitude,
        lng: place.longitude,
        accuracy: 15,
        provider: "gps",
        timestamp: new Date().toISOString(),
      }),
    ]);

    // Approve all concurrently
    await Promise.all([
      approveMissionRunAndReward({ missionRunId: run1.id }),
      approveMissionRunAndReward({ missionRunId: run2.id }),
      approveMissionRunAndReward({ missionRunId: run3.id }),
    ]);

    // Check wallets
    const wallet1 = await testPrisma.wallet.findUnique({
      where: { userId: user1.id },
    });
    const wallet2 = await testPrisma.wallet.findUnique({
      where: { userId: user2.id },
    });
    const wallet3 = await testPrisma.wallet.findUnique({
      where: { userId: user3.id },
    });

    assert.strictEqual(wallet1?.balance, 1000);
    assert.strictEqual(wallet2?.balance, 1500);
    assert.strictEqual(wallet3?.balance, 2000);
  });

  it("같은 미션 런을 동시에 여러 번 승인해도 한 번만 리워드가 지급된다 (Idempotency)", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id, {
      rewardAmount: 1000,
      verificationSpec: { steps: ["GPS"], gps: true },
    });

    const run = await startMissionRun({ userId: user.id, missionId: mission.id });

    await verifyGps({
      missionRunId: run.id,
      userId: user.id,
      lat: place.latitude,
      lng: place.longitude,
      accuracy: 15,
      provider: "gps",
      timestamp: new Date().toISOString(),
    });

    // Try to approve multiple times with same idempotency key
    const idempotencyKey = "test-idempotency-key-123";

    const results = await Promise.allSettled([
      approveMissionRunAndReward({ missionRunId: run.id, idempotencyKey }),
      approveMissionRunAndReward({ missionRunId: run.id, idempotencyKey }),
      approveMissionRunAndReward({ missionRunId: run.id, idempotencyKey }),
    ]);

    // One should succeed, others should fail or return same result
    const successful = results.filter((r) => r.status === "fulfilled");

    // At least one should succeed
    assert.ok(successful.length >= 1);

    // Check wallet balance - should only have 1000
    const wallet = await testPrisma.wallet.findUnique({
      where: { userId: user.id },
    });
    assert.strictEqual(wallet?.balance, 1000);

    // Check transactions - should only have 1
    const transactions = await testPrisma.walletTransaction.findMany({
      where: { walletId: wallet!.id },
    });
    assert.strictEqual(transactions.length, 1);
  });

  it("한 유저가 여러 미션을 동시에 완료하면 잔액이 정확하게 누적된다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();

    const missions = await Promise.all([
      createTestMission(place.id, {
        title: "Mission A",
        rewardAmount: 500,
        verificationSpec: { steps: ["GPS"], gps: true },
      }),
      createTestMission(place.id, {
        title: "Mission B",
        rewardAmount: 700,
        verificationSpec: { steps: ["GPS"], gps: true },
      }),
      createTestMission(place.id, {
        title: "Mission C",
        rewardAmount: 300,
        verificationSpec: { steps: ["GPS"], gps: true },
      }),
    ]);

    // Start all missions
    const runs = await Promise.all(
      missions.map((m) => startMissionRun({ userId: user.id, missionId: m.id }))
    );

    // Verify GPS for all
    await Promise.all(
      runs.map((run) =>
        verifyGps({
          missionRunId: run.id,
          userId: user.id,
          lat: place.latitude,
          lng: place.longitude,
          accuracy: 15,
          provider: "gps",
          timestamp: new Date().toISOString(),
        })
      )
    );

    // Approve all concurrently
    await Promise.all(
      runs.map((run) => approveMissionRunAndReward({ missionRunId: run.id }))
    );

    // Check wallet balance
    const wallet = await testPrisma.wallet.findUnique({
      where: { userId: user.id },
    });

    assert.strictEqual(wallet?.balance, 1500); // 500 + 700 + 300

    // Check wallet version (should be 4: initial + 3 deposits)
    assert.strictEqual(wallet?.version, 4);
  });

  it("지갑 버전 충돌이 발생하면 재시도로 처리된다 (Optimistic Locking Retry)", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();

    // Create 5 missions with small rewards
    const missions = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        createTestMission(place.id, {
          title: `Concurrent Mission ${i + 1}`,
          rewardAmount: 100,
          verificationSpec: { steps: ["GPS"], gps: true },
        })
      )
    );

    // Start and complete all missions
    const runs = await Promise.all(
      missions.map((m) => startMissionRun({ userId: user.id, missionId: m.id }))
    );

    await Promise.all(
      runs.map((run) =>
        verifyGps({
          missionRunId: run.id,
          userId: user.id,
          lat: place.latitude,
          lng: place.longitude,
          accuracy: 15,
          provider: "gps",
          timestamp: new Date().toISOString(),
        })
      )
    );

    // Approve all at exactly the same time to maximize version conflicts
    await Promise.all(
      runs.map((run) => approveMissionRunAndReward({ missionRunId: run.id }))
    );

    // Check final balance
    const wallet = await testPrisma.wallet.findUnique({
      where: { userId: user.id },
    });

    assert.strictEqual(wallet?.balance, 500); // 5 x 100

    // Check that all transactions were recorded
    const transactions = await testPrisma.walletTransaction.findMany({
      where: { walletId: wallet!.id },
    });

    assert.strictEqual(transactions.length, 5);
  });
});
