---
description: Start ZZIK database work (Prisma schema, migrations, optimization)
---

# ZZIK Database Architecture Session

Activating **zzik-database-architect** agent and **zzik-prisma-patterns** skill.

## Current Database Tasks

### 1. Missing Tables (P0)
Create new tables for Phase 0 security features:

**GpsHistory** - GPS velocity tracking
```prisma
model GpsHistory {
  id          String   @id @default(cuid())
  userId      String
  deviceId    String
  lat         Float
  lng         Float
  accuracy    Float
  provider    String
  timestamp   DateTime
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, timestamp])
  @@index([deviceId, timestamp])
}
```

**AuditLog** - Security event logging
**DeviceFingerprint** - Device tracking for fraud detection

**Triggers**: zzik-prisma-schema, zzik-schema-design

### 2. Query Optimization (P1)
- **Issue**: N+1 queries in place listings, wallet balance checks
- **Action**: Add proper indexes, use `include` strategically
- **Pattern**: Batch queries, connection pooling

**Triggers**: zzik-query-optimization, zzik-indexing

### 3. Safe Migrations (P0)
- **Pattern**: Non-nullable columns (3-step: nullable → backfill → non-nullable)
- **Pattern**: Column renames (aliasing strategy)
- **Pattern**: Type changes (shadow columns)

**Triggers**: zzik-migration, zzik-migration-pattern

### 4. Optimistic Locking (P0)
- **Apply to**: Wallet balance updates, mission completions
- **Pattern**: Add `version` field, check in updateMany
- **Benefit**: Prevent race conditions

**Triggers**: zzik-optimistic-locking, zzik-transaction

## Prisma Patterns Available

**Optimistic Locking**: Version field pattern for concurrent updates
**Idempotency**: Transaction deduplication with unique constraints
**Active Mission Lock**: Prevent duplicate mission starts
**Safe Migrations**: Zero-downtime schema changes

## Ready for Database Work

Use patterns from **zzik-prisma-patterns** skill for safe schema design.
Use **zzik-security-hardening** agent when adding security-related tables.

What database task would you like to start with?
