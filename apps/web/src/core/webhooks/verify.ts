// ZZIK LIVE v4 - Webhook Signature Verification

import crypto from "crypto";

export function verifyWebhookSignature(opts: {
  payload: string;
  signature: string;
  secret: string;
}): boolean {
  const hmac = crypto.createHmac("sha256", opts.secret);
  hmac.update(opts.payload);
  const expected = hmac.digest("hex");

  if (expected.length !== opts.signature.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(expected, "utf8"),
    Buffer.from(opts.signature, "utf8"),
  );
}
