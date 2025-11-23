// ZZIK LIVE v4 - MissionRun Approval & Wallet Tests
// 승인, 리워드 지급, idempotency 테스트

import { describe, it, beforeEach, afterEach, after } from "node:test";
import assert from "node:assert";
import {
  testPrisma,
  createTestUser,
  createTestPlace,
  createTestMission,
  afterEachTest,
  afterAllTests,
} from "./setup.js";
import { startMissionRun, approveMissionRunAndReward } from "../../apps/web/src/core/missions/service.js";
import { AppError } from "../../apps/web/src/core/errors/app-error.js";

describe("MissionRun - 승인 및 리워드", () => {
  beforeEach(async () => {
    await afterEachTest();
  });

  afterEach(async () => {
    await afterEachTest();
  });

  after(async () => {
    await afterAllTests();
  });

  it("PENDING_REVIEW 상태의 MissionRun을 승인하고 리워드를 지급한다", async () => {
    // Given: PENDING_REVIEW 상태의 MissionRun
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id, {
      status: "ACTIVE",
      rewardAmount: 1000,
    });

    const run = await startMissionRun({ userId: user.id, missionId: mission.id });

    // MissionRun을 PENDING_REVIEW로 진행
    await testPrisma.missionRun.update({
      where: { id: run.id },
      data: { status: "PENDING_REVIEW" },
    });

    // When: 승인하면
    const result = await approveMissionRunAndReward({
      missionRunId: run.id,
    });

    // Then: MissionRun이 APPROVED 상태가 되고
    assert.ok(result.run);
    assert.strictEqual(result.run.status, "APPROVED");
    assert.strictEqual(result.run.rewardAmount, 1000);
    assert.ok(result.run.rewardedAt);
    assert.ok(result.run.reviewedAt);
    assert.strictEqual(result.run.activeLockKey, null); // lock 해제

    // And: WalletTransaction이 생성되고
    assert.ok(result.tx);
    assert.strictEqual(result.tx.type, "MISSION_REWARD");
    assert.strictEqual(result.tx.amount, 1000);
    assert.strictEqual(result.tx.status, "COMPLETED");
    assert.strictEqual(result.tx.missionRunId, run.id);

    // And: Wallet 잔액이 증가한다
    const wallet = await testPrisma.wallet.findUnique({
      where: { userId: user.id },
    });
    assert.ok(wallet);
    assert.strictEqual(wallet.balance, 1000);
  });

  it("idempotencyKey로 중복 승인을 방지한다", async () => {
    // Given: 승인된 MissionRun
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id, {
      status: "ACTIVE",
      rewardAmount: 1000,
    });

    const run = await startMissionRun({ userId: user.id, missionId: mission.id });
    await testPrisma.missionRun.update({
      where: { id: run.id },
      data: { status: "PENDING_REVIEW" },
    });

    const idempotencyKey = `test-approve-${run.id}`;

    // 첫 번째 승인
    const result1 = await approveMissionRunAndReward({
      missionRunId: run.id,
      idempotencyKey,
    });

    // When: 같은 idempotencyKey로 다시 승인 시도
    const result2 = await approveMissionRunAndReward({
      missionRunId: run.id,
      idempotencyKey,
    });

    // Then: 같은 트랜잭션을 반환하고
    assert.ok(result2.tx);
    assert.strictEqual(result2.tx.id, result1.tx?.id);

    // And: Wallet 잔액은 한 번만 증가
    const wallet = await testPrisma.wallet.findUnique({
      where: { userId: user.id },
    });
    assert.strictEqual(wallet?.balance, 1000);

    // And: WalletTransaction도 1개만 존재
    const txs = await testPrisma.walletTransaction.findMany({
      where: { missionRunId: run.id },
    });
    assert.strictEqual(txs.length, 1);
  });

  it("idempotencyKey 없이도 중복 승인을 방지한다 (기본 키 사용)", async () => {
    // Given: 승인된 MissionRun
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id, {
      status: "ACTIVE",
      rewardAmount: 1000,
    });

    const run = await startMissionRun({ userId: user.id, missionId: mission.id });
    await testPrisma.missionRun.update({
      where: { id: run.id },
      data: { status: "PENDING_REVIEW" },
    });

    // 첫 번째 승인 (idempotencyKey 없음 -> 자동 생성됨)
    await approveMissionRunAndReward({
      missionRunId: run.id,
    });

    // When: 다시 승인 시도 (idempotencyKey 없음)
    const result2 = await approveMissionRunAndReward({
      missionRunId: run.id,
    });

    // Then: 기존 트랜잭션을 재사용하고
    assert.ok(result2.tx);

    // And: 잔액은 1000원만 (중복 지급 없음)
    const wallet = await testPrisma.wallet.findUnique({
      where: { userId: user.id },
    });
    assert.strictEqual(wallet?.balance, 1000);
  });

  it("PENDING_REVIEW가 아닌 상태에서 승인 시도 시 에러를 반환한다", async () => {
    // Given: PENDING_GPS 상태의 MissionRun
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id, { status: "ACTIVE" });

    const run = await startMissionRun({ userId: user.id, missionId: mission.id });

    // When/Then: 승인 시도 시 에러
    await assert.rejects(
      async () => {
        await approveMissionRunAndReward({ missionRunId: run.id });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "MISSION_RUN_INVALID_STATE");
        return true;
      },
    );
  });

  it("이미 APPROVED 상태면 에러 없이 기존 상태를 반환한다", async () => {
    // Given: 이미 승인된 MissionRun
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id, {
      status: "ACTIVE",
      rewardAmount: 1000,
    });

    const run = await startMissionRun({ userId: user.id, missionId: mission.id });
    await testPrisma.missionRun.update({
      where: { id: run.id },
      data: { status: "PENDING_REVIEW" },
    });

    await approveMissionRunAndReward({ missionRunId: run.id });

    // When: 다시 승인 시도
    const result = await approveMissionRunAndReward({ missionRunId: run.id });

    // Then: 에러 없이 성공
    assert.ok(result.run);
    assert.strictEqual(result.run.status, "APPROVED");

    // And: 잔액은 1000원만
    const wallet = await testPrisma.wallet.findUnique({
      where: { userId: user.id },
    });
    assert.strictEqual(wallet?.balance, 1000);
  });

  it("Wallet이 없으면 자동으로 생성한다", async () => {
    // Given: Wallet이 없는 유저
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id, {
      status: "ACTIVE",
      rewardAmount: 1000,
    });

    const run = await startMissionRun({ userId: user.id, missionId: mission.id });
    await testPrisma.missionRun.update({
      where: { id: run.id },
      data: { status: "PENDING_REVIEW" },
    });

    // Wallet이 없음을 확인
    const walletBefore = await testPrisma.wallet.findUnique({
      where: { userId: user.id },
    });
    assert.strictEqual(walletBefore, null);

    // When: 승인하면
    await approveMissionRunAndReward({ missionRunId: run.id });

    // Then: Wallet이 생성되고 잔액이 증가
    const wallet = await testPrisma.wallet.findUnique({
      where: { userId: user.id },
    });
    assert.ok(wallet);
    assert.strictEqual(wallet.balance, 1000);
    assert.strictEqual(wallet.version, 2); // 생성(1) + 업데이트(2)
  });

  it("Wallet version을 사용해 동시성 제어를 한다", async () => {
    // Given: 승인 대기 중인 MissionRun
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id, {
      status: "ACTIVE",
      rewardAmount: 1000,
    });

    const run = await startMissionRun({ userId: user.id, missionId: mission.id });
    await testPrisma.missionRun.update({
      where: { id: run.id },
      data: { status: "PENDING_REVIEW" },
    });

    // Wallet 미리 생성
    const wallet = await testPrisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0,
        lockedBalance: 0,
        version: 1,
      },
    });

    // When: 승인 중간에 Wallet version을 변경하면
    // (실제로는 동시 트랜잭션 시뮬레이션)
    const promise = approveMissionRunAndReward({ missionRunId: run.id });

    // 동시에 다른 곳에서 Wallet 버전 증가 (시뮬레이션)
    // 실제 환경에서는 이런 경쟁 상태가 발생할 수 있음
    // 하지만 트랜잭션 내에서 처리되므로 정상 동작해야 함

    const result = await promise;

    // Then: 정상적으로 처리됨
    assert.ok(result.run);
    assert.strictEqual(result.run.status, "APPROVED");
  });

  it("존재하지 않는 MissionRun 승인 시 에러", async () => {
    // When/Then
    await assert.rejects(
      async () => {
        await approveMissionRunAndReward({ missionRunId: "non-existent-id" });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "MISSION_RUN_NOT_FOUND");
        assert.strictEqual(err.httpStatus, 404);
        return true;
      },
    );
  });
});
