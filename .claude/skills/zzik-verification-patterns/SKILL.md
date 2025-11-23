---
name: zzik-verification-patterns
description: GPS anti-spoofing, QR code verification, and Reels validation patterns for ZZIK v5.1.
triggers: ["zzik-gps-verify", "zzik-qr-verify", "zzik-reels-verify", "zzik-anti-spoof", "zzik-fraud-detection"]
version: 1.0.0
created: 2025-11-24
---

# ZZIK Verification Patterns Skill

Provides GPS anti-spoofing, QR code verification, and Reels validation patterns for ZZIK v5.1.

## Activation

This skill activates automatically when you mention ZZIK verification:
- "zzik-gps-verify", "zzik-qr-verify", "zzik-reels-verify"
- "zzik-anti-spoof", "zzik-fraud-detection"

---

## 1. GPS Anti-Spoofing Pattern

### Multi-Layer Verification

**Layer 1: Provider Check**
```typescript
if (gpsData.provider === 'mock') {
  return { ok: false, reason: 'MOCK_PROVIDER' };
}
```
**Why**: Reject spoofing apps like "Fake GPS Location".

---

**Layer 2: Client Mocked Flag**
```typescript
if (gpsData.mocked === true) {
  return { ok: false, reason: 'CLIENT_FLAGGED_AS_MOCKED' };
}
```
**Why**: Some devices flag simulated locations (Android: isMock flag).

---

**Layer 3: Accuracy Threshold**
```typescript
if (gpsData.accuracy > 80) { // meters
  return { ok: false, reason: 'LOW_ACCURACY', score: 0 };
}
```
**Why**: Spoofed GPS often has suspiciously high accuracy (e.g., 1m).

---

**Layer 4: Distance Validation**
```typescript
const distance = haversineDistance(
  gpsData.lat, gpsData.lng,
  place.lat, place.lng
);

if (distance > 50) { // meters
  return {
    ok: false,
    reason: 'TOO_FAR',
    metadata: { distanceMeters: distance },
  };
}
```
**Why**: User must be physically near place to verify.

---

**Layer 5: Timestamp Freshness**
```typescript
const age = Date.now() - gpsData.timestamp;

if (age > 2 * 60 * 1000) { // 2 minutes
  return { ok: false, reason: 'STALE_GPS_DATA' };
}
```
**Why**: Prevent replay attacks with old GPS data.

---

**Layer 6: Velocity Check** (requires GpsHistory table)
```typescript
const lastPoint = await prisma.gpsHistory.findFirst({
  where: { userId, deviceId },
  orderBy: { timestamp: 'desc' },
});

if (lastPoint) {
  const distance = haversineDistance(
    lastPoint.lat, lastPoint.lng,
    currentLat, currentLng
  );

  const timeDiff = (currentTimestamp - lastPoint.timestamp) / 1000; // seconds
  const speedKmh = (distance / timeDiff) * 3.6;

  if (speedKmh > 80) { // 80 km/h threshold
    return {
      ok: false,
      reason: 'TELEPORTATION_DETECTED',
      metadata: { speedKmh, distance, timeDiff },
    };
  }
}
```
**Why**: Detects impossible movements (e.g., Seoul → Busan in 1 second).

---

**Layer 7: IP Geolocation Cross-Check** (optional)
```typescript
const ipLocation = await getLocationFromIP(req.headers['x-forwarded-for']);

const ipGpsDistance = haversineDistance(
  ipLocation.lat, ipLocation.lng,
  gpsData.lat, gpsData.lng
);

if (ipGpsDistance > 100) { // 100 km
  return {
    ok: false,
    reason: 'GPS_IP_MISMATCH',
    score: 0.5, // Warning, not hard failure (VPN users)
  };
}
```
**Why**: GPS in Seoul but IP in Busan = likely VPN + GPS spoofing.

---

### Haversine Distance Formula

```typescript
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
}
```

**Usage**:
```typescript
const distanceKm = haversineDistance(37.5665, 126.9780, 35.1796, 129.0756);
// Seoul to Busan ≈ 325 km
```

