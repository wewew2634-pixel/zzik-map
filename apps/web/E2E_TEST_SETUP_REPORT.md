# E2E Testing Setup Report

## Summary

Successfully set up comprehensive E2E testing infrastructure using Playwright for the ZZIK Live application.

## Deliverables Completed

### 1. Playwright Installation and Configuration

**Status:** ✅ Complete

- Installed `@playwright/test` v1.56.1 as devDependency
- Created `playwright.config.ts` with:
  - Test directory: `./e2e`
  - Full parallel execution
  - CI-optimized settings (retries, workers)
  - Multi-reporter configuration (HTML, List, JSON)
  - Browser configuration (Chromium primary, Firefox/Webkit available)
  - WebServer auto-start for dev server
  - Screenshot and video on failure

**File:** `/home/ubuntu/work/zzik-live/apps/web/playwright.config.ts`

### 2. Test Utilities

**Status:** ✅ Complete

Created comprehensive utility functions in `e2e/utils/`:

#### Authentication (`auth.ts`)
- `createTestUser()` - Generate JWT tokens for test users
- `createAuthHeader()` - Create Authorization headers
- `createTestAuthHeader()` - Combined token + header creation

#### GPS Testing (`gps.ts`)
- `mockGpsData()` - Generate valid GPS coordinates
- `mockGpsNearby()` - Generate coordinates near a location
- `mockGpsFarFrom()` - Generate coordinates far from a location
- `mockGpsWithMockedFlag()` - Generate spoofed GPS data
- `TEST_LOCATIONS` - Predefined test locations (Seoul, Gangnam, Busan, Jeju)

#### QR Testing (`qr.ts`)
- `mockQrPayload()` - Generate valid QR payloads with HMAC signatures
- `mockInvalidQrPayload()` - Generate invalid QR payloads
- `mockMalformedQrPayload()` - Generate malformed payloads
- `parseQrUrl()` - Parse QR payload URLs

#### API Utilities (`api.ts`)
- `apiRequest()` - Typed API request wrapper
- `waitFor()` - Wait for conditions with timeout
- `cleanup()` - Test data cleanup helper

### 3. Test Suites

**Status:** ✅ Complete

Created 3 comprehensive test suites with **35 total tests**:

#### Mission Flow Tests (`mission-flow.spec.ts`) - 4 tests
Tests the complete user journey:
1. **Complete mission run flow** - Full end-to-end mission completion
   - View places list
   - Start mission run
   - GPS verification
   - QR verification
   - Reels verification
   - Check mission run status

2. **GPS verification with mocked location** - Anti-spoofing validation
3. **QR verification with invalid signature** - Signature validation
4. **GPS verification when far from place** - Location proximity check

#### Authentication Tests (`auth.spec.ts`) - 12 tests
JWT authentication and authorization:
1. Valid JWT token authentication
2. Missing authorization header (401)
3. Malformed authorization header (401)
4. Invalid JWT token (401)
5. Expired JWT token (401)
6. Token without subject claim (401)
7. Development mode x-zzik-user-id header
8. Token validation with different user IDs
9. User context in authenticated requests
10. Concurrent requests with different tokens
11. Valid JWT signature verification
12. Invalid JWT signature rejection

#### Error Handling Tests (`errors.spec.ts`) - 19 tests
Comprehensive error scenario coverage:

**Validation Errors (400)** - 5 tests
- Invalid mission ID format
- Missing required fields
- Invalid GPS coordinates
- Malformed QR payload
- Invalid request body format

**Not Found Errors (404)** - 4 tests
- Non-existent mission
- Non-existent mission run
- Non-existent API endpoint
- Unauthorized access to other user's data

**Server Errors (500)** - 2 tests
- Database connection error handling
- Proper error format validation

**Rate Limiting (429)** - 2 tests (skipped until implemented)
- Rate limit enforcement
- Rate limit headers

**Error Response Format** - 3 tests
- Consistent error format
- Request ID inclusion
- CORS error handling

**Validation Edge Cases** - 3 tests
- Very long input strings
- Special characters
- Null/undefined values

### 4. Package.json Scripts

**Status:** ✅ Complete

Added E2E test scripts:

```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:debug": "playwright test --debug",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:report": "playwright show-report"
}
```

### 5. CI/CD Integration

**Status:** ✅ Complete

Updated `.github/workflows/ci.yml` with:
- Playwright browser installation (Chromium for speed)
- E2E test execution after build
- Environment variable configuration
- Artifact upload for:
  - Playwright HTML report (30 day retention)
  - Test results and screenshots (30 day retention)

**File:** `/home/ubuntu/work/zzik-live/.github/workflows/ci.yml`

### 6. Additional Deliverables

**Documentation:**
- `e2e/README.md` - Comprehensive E2E testing guide
- `e2e/setup/seed-test-data.ts` - Test data seeding script

**Configuration:**
- Updated `.gitignore` with Playwright artifacts
- Playwright test discovery and configuration

## Test Coverage Summary

### API Endpoints Covered

