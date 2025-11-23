// ZZIK Backend Tests - GPS Verification
// Tests for GPS verification step

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  testPrisma,
  cleanupTestData,
  createTestUser,
  createTestPlace,
  createTestMission,
} from "./setup";
import { verifyGps } from "@/core/missions/steps/gps";
import { startMissionRun } from "@/core/missions/service";
import { AppError } from "@/core/errors/app-error";

describe("GPS Verification", () => {
  before(async () => {
    await cleanupTestData();
  });

  after(async () => {
    await cleanupTestData();
  });

  it("정상적인 GPS 좌표로 검증에 성공한다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace({
      latitude: 37.5665,
      longitude: 126.978,
    });
    const mission = await createTestMission(place.id, {
      title: "GPS Test Mission",
    });

    // Start mission run (status: PENDING_GPS)
    const run = await startMissionRun({
      userId: user.id,
      missionId: mission.id,
    });

    assert.strictEqual(run.status, "PENDING_GPS");

    // Verify GPS (within 100m radius)
    const result = await verifyGps({
      missionRunId: run.id,
      userId: user.id,
      lat: 37.5666, // ~11m away
      lng: 126.9781,
      accuracy: 15,
      provider: "gps",
      mocked: false,
      timestamp: new Date().toISOString(),
    });

    assert.strictEqual(result.status, "PENDING_QR");
    assert.ok(result.gpsVerifiedAt);
  });

  it("accuracy가 너무 낮으면 (>80m) 검증에 실패한다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);
    const run = await startMissionRun({ userId: user.id, missionId: mission.id });

    await assert.rejects(
      async () => {
        await verifyGps({
          missionRunId: run.id,
          userId: user.id,
          lat: 37.5665,
          lng: 126.978,
          accuracy: 100, // > 80m
          provider: "gps",
          timestamp: new Date().toISOString(),
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "VALIDATION_ERROR");
        assert.ok(err.message.includes("accuracy"));
        return true;
      },
    );
  });

  it("timestamp가 너무 오래되면 (>2분) 검증에 실패한다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);
    const run = await startMissionRun({ userId: user.id, missionId: mission.id });

    const oldTimestamp = new Date(Date.now() - 3 * 60 * 1000); // 3 minutes ago

    await assert.rejects(
      async () => {
        await verifyGps({
          missionRunId: run.id,
          userId: user.id,
          lat: 37.5665,
          lng: 126.978,
          accuracy: 15,
          provider: "gps",
          timestamp: oldTimestamp.toISOString(),
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "VALIDATION_ERROR");
        assert.ok(err.message.includes("timestamp"));
        return true;
      },
    );
  });

  it("장소에서 너무 멀리 떨어져 있으면 (>100m) 검증에 실패한다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace({
      latitude: 37.5665,
      longitude: 126.978,
    });
    const mission = await createTestMission(place.id);
    const run = await startMissionRun({ userId: user.id, missionId: mission.id });

    // ~500m away
    await assert.rejects(
      async () => {
        await verifyGps({
          missionRunId: run.id,
          userId: user.id,
          lat: 37.5710,
          lng: 126.978,
          accuracy: 15,
          provider: "gps",
          timestamp: new Date().toISOString(),
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "VALIDATION_ERROR");
        assert.ok(err.message.includes("far from place"));
        return true;
      },
    );
  });

  it("mocked GPS는 안티스푸핑 검사에서 차단된다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);
    const run = await startMissionRun({ userId: user.id, missionId: mission.id });

    await assert.rejects(
      async () => {
        await verifyGps({
          missionRunId: run.id,
          userId: user.id,
          lat: 37.5665,
          lng: 126.978,
          accuracy: 15,
          provider: "gps",
          mocked: true, // Mocked GPS
          timestamp: new Date().toISOString(),
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "VALIDATION_ERROR");
        assert.ok(
          err.message.toLowerCase().includes("spoof") ||
          err.message.toLowerCase().includes("mock"),
        );
        return true;
      },
    );
  });

  it("다른 사용자의 MissionRun에 대해 GPS 검증을 시도하면 권한 에러", async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);
    const run = await startMissionRun({ userId: user1.id, missionId: mission.id });

    await assert.rejects(
      async () => {
        await verifyGps({
          missionRunId: run.id,
          userId: user2.id, // Different user
          lat: 37.5665,
          lng: 126.978,
          accuracy: 15,
          provider: "gps",
          timestamp: new Date().toISOString(),
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "PERMISSION_DENIED");
        return true;
      },
    );
  });

  it("PENDING_GPS 상태가 아니면 GPS 검증을 할 수 없다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);
    const run = await startMissionRun({ userId: user.id, missionId: mission.id });

    // First verification succeeds
    await verifyGps({
      missionRunId: run.id,
      userId: user.id,
      lat: 37.5665,
      lng: 126.978,
      accuracy: 15,
      provider: "gps",
      timestamp: new Date().toISOString(),
    });

    // Second verification should fail (status is now PENDING_QR)
    await assert.rejects(
      async () => {
        await verifyGps({
          missionRunId: run.id,
          userId: user.id,
          lat: 37.5665,
          lng: 126.978,
          accuracy: 15,
          provider: "gps",
          timestamp: new Date().toISOString(),
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "MISSION_RUN_INVALID_STATE");
        return true;
      },
    );
  });

  it("expiresAt을 넘긴 MissionRun은 GPS 검증을 할 수 없다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);
    const run = await startMissionRun({ userId: user.id, missionId: mission.id });

    // Manually expire the run
    await testPrisma.missionRun.update({
      where: { id: run.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    await assert.rejects(
      async () => {
        await verifyGps({
          missionRunId: run.id,
          userId: user.id,
          lat: 37.5665,
          lng: 126.978,
          accuracy: 15,
          provider: "gps",
          timestamp: new Date().toISOString(),
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "MISSION_RUN_INVALID_STATE");
        assert.ok(err.message.includes("expired"));
        return true;
      },
    );
  });

  it("GPS 검증 성공 후 다음 단계가 올바르게 설정된다 (GPS → QR → REELS)", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id, {
      verificationSpec: {
        steps: ["GPS", "QR", "REELS"],
        gps: true,
        qr: true,
        reels: true,
      },
    });

    const run = await startMissionRun({ userId: user.id, missionId: mission.id });
    assert.strictEqual(run.status, "PENDING_GPS");

    const result = await verifyGps({
      missionRunId: run.id,
      userId: user.id,
      lat: place.latitude,
      lng: place.longitude,
      accuracy: 15,
      provider: "gps",
      timestamp: new Date().toISOString(),
    });

    assert.strictEqual(result.status, "PENDING_QR");
  });

  it("GPS만 있는 미션은 검증 후 PENDING_REVIEW로 이동한다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id, {
      verificationSpec: {
        steps: ["GPS"],
        gps: true,
      },
    });

    const run = await startMissionRun({ userId: user.id, missionId: mission.id });

    const result = await verifyGps({
      missionRunId: run.id,
      userId: user.id,
      lat: place.latitude,
      lng: place.longitude,
      accuracy: 15,
      provider: "gps",
      timestamp: new Date().toISOString(),
    });

    assert.strictEqual(result.status, "PENDING_REVIEW");
  });
});