---

## 2. QR Code Verification Pattern

### HMAC Signature + Nonce Replay Prevention

**QR Code Generation** (admin only):
```typescript
import crypto from 'crypto';

export function generateQrCode(missionId: string, placeId: string): string {
  const nonce = crypto.randomUUID();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // +24 hours

  const payload = {
    missionId,
    placeId,
    nonce,
    expiresAt,
  };

  const signature = crypto
    .createHmac('sha256', process.env.QR_SIGNING_SECRET!)
    .update(JSON.stringify(payload))
    .digest('hex');

  const qrData = {
    ...payload,
    signature,
  };

  return Buffer.from(JSON.stringify(qrData)).toString('base64');
}
```

**QR Code Verification**:
```typescript
export async function verifyQrCode(
  qrCodeData: string,
  expectedMissionId: string
): Promise<QrVerificationResult> {
  // Step 1: Decode
  const decoded = JSON.parse(Buffer.from(qrCodeData, 'base64').toString());

  // Step 2: Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.QR_SIGNING_SECRET!)
    .update(JSON.stringify({
      missionId: decoded.missionId,
      placeId: decoded.placeId,
      nonce: decoded.nonce,
      expiresAt: decoded.expiresAt,
    }))
    .digest('hex');

  if (!crypto.timingSafeEqual(
    Buffer.from(decoded.signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )) {
    return { success: false, reason: 'INVALID_SIGNATURE' };
  }

  // Step 3: Check expiration
  if (Date.now() > decoded.expiresAt) {
    return { success: false, reason: 'QR_CODE_EXPIRED' };
  }

  // Step 4: Verify mission ID
  if (decoded.missionId !== expectedMissionId) {
    return { success: false, reason: 'MISSION_MISMATCH' };
  }

  // Step 5: Check nonce replay
  const existingNonce = await prisma.qrNonce.findUnique({
    where: { nonce: decoded.nonce },
  });

  if (existingNonce?.usedAt) {
    return {
      success: false,
      reason: 'QR_CODE_ALREADY_USED',
      metadata: { usedAt: existingNonce.usedAt, usedBy: existingNonce.usedBy },
    };
  }

  // Step 6: Mark nonce as used (atomic)
  await prisma.qrNonce.upsert({
    where: { nonce: decoded.nonce },
    create: {
      nonce: decoded.nonce,
      usedAt: new Date(),
      usedBy: userId,
    },
    update: {
      usedAt: new Date(),
      usedBy: userId,
    },
  });

  return { success: true };
}
```

**Security Properties**:
- ✅ **Unforgeable**: HMAC signature prevents fake QR codes
- ✅ **Replay-proof**: Nonce prevents reusing same QR code
- ✅ **Time-limited**: Expiration prevents old QR codes
- ✅ **Mission-specific**: Can't use QR from Mission A for Mission B
- ✅ **Timing-safe**: `timingSafeEqual` prevents timing attacks

---

### QR Code Rotation (Optional Enhancement)

**TOTP-based rotation** (changes every 30 seconds):
```typescript
import { authenticator } from 'otplib';

export function generateRotatingQrCode(placeId: string): string {
  const secret = process.env.QR_ROTATION_SECRET!;

  // Generate TOTP token (changes every 30s)
  const token = authenticator.generate(secret);

  const qrData = {
    placeId,
    token,
    timestamp: Date.now(),
  };

  return Buffer.from(JSON.stringify(qrData)).toString('base64');
}

export function verifyRotatingQrCode(qrCodeData: string, placeId: string): boolean {
  const decoded = JSON.parse(Buffer.from(qrCodeData, 'base64').toString());

  // Verify token (allows 1 time window before/after for clock skew)
  const isValid = authenticator.verify({
    token: decoded.token,
    secret: process.env.QR_ROTATION_SECRET!,
  });

  return isValid && decoded.placeId === placeId;
}
```

**Pros**: QR code screenshot becomes useless after 30 seconds.
**Cons**: Requires synchronized time on server/client.

---

## 3. Reels Verification Pattern

