// ZZIK LIVE v4 - GET /api/missions/[id]/generate-qr

import { handleApi } from "@/app/api/_utils/handleApi";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/core/errors/app-error";
import { getUserIdFromRequestLoose } from "@/core/auth/jwt";
import { checkRateLimit, addRateLimitHeaders } from "@/middleware/ratelimit";
import { qrGenerateRateLimiter } from "@/lib/ratelimit";
import crypto from "crypto";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Authenticate user (admin-only in production)
  // TODO: Add role-based access control to verify admin status
  const userId = getUserIdFromRequestLoose(req);

  // Check rate limit (20 requests per 15 min per user)
  const rateLimitResult = await checkRateLimit(
    `qr-generate:${userId}`,
    qrGenerateRateLimiter,
  );

  // Create headers with rate limit info
  const headers = new Headers();
  addRateLimitHeaders(headers, rateLimitResult);

  return handleApi(async () => {
    const { id: missionId } = await params;

    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      include: { place: true },
    });

    if (!mission) {
      throw new AppError("MISSION_NOT_FOUND", "Mission not found", 404);
    }

    const secret = process.env.QR_SIGNING_SECRET;
    if (!secret) {
      throw new Error("QR_SIGNING_SECRET is not set");
    }

    // Generate QR payload
    const mid = mission.id;
    const pid = mission.placeId;
    const nonce = crypto.randomUUID();

    // Store nonce in database (expires in 24 hours by default)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.qrNonce.create({
      data: {
        nonce,
        missionId: mid,
        placeId: pid,
        expiresAt,
      },
    });

    const base = `${mid}.${pid}.${nonce}`;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(base);
    const sig = hmac.digest("hex");

    const qrUrl = `zzik://mission?mid=${mid}&pid=${pid}&nonce=${nonce}&sig=${sig}`;

    return {
      missionId: mid,
      placeId: pid,
      nonce,
      signature: sig,
      qrUrl,
      qrUrlHttps: qrUrl.replace("zzik://", "https://"),
      expiresAt,
    };
  }, { headers });
}
