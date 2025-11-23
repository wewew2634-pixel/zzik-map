---
description: Start ZZIK security hardening work (GPS, PII, RBAC, validation)
---

# ZZIK Security Hardening Session

Activating **zzik-security-hardening** agent and **zzik-verification-patterns** skill.

## Current Security Tasks

### 1. GPS Anti-Spoofing (P0 - Critical)
- **File**: `/apps/web/src/core/gps/antiSpoof.enhanced.ts`
- **Issue**: Velocity check disabled (lines 71-75)
- **Action**: Enable velocity tracking with GpsHistory table

**Triggers**: zzik-gps-antispoof, zzik-gps-verify, zzik-anti-spoof

### 2. PII Encryption (P0 - GDPR Compliance)
- **Create**: `/apps/web/src/core/crypto/pii.ts`
- **Action**: Implement AES-256-GCM encryption for sensitive fields
- **Fields**: phone, email, realName, address

**Triggers**: zzik-pii-encryption

### 3. Input Validation (P0 - Security)
- **Issue**: Zod schemas defined but not enforced
- **Action**: Add validation middleware to all API routes
- **Pattern**: `validateRequest(CreateMissionSchema)`

**Triggers**: zzik-input-validation

### 4. RBAC Protection (P0 - Authorization)
- **Issue**: Admin endpoints unprotected
- **Action**: Add `requirePermission()` checks
- **Roles**: USER, ADMIN, SUPER_ADMIN

**Triggers**: zzik-rbac

## Ready for Security Work

Use patterns from **zzik-verification-patterns** skill for GPS anti-spoofing implementation.
Use **zzik-database-architect** for creating GpsHistory, AuditLog, DeviceFingerprint tables.

What security task would you like to start with?