### Instagram Reels Validation

**Step 1: URL Format Validation**
```typescript
const INSTAGRAM_REELS_REGEX = /^https?:\/\/(www\.)?instagram\.com\/reel\/([A-Za-z0-9_-]+)\/?$/;

if (!INSTAGRAM_REELS_REGEX.test(reelsUrl)) {
  return { success: false, reason: 'INVALID_URL_FORMAT' };
}
```

---

**Step 2: API Verification** (requires Instagram Graph API)
```typescript
import { InstagramClient } from '@/lib/instagram';

const instagram = new InstagramClient();

const reelsData = await instagram.verifyReels(reelsUrl);

if (!reelsData.exists) {
  return { success: false, reason: 'REELS_NOT_FOUND' };
}

if (!reelsData.isPublic) {
  return { success: false, reason: 'REELS_NOT_PUBLIC' };
}
```

---

**Step 3: Hashtag Validation**
```typescript
const requiredHashtags = ['#zzik', `#mission-${missionId}`];

const missingHashtags = requiredHashtags.filter(
  tag => !reelsData.hashtags.includes(tag.toLowerCase())
);

if (missingHashtags.length > 0) {
  return {
    success: false,
    reason: 'MISSING_HASHTAGS',
    metadata: { missing: missingHashtags },
  };
}
```

---

**Step 4: Content Validation** (optional, ML-based)
```typescript
// Use Google Vision API or AWS Rekognition
const visionResult = await analyzeImageContent(reelsData.thumbnailUrl);

const hasPlace = visionResult.labels.some(label =>
  label.description.includes(place.name)
);

if (!hasPlace) {
  return {
    success: false,
    reason: 'CONTENT_VALIDATION_FAILED',
    score: 0.5, // Manual review required
  };
}
```

---

**Step 5: Store Metadata**
```typescript
await prisma.missionRun.update({
  where: { id: missionRunId },
  data: {
    reelsUrl,
    reelsMetadata: {
      platform: 'instagram',
      likeCount: reelsData.likeCount,
      commentCount: reelsData.commentCount,
      verifiedAt: new Date().toISOString(),
      hashtags: reelsData.hashtags,
    },
    status: 'PENDING_REVIEW', // Admin approval required
  },
});
```

---

### TikTok Video Validation (Similar Pattern)

```typescript
const TIKTOK_VIDEO_REGEX = /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/(\d+)/;

// Extract video ID
const match = videoUrl.match(TIKTOK_VIDEO_REGEX);
const videoId = match?.[2];

// Fetch from TikTok API (or scraping)
const videoData = await tiktokClient.getVideoInfo(videoId);

// Validate hashtags
const hasRequiredTags = requiredHashtags.every(tag =>
  videoData.hashtags.includes(tag)
);
```

---

## 4. State Machine Verification Flow

### Valid State Transitions

```typescript
const MISSION_RUN_TRANSITIONS = {
  PENDING_GPS: ['PENDING_QR', 'FAILED'],
  PENDING_QR: ['PENDING_REELS', 'FAILED'],
  PENDING_REELS: ['PENDING_REVIEW', 'FAILED'],
  PENDING_REVIEW: ['COMPLETED', 'REJECTED'],
  COMPLETED: [], // Terminal state
  REJECTED: [], // Terminal state
  FAILED: [],    // Terminal state
};

export function canTransition(
  from: MissionRunStatus,
  to: MissionRunStatus
): boolean {
  return MISSION_RUN_TRANSITIONS[from]?.includes(to) ?? false;
}

// Enforce in verification APIs
if (!canTransition(missionRun.status, 'PENDING_QR')) {
  throw new AppError(
    'INVALID_STATE',
    `Cannot verify QR when status is ${missionRun.status}`,
    400
  );
}
```

---

### Atomic State Updates

**Pattern**: Update status + verification timestamp atomically.

```typescript
// ✅ Good: Atomic update with status check
const updated = await prisma.missionRun.updateMany({
  where: {
    id: missionRunId,
    status: 'PENDING_QR', // Only update if in expected state
  },
  data: {
    status: 'PENDING_REELS',
    qrVerifiedAt: new Date(),
  },
});

