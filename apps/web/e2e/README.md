# E2E Testing with Playwright

This directory contains end-to-end tests for the ZZIK Live application using Playwright.

## Overview

The E2E test suite covers:

1. **Mission Flow** (`mission-flow.spec.ts`):
   - Complete user journey through missions
   - GPS verification
   - QR code verification
   - Reels verification
   - Mission run status checking

2. **Authentication** (`auth.spec.ts`):
   - JWT token validation
   - Unauthorized access (401)
   - Invalid/expired tokens
   - Development mode authentication

3. **Error Handling** (`errors.spec.ts`):
   - Validation errors (400)
   - Not found errors (404)
   - Server errors (500)
   - Rate limiting (429) - when implemented
   - Error response format consistency

## Test Utilities

Located in `utils/`:

- `auth.ts` - JWT token creation and authentication helpers
- `gps.ts` - GPS coordinate generation and mocking
- `qr.ts` - QR payload generation with signatures
- `api.ts` - API request helpers and utilities

## Running Tests

### Prerequisites

Install Playwright browsers:

```bash
pnpm exec playwright install
```

Or just Chromium for faster installation:

```bash
pnpm exec playwright install chromium
```

### Run All Tests

```bash
pnpm test:e2e
```

### Run in UI Mode (Interactive)

```bash
pnpm test:e2e:ui
```

### Run in Debug Mode

```bash
pnpm test:e2e:debug
```

### Run in Headed Mode (See Browser)

```bash
pnpm test:e2e:headed
```

### View Test Report

```bash
pnpm test:e2e:report
```

### Run Specific Test File

```bash
pnpm exec playwright test e2e/auth.spec.ts
```

### Run Specific Test

```bash
pnpm exec playwright test -g "should successfully authenticate"
```

## Environment Variables

The tests use the following environment variables:

- `AUTH_JWT_SECRET` - Secret for JWT token signing
- `QR_SIGNING_SECRET` - Secret for QR payload signing
- `ENCRYPTION_KEY` - Encryption key (minimum 32 characters)
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Mapbox token
- `DATABASE_URL` - PostgreSQL database URL

These are automatically set in `playwright.config.ts` for local development and in CI.

## Test Database

For a complete test setup, you should:

1. Use a separate test database
2. Seed test data before running E2E tests
3. Clean up test data after tests complete

Example seed data needed:

```typescript
// Test missions
- id: "test-mission-1"
- placeId: "test-place-1"
- status: "ACTIVE"

// Test places
- id: "test-place-1"
- lat: 37.5665
- lng: 126.9780
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { createTestAuthHeader } from './utils';

test.describe('Feature Name', () => {
  let authHeaders: Record<string, string>;

  test.beforeEach(() => {
    authHeaders = createTestAuthHeader({
      userId: `test-user-${Date.now()}`
    });
  });

  test('should do something', async ({ request }) => {
    const response = await request.get('/api/endpoint', {
      headers: authHeaders,
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('field');
  });
});
```

### Using Test Steps

```typescript
test('complex flow', async ({ request }) => {
  await test.step('Step 1: Create resource', async () => {
    // Step 1 code
  });

  await test.step('Step 2: Verify resource', async () => {
    // Step 2 code
  });
});
```

### Creating Test Users

```typescript
import { createTestUser, createTestAuthHeader } from './utils';

// Create a token
const token = createTestUser({ userId: 'user-123' });

// Create auth headers
const headers = createTestAuthHeader({ userId: 'user-123' });
```

### Mocking GPS Data

```typescript
import { mockGpsNearby, mockGpsFarFrom } from './utils';

// GPS near a location
const nearby = mockGpsNearby(37.5665, 126.9780, 30); // 30m radius

// GPS far from a location
const faraway = mockGpsFarFrom(37.5665, 126.9780, 10); // 10km away
```

### Creating QR Payloads

```typescript
import { mockQrPayload, mockInvalidQrPayload } from './utils';

// Valid QR payload
const validQr = mockQrPayload({
  missionId: 'mission-1',
  placeId: 'place-1',
});

// Invalid QR payload
const invalidQr = mockInvalidQrPayload({
  missionId: 'mission-1',
  placeId: 'place-1',
});
```

## CI/CD Integration

The E2E tests are automatically run in GitHub Actions CI:

1. After unit tests pass
2. After build succeeds
3. Using Chromium browser only (for speed)
4. Results and reports are uploaded as artifacts

See `.github/workflows/ci.yml` for configuration.

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Clean up any test data created
3. **Unique IDs**: Use timestamps or random IDs for test data
4. **Assertions**: Use meaningful assertion messages
5. **Error Handling**: Handle both success and error cases
6. **Logging**: Use console.log for debugging
7. **Skip**: Use `test.skip()` for tests requiring special setup

## Troubleshooting

### Tests Failing in CI

- Check that all environment variables are set
- Ensure Playwright browsers are installed
- Review artifact logs in GitHub Actions

### Tests Timing Out

- Increase timeout in `playwright.config.ts`
- Check if dev server is starting properly
- Review webServer configuration

### Database Issues

- Ensure DATABASE_URL is set correctly
- Check if database is accessible
- Verify test data exists

### Authentication Errors

- Verify AUTH_JWT_SECRET is set
- Check token expiration
- Ensure user IDs are unique

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-test)
