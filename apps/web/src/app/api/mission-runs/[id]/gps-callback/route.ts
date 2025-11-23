// ZZIK LIVE v4 - POST /api/mission-runs/[id]/gps-callback
// @webhook-endpoint - Authenticated via HMAC signature, not JWT
// Security: Uses verifyWebhookSignature() for authentication

import { handleApi } from "../../../_utils/handleApi";
import { verifyGps } from "@/core/missions/steps/gps";
import { verifyWebhookSignature } from "@/core/webhooks/verify";
import { AppError } from "@/core/errors/app-error";
import { prisma } from "@/lib/prisma";

type GpsCallbackBody = {
  verdict: "APPROVED" | "REJECTED";
  reason?: string;
  // 실제 좌표는 외부에서 검증하고 들어온다고 가정
  lat?: number;
  lng?: number;
  accuracy?: number;
  provider?: string;
  mocked?: boolean;
  deviceId?: string;
  timestamp?: string;
  userId?: string; // 외부 시스템에서 매핑해서 전달
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: missionRunId } = await params;

  const rawBody = await req.text();
  const sig = req.headers.get("x-zzik-signature");

  const secret = process.env.WEBHOOK_SIGNING_SECRET;
  if (!secret || !sig) {
    throw new AppError(
      "PERMISSION_DENIED",
      "Missing webhook signature",
      403,
    );
  }

  const ok = verifyWebhookSignature({
    payload: rawBody,
    signature: sig,
    secret,
  });

  if (!ok) {
    throw new AppError("PERMISSION_DENIED", "Invalid webhook signature", 403);
  }

  const body = JSON.parse(rawBody) as GpsCallbackBody;

  return handleApi(async () => {
    if (body.verdict === "REJECTED") {
      const updated = await prisma.missionRun.update({
        where: { id: missionRunId },
        data: {
          status: "REJECTED",
          rejectedAt: new Date(),
          rejectReason: body.reason ?? "GPS verification rejected",
          activeLockKey: null,
        },
      });
      return { status: updated.status };
    }

    // APPROVED: verifyGps 헬퍼를 통해 상태 전이
    const updated = await verifyGps({
      missionRunId,
      userId: body.userId ?? "system-webhook",
      lat: body.lat!,
      lng: body.lng!,
      accuracy: body.accuracy!,
      provider: body.provider,
      mocked: body.mocked,
      deviceId: body.deviceId,
      timestamp: body.timestamp ?? new Date().toISOString(),
    });

    return {
      status: updated.status,
      gpsVerifiedAt: updated.gpsVerifiedAt,
    };
  });
}

