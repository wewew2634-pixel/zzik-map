// ZZIK LIVE v4 - QR Payload Verification

import crypto from "crypto";

export type ParsedQrPayload = {
  missionId: string;
  placeId: string;
  nonce: string;
  signature: string;
};

export function parseZzikQrPayload(raw: string): ParsedQrPayload {
  // zzik:// or https:// 형태 둘 다 허용
  const url = new URL(raw.replace("zzik://", "https://"));
  const missionId = url.searchParams.get("mid");
  const placeId = url.searchParams.get("pid");
  const nonce = url.searchParams.get("nonce");
  const sig = url.searchParams.get("sig");

  if (!missionId || !placeId || !nonce || !sig) {
    throw new Error("Invalid QR payload");
  }

  return {
    missionId,
    placeId,
    nonce,
    signature: sig,
  };
}

export function verifyQrSignature(payload: ParsedQrPayload): boolean {
  const secret = process.env.QR_SIGNING_SECRET;
  if (!secret) {
    throw new Error("QR_SIGNING_SECRET is not set");
  }

  const base = `${payload.missionId}.${payload.placeId}.${payload.nonce}`;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(base);
  const expected = hmac.digest("hex");

  return (
    expected.length === payload.signature.length &&
    crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(payload.signature, "utf8"),
    )
  );
}
