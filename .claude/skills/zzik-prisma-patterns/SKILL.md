---
name: zzik-prisma-patterns
description: Database patterns and best practices for ZZIK v5.1 Prisma schema design and queries.
triggers: ["zzik-prisma", "zzik-transaction", "zzik-optimistic-locking", "zzik-schema-design", "zzik-migration-pattern"]
version: 1.0.0
created: 2025-11-24
---

# ZZIK Prisma Patterns Skill

Provides database patterns and best practices for ZZIK v5.1 Prisma schema design and queries.

## Activation

This skill activates automatically when you mention ZZIK-specific database patterns:
- "zzik-prisma", "zzik-transaction", "zzik-optimistic-locking"
- "zzik-schema-design", "zzik-migration-pattern"
- Table names: "User", "Place", "Mission", "MissionRun", "Wallet"

---

## Core Patterns

### 1. Optimistic Locking for Wallet

**Pattern**: Prevent race conditions in balance updates using version field.

```typescript
// Read current version
const wallet = await prisma.wallet.findUnique({
  where: { userId },
  select: { id: true, balance: true, version: true },
});

// Update with version check (fails if version changed by another transaction)
const updated = await prisma.wallet.updateMany({
  where: {
    id: wallet.id,
    version: wallet.version, // Critical: Lock check
  },
  data: {
    balance: wallet.balance + amount,
    version: wallet.version + 1,
  },
});

if (updated.count === 0) {
  // Another transaction modified wallet - retry
  throw new AppError('CONFLICT', 'Wallet updated by another transaction', 409);
}
```

**Why**: `updateMany` returns count, allowing atomic check-and-set operation.

---

### 2. Idempotency for Transactions

**Pattern**: Prevent duplicate wallet credits using idempotency keys.

```typescript
// Check if already processed
const existing = await prisma.walletTransaction.findUnique({
  where: { idempotencyKey },
});

if (existing) {
  return existing; // Already processed, return cached result
}

// Process transaction
await prisma.walletTransaction.create({
  data: {
    walletId,
    amount,
    type: 'CREDIT',
    idempotencyKey, // Unique constraint prevents duplicates
  },
});
```

**Why**: Mission approval webhook might fire twice - idempotency prevents double credits.

---

### 3. Active Mission Lock

**Pattern**: Ensure user has only one active mission at a time.

```prisma
model MissionRun {
  activeLockKey String? @unique
  // activeLockKey format: "user_123:ACTIVE"
}
```

```typescript
// Start mission
await prisma.missionRun.create({
  data: {
    missionId,
    userId,
    status: 'PENDING_GPS',
    activeLockKey: `${userId}:ACTIVE`, // Unique constraint enforces 1 active run
  },
});

// Complete mission (release lock)
await prisma.missionRun.update({
  where: { id },
  data: {
    status: 'COMPLETED',
    activeLockKey: null, // Release lock
  },
});
```

**Why**: Database-level constraint prevents race conditions better than application logic.

---

### 4. Efficient N+1 Prevention

**Bad** (N+1 query):
```typescript
const missions = await prisma.mission.findMany();

for (const mission of missions) {
  const place = await prisma.place.findUnique({
    where: { id: mission.placeId },
  });
  // 1 query for missions + N queries for places
}
```

**Good** (single JOIN):
```typescript
const missions = await prisma.mission.findMany({
  include: {
    place: true, // ✅ Single query with JOIN
  },
});
```

**Why**: Reduces queries from O(N) to O(1), critical for performance.

---

### 5. Transaction Patterns

**Simple transaction**:
```typescript
await prisma.$transaction([
  prisma.wallet.update({ where: { userId }, data: { balance: { increment: amount } } }),
  prisma.walletTransaction.create({ data: { walletId, amount } }),
]);
```

