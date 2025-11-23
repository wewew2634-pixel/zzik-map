import crypto from 'crypto';

/**
 * QR test data utilities for E2E tests
 */

export type QrPayloadParams = {
  missionId: string;
  placeId: string;
  nonce?: string;
};

/**
 * Generate a valid QR payload with proper signature
 */
export function mockQrPayload(params: QrPayloadParams): string {
  const secret = process.env.QR_SIGNING_SECRET || 'test_qr_signing_secret';
  const nonce = params.nonce || crypto.randomBytes(16).toString('hex');

  // Generate signature
  const base = `${params.missionId}.${params.placeId}.${nonce}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(base);
  const signature = hmac.digest('hex');

  // Create QR URL
  const url = `zzik://verify?mid=${params.missionId}&pid=${params.placeId}&nonce=${nonce}&sig=${signature}`;

  return url;
}

/**
 * Generate an invalid QR payload (wrong signature)
 */
export function mockInvalidQrPayload(params: QrPayloadParams): string {
  const nonce = params.nonce || crypto.randomBytes(16).toString('hex');
  const signature = 'invalid_signature_' + crypto.randomBytes(16).toString('hex');

  const url = `zzik://verify?mid=${params.missionId}&pid=${params.placeId}&nonce=${nonce}&sig=${signature}`;

  return url;
}

/**
 * Generate QR payload with missing parameters
 */
export function mockMalformedQrPayload(): string {
  return 'zzik://verify?mid=123';
}

/**
 * Parse QR payload URL (for testing)
 */
export function parseQrUrl(qrUrl: string): {
  missionId: string;
  placeId: string;
  nonce: string;
  signature: string;
} {
  const url = new URL(qrUrl.replace('zzik://', 'https://'));
  return {
    missionId: url.searchParams.get('mid') || '',
    placeId: url.searchParams.get('pid') || '',
    nonce: url.searchParams.get('nonce') || '',
    signature: url.searchParams.get('sig') || '',
  };
}
