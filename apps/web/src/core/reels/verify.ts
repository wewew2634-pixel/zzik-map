// ZZIK LIVE v4 - Reels Verification

import { ReelsMetadata } from "./types";

export type ReelsVerificationContext = {
  missionId: string;
  placeId: string;
  missionRunId: string;
};

export type ReelsVerificationResult = {
  ok: boolean;
  reason?: string;
};

export function verifyReelsUrl(
  meta: ReelsMetadata,
): ReelsVerificationResult {
  try {
    const url = new URL(meta.url);

    if (meta.platform === "instagram") {
      if (url.hostname !== "www.instagram.com") {
        return {
          ok: false,
          reason: "Invalid Instagram host",
        };
      }
      if (!url.pathname.startsWith("/reel/")) {
        return {
          ok: false,
          reason: "Not an Instagram reel URL",
        };
      }
    }

    if (meta.platform === "tiktok") {
      // Only allow official TikTok domains
      const validTikTokHosts = [
        "www.tiktok.com",
        "vt.tiktok.com",
        "vm.tiktok.com",
      ];
      if (!validTikTokHosts.includes(url.hostname)) {
        return {
          ok: false,
          reason: "Invalid TikTok host",
        };
      }
    }

    // ZZIK 내부 호스팅일 경우는 나중에 규칙 추가
    return { ok: true };
  } catch {
    return { ok: false, reason: "Invalid URL" };
  }
}

export function verifyReelsHashtags(
  meta: ReelsMetadata,
  ctx: ReelsVerificationContext,
): ReelsVerificationResult {
  const tags = meta.hashtags ?? [];

  // 필수 해시태그 정책 예시
  const required = [
    "zzik",
    ctx.missionId, // "mission-zzik-lab-coffee-basic"
  ];

  const missing = required.filter((r) => !tags.includes(r));

  if (missing.length > 0) {
    return {
      ok: false,
      reason: `Missing required hashtags: ${missing.join(", ")}`,
    };
  }

  return { ok: true };
}
