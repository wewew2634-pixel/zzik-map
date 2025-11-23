# Backend Tests

## Overview
Comprehensive test suite for ZZIK LIVE backend core functionality.

## Test Structure

- `setup.ts` - Test infrastructure, Prisma client, helper functions
- `mission-run.test.ts` - MissionRun creation and duplicate prevention tests (9 tests)
- `mission-run-approve.test.ts` - MissionRun approval and Wallet integration tests (8 tests)

## Running Tests

```bash
# Run all backend tests
pnpm test:backend

# Run individual test suites
pnpm test:backend:mission-run
pnpm test:backend:approve

# Run with coverage (HTML report in coverage/ directory)
pnpm test:backend:coverage
```

## Coverage

Coverage is collected using c8. Note that tsx uses esbuild which doesn't support Node's inspector protocol, so coverage numbers may show as 0%. The infrastructure is in place for when switching to a coverage-compatible test runner (ts-node, Jest, or Vitest).

Generated coverage reports:
- `coverage/index.html` - HTML report
- `coverage/lcov.info` - LCOV format for CI integration

## Test Database

Tests use a local Postgres database. Configure via `DATABASE_URL` environment variable:

```bash
export DATABASE_URL="postgresql://zzik:zzik_pw@localhost:5432/zzikmap?schema=public"
```

## CI/CD

Tests run automatically on:
- Push to main (when backend files change)
- Pull requests (when backend files change)
- Pre-commit hook (when core files are staged)

See `.github/workflows/backend-test.yml` for CI configuration.

## Test Results

Current status: **17/17 tests passing (100%)**

- MissionRun creation: 9 tests
- MissionRun approval & rewards: 8 tests

## Key Test Scenarios

### MissionRun Creation
- ✅ Basic creation
- ✅ Duplicate prevention (activeLockKey)
- ✅ Multi-user support
- ✅ Mission status validation
- ✅ Time window enforcement
- ✅ Run quota limits
- ✅ Re-participation after completion

### MissionRun Approval
- ✅ Basic approval and reward
- ✅ Idempotency protection
- ✅ Wallet creation on first reward
- ✅ Balance calculation
- ✅ Invalid state handling
- ✅ Optimistic locking (version control)
- ✅ Transaction atomicity