**Complex transaction** (with logic):
```typescript
await prisma.$transaction(async (tx) => {
  // Read
  const wallet = await tx.wallet.findUnique({ where: { userId } });

  // Validate
  if (wallet.balance + amount < 0) {
    throw new AppError('INSUFFICIENT_BALANCE', 'Not enough balance', 400);
  }

  // Write
  await tx.wallet.update({
    where: { id: wallet.id },
    data: { balance: wallet.balance + amount },
  });

  await tx.walletTransaction.create({
    data: { walletId: wallet.id, amount },
  });
});
```

**Why**: Ensures atomicity - both succeed or both fail.

---

## Schema Design Rules

### 1. Always Index Foreign Keys

```prisma
model MissionRun {
  userId String
  user   User @relation(fields: [userId], references: [id])

  @@index([userId]) // ✅ Critical for "user's missions" query
}
```

**Why**: PostgreSQL doesn't auto-index foreign keys (unlike MySQL).

---

### 2. Composite Indexes for Multi-Column Queries

```prisma
model MissionRun {
  userId String
  status MissionRunStatus

  // Query: "Get user's completed missions"
  @@index([userId, status])

  // Note: Also covers queries on [userId] alone (left-prefix rule)
}
```

**Why**: Single composite index is more efficient than two separate indexes.

---

### 3. Index Sort Columns

```prisma
model Mission {
  createdAt DateTime @default(now())

  // Query: "Get recent missions"
  @@index([createdAt(sort: Desc)])
}
```

**Why**: Avoids filesort operation in PostgreSQL query plan.

---

### 4. Soft Delete Pattern

```prisma
model User {
  deletedAt         DateTime?
  deletionScheduled DateTime? // For 30-day GDPR grace period

  @@index([deletedAt]) // For filtering active users
}
```

```typescript
// Query active users
const activeUsers = await prisma.user.findMany({
  where: { deletedAt: null },
});

// Soft delete
await prisma.user.update({
  where: { id },
  data: {
    deletedAt: new Date(),
    deletionScheduled: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
  },
});
```

**Why**: GDPR requires 30-day grace period for data recovery.

---

## Migration Best Practices

### 1. Add Non-Nullable Column (Safe)

```prisma
// Step 1: Add as nullable
model User {
  newField String?
}
// Run migration, backfill data

// Step 2: Make non-nullable
model User {
  newField String @default("default")
}
// Run migration

// Step 3: Remove default in code (not schema)
```

**Why**: Adding non-nullable column to table with existing rows fails.

---

### 2. Rename Column (No Data Loss)

```bash
# Create empty migration
pnpm prisma migrate create rename_name_to_fullname --create-only

# Edit migration SQL manually
# prisma/migrations/XXX_rename/migration.sql
ALTER TABLE "User" RENAME COLUMN "name" TO "fullName";

# Apply migration
pnpm prisma migrate deploy
```

**Why**: Prisma treats rename as DROP + ADD (loses data).

---

### 3. Add Index Concurrently (No Table Lock)

```sql
-- In migration.sql
CREATE INDEX CONCURRENTLY "Mission_status_idx" ON "Mission"("status");
```

**Why**: Without CONCURRENTLY, adding index locks table (blocks writes).

---

## Query Optimization Patterns

### 1. Use `select` to Reduce Payload

```typescript
// ❌ Bad: Fetches all columns (including large JSON fields)
const users = await prisma.user.findMany();

// ✅ Good: Only fetch needed columns
const users = await prisma.user.findMany({
  select: { id: true, email: true },
});
```

**Why**: Reduces payload size by ~70%, improves network transfer time.

---

### 2. Cursor Pagination for Large Datasets

```typescript
// ❌ Bad: Offset pagination (slow on large offsets)
const missions = await prisma.mission.findMany({
  skip: page * 20,
  take: 20,
});

// ✅ Good: Cursor pagination (constant time)
const missions = await prisma.mission.findMany({
  take: 20,
  cursor: lastMissionId ? { id: lastMissionId } : undefined,
  orderBy: { createdAt: 'desc' },
});
```

**Why**: Offset pagination is O(N), cursor pagination is O(1).

---

### 3. Count Optimization

