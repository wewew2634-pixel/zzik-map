---
description: Start ZZIK API integration work (Instagram, TikTok, Stripe, geolocation)
---

# ZZIK API Integration Session

Activating **zzik-api-integration** agent.

## Current API Integration Tasks

### 1. Instagram Graph API (P0 - Reels Verification)
- **Create**: `/apps/web/src/lib/instagram.ts`
- **Endpoint**: `/me/media` with Instagram User Access Token
- **Action**: Verify video post location matches mission location
- **Status**: TODO at `/apps/web/src/core/missions/steps/reels.ts:40`

**Triggers**: zzik-instagram, zzik-reels-api, zzik-reels-verify

### 2. TikTok API (P0 - Video Verification)
- **Create**: `/apps/web/src/lib/tiktok.ts`
- **Endpoint**: `/v2/video/query/` with TikTok API key
- **Action**: Verify video metadata, location tags
- **OAuth**: Implement TikTok Login Kit flow

**Triggers**: zzik-tiktok

### 3. IP Geolocation (P0 - GPS Anti-Spoofing)
- **Create**: `/apps/web/src/lib/geolocation.ts`
- **Service**: MaxMind GeoIP2 or IP2Location
- **Action**: Cross-check GPS coordinates with IP location
- **Pattern**: Distance tolerance 50km (VPN consideration)

**Triggers**: zzik-geolocation

### 4. Stripe Webhooks (P1 - Subscription Lifecycle)
- **Create**: `/apps/web/src/app/api/webhooks/stripe/route.ts`
- **Events**: `invoice.paid`, `customer.subscription.deleted`, `payment_method.attached`
- **Action**: Update User subscription status, handle failures

**Triggers**: zzik-stripe-webhook

## API Integration Patterns

**OAuth Flow**:
1. Redirect to provider authorization URL
2. Handle callback with authorization code
3. Exchange code for access token
4. Store encrypted token in database

**Rate Limiting**:
- Instagram: 200 calls/hour/user
- TikTok: 1000 calls/day
- Strategy: Redis-based request throttling

**Webhook Verification**:
- Stripe: Verify signature with webhook secret
- Instagram: Verify X-Hub-Signature header

**Error Handling**:
- Retry with exponential backoff (3 attempts)
- Graceful degradation (manual review fallback)
- Circuit breaker for repeated failures

## Ready for API Integration Work

Use **zzik-security-hardening** agent for API key encryption and validation.
Use **zzik-database-architect** for storing API tokens and webhook events.

What API integration task would you like to start with?
