// ZZIK Backend Tests - Reels Verification
// Tests for Reels verification step

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
import { verifyReels } from "@/core/missions/steps/reels";
import { verifyGps } from "@/core/missions/steps/gps";
import { verifyQr } from "@/core/missions/steps/qr";
import { startMissionRun } from "@/core/missions/service";
import { AppError } from "@/core/errors/app-error";
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

// Helper to advance MissionRun to PENDING_REELS state
async function advanceToPendingReels(params: {
  userId: string;
  missionId: string;
  placeId: string;
  placeLatitude: number;
  placeLongitude: number;
}) {
  const run = await startMissionRun({
    userId: params.userId,
    missionId: params.missionId,
  });

  // GPS verification
  await verifyGps({
    missionRunId: run.id,
    userId: params.userId,
    lat: params.placeLatitude,
    lng: params.placeLongitude,
    accuracy: 15,
    provider: "gps",
    timestamp: new Date().toISOString(),
  });

  // QR verification
  const nonce = crypto.randomUUID();
  await testPrisma.qrNonce.create({
    data: {
      nonce,
      missionId: params.missionId,
      placeId: params.placeId,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const qrPayload = generateQrPayload({
    missionId: params.missionId,
    placeId: params.placeId,
    nonce,
  });

  await verifyQr({
    missionRunId: run.id,
    userId: params.userId,
    rawPayload: qrPayload,
  });

  const updated = await testPrisma.missionRun.findUniqueOrThrow({
    where: { id: run.id },
  });

  assert.strictEqual(updated.status, "PENDING_REELS");
  return updated;
}

describe("Reels Verification", () => {
  before(async () => {
    await cleanupTestData();
    process.env.QR_SIGNING_SECRET = "test-secret";
  });

  after(async () => {
    await cleanupTestData();
  });

  it("정상적인 Instagram Reels URL로 검증에 성공한다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);

    const run = await advanceToPendingReels({
      userId: user.id,
      missionId: mission.id,
      placeId: place.id,
      placeLatitude: place.latitude,
      placeLongitude: place.longitude,
    });

    const metadata: ReelsMetadata = {
      platform: "instagram",
      url: "https://www.instagram.com/reel/ABC123/",
      hashtags: ["zzik", mission.id],
      caption: "Test reel",
    };

    const result = await verifyReels({
      missionRunId: run.id,
      userId: user.id,
      metadata,
    });

    assert.strictEqual(result.status, "PENDING_REVIEW");
    assert.ok(result.reelsUploadedAt);
  });

  it("정상적인 TikTok URL로 검증에 성공한다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);

    const run = await advanceToPendingReels({
      userId: user.id,
      missionId: mission.id,
      placeId: place.id,
      placeLatitude: place.latitude,
      placeLongitude: place.longitude,
    });

    const metadata: ReelsMetadata = {
      platform: "tiktok",
      url: "https://www.tiktok.com/@user/video/123456",
      hashtags: ["zzik", mission.id],
    };

    const result = await verifyReels({
      missionRunId: run.id,
      userId: user.id,
      metadata,
    });

    assert.strictEqual(result.status, "PENDING_REVIEW");
  });

  it("잘못된 Instagram URL 형식은 거부된다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);

    const run = await advanceToPendingReels({
      userId: user.id,
      missionId: mission.id,
      placeId: place.id,
      placeLatitude: place.latitude,
      placeLongitude: place.longitude,
    });

    const metadata: ReelsMetadata = {
      platform: "instagram",
      url: "https://www.instagram.com/p/ABC123/", // Post, not reel
      hashtags: ["zzik", mission.id],
    };

    await assert.rejects(
      async () => {
        await verifyReels({
          missionRunId: run.id,
          userId: user.id,
          metadata,
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "VALIDATION_ERROR");
        assert.ok(err.message.includes("reel"));
        return true;
      },
    );
  });

  it("잘못된 Instagram 도메인은 거부된다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);

    const run = await advanceToPendingReels({
      userId: user.id,
      missionId: mission.id,
      placeId: place.id,
      placeLatitude: place.latitude,
      placeLongitude: place.longitude,
    });

    const metadata: ReelsMetadata = {
      platform: "instagram",
      url: "https://fake-instagram.com/reel/ABC123/",
      hashtags: ["zzik", mission.id],
    };

    await assert.rejects(
      async () => {
        await verifyReels({
          missionRunId: run.id,
          userId: user.id,
          metadata,
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "VALIDATION_ERROR");
        assert.ok(err.message.includes("host"));
        return true;
      },
    );
  });

  it("잘못된 TikTok 도메인은 거부된다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);

    const run = await advanceToPendingReels({
      userId: user.id,
      missionId: mission.id,
      placeId: place.id,
      placeLatitude: place.latitude,
      placeLongitude: place.longitude,
    });

    const metadata: ReelsMetadata = {
      platform: "tiktok",
      url: "https://fake-tiktok.com/@user/video/123",
      hashtags: ["zzik", mission.id],
    };

    await assert.rejects(
      async () => {
        await verifyReels({
          missionRunId: run.id,
          userId: user.id,
          metadata,
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "VALIDATION_ERROR");
        assert.ok(err.message.includes("TikTok"));
        return true;
      },
    );
  });

  it("필수 해시태그가 없으면 거부된다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);

    const run = await advanceToPendingReels({
      userId: user.id,
      missionId: mission.id,
      placeId: place.id,
      placeLatitude: place.latitude,
      placeLongitude: place.longitude,
    });

    const metadata: ReelsMetadata = {
      platform: "instagram",
      url: "https://www.instagram.com/reel/ABC123/",
      hashtags: ["random", "tags"], // Missing 'zzik' and missionId
    };

    await assert.rejects(
      async () => {
        await verifyReels({
          missionRunId: run.id,
          userId: user.id,
          metadata,
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "VALIDATION_ERROR");
        assert.ok(err.message.includes("hashtag"));
        return true;
      },
    );
  });

  it("'zzik' 해시태그가 없으면 거부된다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);

    const run = await advanceToPendingReels({
      userId: user.id,
      missionId: mission.id,
      placeId: place.id,
      placeLatitude: place.latitude,
      placeLongitude: place.longitude,
    });

    const metadata: ReelsMetadata = {
      platform: "instagram",
      url: "https://www.instagram.com/reel/ABC123/",
      hashtags: [mission.id], // Has missionId but not 'zzik'
    };

    await assert.rejects(
      async () => {
        await verifyReels({
          missionRunId: run.id,
          userId: user.id,
          metadata,
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "VALIDATION_ERROR");
        assert.ok(err.message.includes("zzik"));
        return true;
      },
    );
  });

  it("missionId 해시태그가 없으면 거부된다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);

    const run = await advanceToPendingReels({
      userId: user.id,
      missionId: mission.id,
      placeId: place.id,
      placeLatitude: place.latitude,
      placeLongitude: place.longitude,
    });

    const metadata: ReelsMetadata = {
      platform: "instagram",
      url: "https://www.instagram.com/reel/ABC123/",
      hashtags: ["zzik"], // Has 'zzik' but not missionId
    };

    await assert.rejects(
      async () => {
        await verifyReels({
          missionRunId: run.id,
          userId: user.id,
          metadata,
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "VALIDATION_ERROR");
        assert.ok(err.message.includes(mission.id));
        return true;
      },
    );
  });

  it("다른 사용자의 MissionRun에 대해 Reels 검증을 시도하면 권한 에러", async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);

    const run = await advanceToPendingReels({
      userId: user1.id,
      missionId: mission.id,
      placeId: place.id,
      placeLatitude: place.latitude,
      placeLongitude: place.longitude,
    });

    const metadata: ReelsMetadata = {
      platform: "instagram",
      url: "https://www.instagram.com/reel/ABC123/",
      hashtags: ["zzik", mission.id],
    };

    await assert.rejects(
      async () => {
        await verifyReels({
          missionRunId: run.id,
          userId: user2.id, // Different user
          metadata,
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "PERMISSION_DENIED");
        return true;
      },
    );
  });

  it("PENDING_REELS 상태가 아니면 Reels 검증을 할 수 없다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);

    // Start mission run (status: PENDING_GPS, not PENDING_REELS)
    const run = await startMissionRun({
      userId: user.id,
      missionId: mission.id,
    });

    const metadata: ReelsMetadata = {
      platform: "instagram",
      url: "https://www.instagram.com/reel/ABC123/",
      hashtags: ["zzik", mission.id],
    };

    await assert.rejects(
      async () => {
        await verifyReels({
          missionRunId: run.id,
          userId: user.id,
          metadata,
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "MISSION_RUN_INVALID_STATE");
        return true;
      },
    );
  });

  it("잘못된 URL 형식은 거부된다", async () => {
    const user = await createTestUser();
    const place = await createTestPlace();
    const mission = await createTestMission(place.id);

    const run = await advanceToPendingReels({
      userId: user.id,
      missionId: mission.id,
      placeId: place.id,
      placeLatitude: place.latitude,
      placeLongitude: place.longitude,
    });

    const metadata: ReelsMetadata = {
      platform: "instagram",
      url: "not-a-valid-url",
      hashtags: ["zzik", mission.id],
    };

    await assert.rejects(
      async () => {
        await verifyReels({
          missionRunId: run.id,
          userId: user.id,
          metadata,
        });
      },
      (err: any) => {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.code, "VALIDATION_ERROR");
        assert.ok(err.message.includes("URL"));
        return true;
      },
    );
  });
});
