// ZZIK LIVE v4 - MissionRun Core Tests
// 중복 방지, 생성, 상태 전이 테스트

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
import { startMissionRun } from "../../apps/web/src/core/missions/service.js";
import { AppError } from "../../apps/web/src/core/errors/app-error.js";

describe("MissionRun - 생성 및 중복 방지", () => {
  beforeEach(async () => {
    await afterEachTest();
  });

  afterEach(async () => {
    await afterEachTest();
  });

  after(async () => {
    await afterAllTests();
  });

  it("정상적으로 MissionRun을 생성한다", async () => {
    // Given: 활성 미션이 있을 때
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id, {
      status: "ACTIVE",
      rewardAmount: 1000,
    });

    // When: 미션 실행을 시작하면
    const run = await startMissionRun({
      userId: user.id,
      missionId: mission.id,
    });

    // Then: MissionRun이 생성되고
    assert.ok(run.id);
    assert.strictEqual(run.userId, user.id);
    assert.strictEqual(run.missionId, mission.id);
    assert.strictEqual(run.status, "PENDING_GPS");
    assert.ok(run.activeLockKey);
    assert.strictEqual(run.activeLockKey, `mission-run:${mission.id}:${user.id}`);
    assert.ok(run.expiresAt);
  });

  it("동일 유저가 동일 미션에 대해 중복 MissionRun 생성을 방지한다 (activeLockKey)", async () => {
    // Given: 이미 활성 MissionRun이 있을 때
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id, { status: "ACTIVE" });

    const firstRun = await startMissionRun({
      userId: user.id,
      missionId: mission.id,
    });

    // When: 같은 유저가 같은 미션을 다시 시작하려고 하면
    // Then: AppError MISSION_LIMIT_REACHED 에러가 발생한다
    await assert.rejects(
      async () => {
        await startMissionRun({
          userId: user.id,
          missionId: mission.id,
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "MISSION_LIMIT_REACHED");
        assert.strictEqual(err.httpStatus, 409);
        return true;
      },
    );

    // And: 기존 MissionRun만 존재한다
    const runs = await testPrisma.missionRun.findMany({
      where: { userId: user.id, missionId: mission.id },
    });
    assert.strictEqual(runs.length, 1);
    assert.strictEqual(runs[0].id, firstRun.id);
  });

  it("동일 유저가 다른 미션에는 MissionRun을 생성할 수 있다", async () => {
    // Given: 한 미션에 활성 MissionRun이 있을 때
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission1 = await createTestMission(place.id, { status: "ACTIVE", title: "미션 1" });
    const mission2 = await createTestMission(place.id, { status: "ACTIVE", title: "미션 2" });

    await startMissionRun({ userId: user.id, missionId: mission1.id });

    // When: 다른 미션을 시작하면
    const run2 = await startMissionRun({ userId: user.id, missionId: mission2.id });

    // Then: 정상적으로 생성된다
    assert.ok(run2.id);
    assert.strictEqual(run2.missionId, mission2.id);
  });

  it("다른 유저는 동일 미션에 MissionRun을 생성할 수 있다", async () => {
    // Given: 유저1이 미션을 시작했을 때
    const user1 = await createTestUser("user1@test.com");
    const user2 = await createTestUser("user2@test.com");
    const place = await createTestPlace();
    const mission = await createTestMission(place.id, { status: "ACTIVE" });

    await startMissionRun({ userId: user1.id, missionId: mission.id });

    // When: 유저2가 같은 미션을 시작하면
    const run2 = await startMissionRun({ userId: user2.id, missionId: mission.id });

    // Then: 정상적으로 생성된다
    assert.ok(run2.id);
    assert.strictEqual(run2.userId, user2.id);
  });

  it("미션이 ACTIVE 상태가 아니면 MissionRun을 생성할 수 없다", async () => {
    // Given: DRAFT 상태의 미션
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id, { status: "DRAFT" });

    // When/Then: 미션 시작 시 에러 발생
    await assert.rejects(
      async () => {
        await startMissionRun({ userId: user.id, missionId: mission.id });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "MISSION_NOT_FOUND");
        assert.strictEqual(err.httpStatus, 404);
        return true;
      },
    );
  });

  it("미션의 시작 시간이 아직 안 됐으면 MissionRun을 생성할 수 없다", async () => {
    // Given: 내일 시작하는 미션
    const user = await createTestUser();
    const place = await createTestPlace();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const mission = await createTestMission(place.id, {
      status: "ACTIVE",
      startAt: tomorrow,
    });

    // When/Then: 에러 발생
    await assert.rejects(
      async () => {
        await startMissionRun({ userId: user.id, missionId: mission.id });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "MISSION_INACTIVE");
        return true;
      },
    );
  });

  it("미션의 종료 시간이 지났으면 MissionRun을 생성할 수 없다", async () => {
    // Given: 어제 종료된 미션
    const user = await createTestUser();
    const place = await createTestPlace();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const mission = await createTestMission(place.id, {
      status: "ACTIVE",
      startAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endAt: yesterday,
    });

    // When/Then: 에러 발생
    await assert.rejects(
      async () => {
        await startMissionRun({ userId: user.id, missionId: mission.id });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "MISSION_INACTIVE");
        return true;
      },
    );
  });

  it("maxRunsPerUser 제한을 초과하면 MissionRun을 생성할 수 없다", async () => {
    // Given: maxRunsPerUser=1인 미션에서 이미 1개를 완료했을 때
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id, {
      status: "ACTIVE",
      maxRunsPerUser: 1,
    });

    // 첫 번째 MissionRun 생성 및 승인
    const firstRun = await startMissionRun({ userId: user.id, missionId: mission.id });
    await testPrisma.missionRun.update({
      where: { id: firstRun.id },
      data: {
        status: "APPROVED",
        activeLockKey: null, // 완료 시 lock key 제거
      },
    });

    // When/Then: 두 번째 시도 시 에러
    await assert.rejects(
      async () => {
        await startMissionRun({ userId: user.id, missionId: mission.id });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "MISSION_LIMIT_REACHED");
        return true;
      },
    );
  });

  it("activeLockKey가 null이 되면 다시 MissionRun을 생성할 수 있다 (재참여)", async () => {
    // Given: MissionRun이 완료되어 activeLockKey가 null인 상태
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id, {
      status: "ACTIVE",
      maxRunsPerUser: 2, // 2회까지 가능
    });

    const firstRun = await startMissionRun({ userId: user.id, missionId: mission.id });

    // 완료 처리 (activeLockKey를 null로)
    await testPrisma.missionRun.update({
      where: { id: firstRun.id },
      data: {
        status: "APPROVED",
        activeLockKey: null,
      },
    });

    // When: 다시 시작하면
    const secondRun = await startMissionRun({ userId: user.id, missionId: mission.id });

    // Then: 새로운 MissionRun이 생성된다
    assert.ok(secondRun.id);
    assert.notStrictEqual(secondRun.id, firstRun.id);
    assert.strictEqual(secondRun.status, "PENDING_GPS");
    assert.ok(secondRun.activeLockKey);
  });
});