```typescript
// ❌ Bad: Loads all records into memory
const count = (await prisma.mission.findMany()).length;

// ✅ Good: Database-level count
const count = await prisma.mission.count();

// ✅ Better: Count with filters
const activeCount = await prisma.mission.count({
  where: { status: 'ACTIVE' },
});
```

**Why**: Database count is O(1) with proper indexes, findMany().length is O(N).

---

## Common Pitfalls

### ❌ Pitfall 1: Forgetting `await` in Transactions

```typescript
await prisma.$transaction(async (tx) => {
  tx.wallet.update({ ... }); // ❌ Missing await!
  tx.walletTransaction.create({ ... });
});
```

**Impact**: Transaction commits before operations complete - race condition!

**Fix**: Always `await` inside transactions.

---

### ❌ Pitfall 2: Not Handling Unique Constraint Errors

```typescript
await prisma.user.create({
  data: { email: 'test@example.com' },
});
// Throws: P2002 (unique constraint violation) if email exists
```

**Fix**: Catch specific Prisma error codes:
```typescript
try {
  await prisma.user.create({ data: { email } });
} catch (error) {
  if (error.code === 'P2002') {
    throw new AppError('DUPLICATE_EMAIL', 'Email already registered', 409);
  }
  throw error;
}
```

---

### ❌ Pitfall 3: Cascading Delete Without Verification

```prisma
model Place {
  missions Mission[] @relation(onDelete: Cascade)
  // ❌ Deleting place deletes all missions (data loss!)
}
```

**Fix**: Use `Restrict` for important data:
```prisma
model Place {
  missions Mission[] @relation(onDelete: Restrict)
  // ✅ Can't delete place if missions exist
}
```

---

## ZZIK-Specific Patterns

### Mission State Machine

```typescript
// Validate state transitions
const VALID_TRANSITIONS = {
  PENDING_GPS: ['PENDING_QR', 'FAILED'],
  PENDING_QR: ['PENDING_REELS', 'FAILED'],
  PENDING_REELS: ['PENDING_REVIEW', 'FAILED'],
  PENDING_REVIEW: ['COMPLETED', 'REJECTED'],
};

function canTransition(from: MissionRunStatus, to: MissionRunStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

// Enforce in update
if (!canTransition(currentStatus, newStatus)) {
  throw new AppError('INVALID_TRANSITION', `Cannot transition from ${currentStatus} to ${newStatus}`, 400);
}
```

---

### GPS History for Velocity Checks

```typescript
// Store GPS point
await prisma.gpsHistory.create({
  data: {
    userId,
    deviceId,
    lat,
    lng,
    accuracy,
    timestamp: new Date(),
    provider,
  },
});

// Calculate velocity
const lastPoint = await prisma.gpsHistory.findFirst({
  where: { userId, deviceId },
  orderBy: { timestamp: 'desc' },
});

if (lastPoint) {
  const distance = haversineDistance(lastPoint.lat, lastPoint.lng, lat, lng);
  const timeDiff = (Date.now() - lastPoint.timestamp.getTime()) / 1000;
  const speedKmh = (distance / timeDiff) * 3.6;

  if (speedKmh > 80) {
    throw new AppError('TELEPORTATION_DETECTED', `Suspicious speed: ${speedKmh} km/h`, 400);
  }
}
```

---

## Performance Checklist

Before deploying query to production:

- [ ] All foreign keys indexed
- [ ] WHERE clause columns indexed
- [ ] ORDER BY columns indexed
- [ ] No N+1 queries (use `include` or `select`)
- [ ] Pagination implemented (cursor or offset)
- [ ] EXPLAIN ANALYZE shows "Index Scan" (not "Seq Scan")
- [ ] Large result sets use streaming (not findMany)
- [ ] Transactions kept short (<100ms)

---

## Resources

- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Index Tuning: https://www.postgresql.org/docs/current/indexes.html
- ZZIK Schema: `/apps/web/prisma/schema.prisma`

**Skill Version**: 1.0.0
**Created**: 2025-11-24
**Coverage**: Database patterns for ZZIK v5.1