if (updated.count === 0) {
  throw new AppError(
    'CONCURRENT_UPDATE',
    'Mission run was updated by another request',
    409
  );
}
```

**Why**: Prevents race conditions when two requests verify QR simultaneously.

---

## 5. Fraud Detection Heuristics

### Suspicious Pattern Detection

**Pattern 1: Rapid Mission Completion**
```typescript
const recentRuns = await prisma.missionRun.findMany({
  where: {
    userId,
    status: 'COMPLETED',
    completedAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
  },
});

if (recentRuns.length > 10) {
  // Flag for manual review
  await flagUserForReview(userId, 'RAPID_COMPLETION');
}
```

---

**Pattern 2: Same Device, Multiple Users**
```typescript
const deviceUsers = await prisma.deviceFingerprint.count({
  where: { fingerprint: currentDeviceFingerprint },
  distinct: ['userId'],
});

if (deviceUsers > 3) {
  // Possible device sharing / farming
  await flagUserForReview(userId, 'DEVICE_SHARING');
}
```

---

**Pattern 3: Impossible Travel**
```typescript
const lastRun = await prisma.missionRun.findFirst({
  where: { userId, status: 'COMPLETED' },
  orderBy: { completedAt: 'desc' },
  include: { mission: { include: { place: true } } },
});

if (lastRun) {
  const distance = haversineDistance(
    lastRun.mission.place.lat,
    lastRun.mission.place.lng,
    currentPlace.lat,
    currentPlace.lng
  );

  const timeDiff = (Date.now() - lastRun.completedAt.getTime()) / 1000 / 60; // minutes

  if (distance > 50 && timeDiff < 60) {
    // 50km in <60min = suspicious
    await flagUserForReview(userId, 'IMPOSSIBLE_TRAVEL');
  }
}
```

---

## 6. Error Handling Patterns

### Graceful Degradation

```typescript
export async function verifyGpsWithFallback(gpsData: GpsInput): Promise<GpsResult> {
  try {
    // Attempt IP geolocation check
    const ipCheck = await verifyGpsWithIP(gpsData);
    return ipCheck;
  } catch (error) {
    console.error('IP geolocation failed:', error);

    // Fall back to basic GPS check
    return verifyGpsBasic(gpsData);
  }
}
```

**Why**: Don't block users if optional check (IP geolocation) fails.

---

### Detailed Error Responses

```typescript
return {
  success: false,
  reason: 'GPS_VERIFICATION_FAILED',
  errors: [
    { field: 'accuracy', message: 'GPS accuracy too low: 120m (max 80m)' },
    { field: 'distance', message: 'Too far from place: 85m (max 50m)' },
  ],
  metadata: {
    providedLat: gpsData.lat,
    providedLng: gpsData.lng,
    placeLat: place.lat,
    placeLng: place.lng,
    distanceMeters: 85,
  },
};
```

**Why**: Helps users understand why verification failed.

---

## Testing Checklist

Before deploying verification logic:

- [ ] Test with spoofing app (Fake GPS) - should reject
- [ ] Test with VPN - should flag but not hard fail
- [ ] Test QR code replay - should reject second scan
- [ ] Test expired QR code - should reject
- [ ] Test deleted Instagram Reels - should return "not found"
- [ ] Test private Instagram Reels - should reject
- [ ] Test velocity check with teleportation - should reject
- [ ] Test concurrent QR scans - only one should succeed
- [ ] Load test QR verification (1000 req/s) - should not crash

---

## Resources

- ZZIK GPS Anti-Spoof: `/apps/web/src/core/gps/antiSpoof.enhanced.ts`
- ZZIK QR Verification: `/apps/web/src/core/qr/verify.ts`
- ZZIK Reels Verification: `/apps/web/src/core/missions/steps/reels.ts`

**Skill Version**: 1.0.0
**Created**: 2025-11-24
**Coverage**: GPS, QR, Reels verification for ZZIK v5.1