1. **GET /api/places** - Places listing
2. **POST /api/missions/{id}/runs** - Start mission run
3. **GET /api/mission-runs/{id}** - Get mission run status
4. **POST /api/mission-runs/{id}/gps-verify** - GPS verification
5. **POST /api/mission-runs/{id}/qr-verify** - QR verification
6. **POST /api/mission-runs/{id}/reels-verify** - Reels verification
7. **GET /api/users/me** - User profile (auth testing)

### Test Categories

| Category | Tests | Description |
|----------|-------|-------------|
| Mission Flow | 4 | End-to-end user journey |
| Authentication | 12 | JWT validation and authorization |
| Validation Errors | 5 | Input validation (400) |
| Not Found | 4 | Resource not found (404) |
| Server Errors | 2 | Error handling (500) |
| Rate Limiting | 2 | Rate limit testing (429, skipped) |
| Error Format | 3 | Consistent error responses |
| Edge Cases | 3 | Boundary conditions |
| **Total** | **35** | **Comprehensive coverage** |

## Test Execution

### Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run in UI mode (interactive)
pnpm test:e2e:ui

# Run in debug mode
pnpm test:e2e:debug

# Run specific test file
pnpm exec playwright test e2e/auth.spec.ts

# Run specific test
pnpm exec playwright test -g "should successfully authenticate"
```

### Test Environment

Tests run against:
- **URL:** http://localhost:3000
- **Database:** Test database (configured via DATABASE_URL)
- **Environment:** Test environment with mock secrets

Required environment variables:
- `AUTH_JWT_SECRET`
- `QR_SIGNING_SECRET`
- `ENCRYPTION_KEY`
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- `DATABASE_URL`

## Test Infrastructure

### File Structure

```
apps/web/
├── e2e/
│   ├── utils/
│   │   ├── auth.ts          # JWT token utilities
│   │   ├── gps.ts           # GPS mocking utilities
│   │   ├── qr.ts            # QR payload utilities
│   │   ├── api.ts           # API request helpers
│   │   └── index.ts         # Exports
│   ├── setup/
│   │   └── seed-test-data.ts # Test data seeding
│   ├── auth.spec.ts          # Authentication tests
│   ├── mission-flow.spec.ts  # Mission flow tests
│   ├── errors.spec.ts        # Error handling tests
│   └── README.md             # Documentation
├── playwright.config.ts      # Playwright configuration
└── package.json             # Scripts
```

### Test Data Requirements

For full test execution, the following test data should be seeded:

```typescript
// Test Place 1
{
  id: "test-place-1",
  name: "Test Place Seoul",
  lat: 37.5665,
  lng: 126.9780
}

// Test Mission 1
{
  id: "test-mission-1",
  placeId: "test-place-1",
  status: "ACTIVE",
  requiredSteps: ["GPS_VERIFY", "QR_VERIFY", "REELS_VERIFY"]
}
```

Use `e2e/setup/seed-test-data.ts` to seed this data.

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
- Install Playwright Browsers (Chromium)
- Run E2E Tests
  - Auto-start dev server
  - Run all tests in parallel (1 worker in CI)
  - Retry failed tests 2 times
- Upload Reports
  - Playwright HTML report
  - Test results and screenshots
```

### Artifacts

When tests run in CI, the following artifacts are available:
1. **playwright-report** - HTML report with test results, traces, screenshots
2. **playwright-results** - Raw test results, videos of failures

## Example Test Output

```bash
$ pnpm exec playwright test --list

Listing tests:
  [chromium] › auth.spec.ts:12:3 › Authentication › should successfully authenticate with valid JWT token
  [chromium] › auth.spec.ts:30:3 › Authentication › should reject request without authorization header
  [chromium] › mission-flow.spec.ts:26:3 › Mission Run Flow › should complete full mission run flow successfully
  ... (32 more tests)

Total: 35 tests in 3 files
```

## Best Practices Implemented

1. **Test Isolation** - Each test creates unique user IDs
2. **Cleanup** - Test utilities include cleanup helpers
3. **Error Handling** - Tests handle both success and failure cases
4. **Logging** - Console.log for debugging
5. **Skip Capability** - Tests can be skipped if prerequisites not met
6. **Timeouts** - Appropriate timeouts for CI and local
7. **Parallel Execution** - Tests run in parallel for speed
8. **Retries** - Auto-retry on failure in CI
9. **Screenshots** - Auto-capture on failure
10. **Videos** - Record failures for debugging

## Next Steps

1. **Seed Test Data** - Run seed script to populate test database
2. **Run Tests** - Execute `pnpm test:e2e` locally
3. **Review Reports** - Check HTML report for detailed results
4. **CI Integration** - Push to GitHub to run in CI
5. **Expand Coverage** - Add more test scenarios as needed

## Resources

- Playwright Documentation: https://playwright.dev
- Test Files: `/home/ubuntu/work/zzik-live/apps/web/e2e/`
- Configuration: `/home/ubuntu/work/zzik-live/apps/web/playwright.config.ts`
- CI Config: `/home/ubuntu/work/zzik-live/.github/workflows/ci.yml`

---

**Setup Completed:** 2025-11-22
**Total Tests:** 35
**Test Files:** 3
**Utility Files:** 4
**Documentation:** Complete
**CI Integration:** Complete
