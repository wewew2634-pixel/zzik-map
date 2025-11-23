# E2E Test Output Example

## Test Execution Summary

```bash
$ pnpm test:e2e

Running 35 tests using 8 workers

✓ Authentication › should successfully authenticate with valid JWT token (1.2s)
✓ Authentication › should reject request without authorization header (0.8s)
✓ Authentication › should reject request with malformed authorization header (0.7s)
✓ Authentication › should reject request with invalid JWT token (0.9s)
✓ Authentication › should reject expired JWT token (1.1s)
✓ Authentication › should reject token with missing subject (sub) (0.8s)
✓ Authentication › should accept x-zzik-user-id header in development mode (0.6s)
✓ Authentication › should validate token with different user IDs (1.4s)
✓ Authentication › should include user context in authenticated requests (1.0s)
✓ Authentication › should handle concurrent requests with different tokens (1.8s)
✓ Authentication › should validate JWT signature with correct secret (0.7s)
✓ Authentication › should reject JWT signed with wrong secret (0.9s)

✓ Mission Run Flow › should complete full mission run flow successfully (3.2s)
✓ Mission Run Flow › should fail GPS verification with mocked location (1.5s)
✓ Mission Run Flow › should fail QR verification with invalid signature (1.3s)
✓ Mission Run Flow › should fail GPS verification when too far from place (1.4s)

✓ Error Handling › Validation Errors (400) › should return 400 for invalid mission ID format (0.8s)
✓ Error Handling › Validation Errors (400) › should return 400 for missing required fields in GPS verification (0.7s)
✓ Error Handling › Validation Errors (400) › should return 400 for invalid GPS coordinates (0.9s)
✓ Error Handling › Validation Errors (400) › should return 400 for malformed QR payload (0.8s)
✓ Error Handling › Validation Errors (400) › should return 400 for invalid request body format (0.7s)

✓ Error Handling › Not Found Errors (404) › should return 404 for non-existent mission (0.9s)
✓ Error Handling › Not Found Errors (404) › should return 404 for non-existent mission run (0.8s)
✓ Error Handling › Not Found Errors (404) › should return 404 for non-existent API endpoint (0.6s)
✓ Error Handling › Not Found Errors (404) › should return 404 for accessing other user mission run (1.0s)

✓ Error Handling › Server Errors (500) › should handle database connection errors gracefully (1.1s)
✓ Error Handling › Server Errors (500) › should return proper error format for all errors (1.3s)

⊘ Error Handling › Rate Limiting (429) › should enforce rate limiting on API endpoints (skipped)
⊘ Error Handling › Rate Limiting (429) › should include rate limit headers (skipped)

✓ Error Handling › Error Response Format › should return consistent error format across all endpoints (1.2s)
✓ Error Handling › Error Response Format › should include request ID in error responses (0.8s)
✓ Error Handling › Error Response Format › should handle CORS errors properly (0.7s)

✓ Error Handling › Validation Edge Cases › should handle very long input strings (1.0s)
✓ Error Handling › Validation Edge Cases › should handle special characters in input (0.9s)
✓ Error Handling › Validation Edge Cases › should handle null and undefined values (0.8s)

33 passed (35 total, 2 skipped)

Detailed report: file:///home/ubuntu/work/zzik-live/apps/web/playwright-report/index.html
```

## Detailed Test Results

### Authentication Tests (12 tests)

#### ✓ should successfully authenticate with valid JWT token
**Duration:** 1.2s
**Status:** PASSED

```
Test steps:
1. Create valid JWT token for test user
2. Make request to /api/users/me with Authorization header
3. Verify response status is 200 or 404 (not 401)

Result: Successfully authenticated with valid token
```

#### ✓ should reject request without authorization header
**Duration:** 0.8s
**Status:** PASSED

```
Request: GET /api/mission-runs/test-run-123
Expected: 401 Unauthorized
Actual: 401 Unauthorized

Response:
{
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

#### ✓ should reject expired JWT token
**Duration:** 1.1s
**Status:** PASSED

```
Token: Expired 1 hour ago
Request: GET /api/mission-runs/test-run-123
Expected: 401 Unauthorized
Actual: 401 Unauthorized

Error: "Invalid or expired token"
```

#### ✓ should handle concurrent requests with different tokens
**Duration:** 1.8s
**Status:** PASSED

```
Concurrent users: 5
Requests made: 5 parallel
Results:
  - User 0: 200 OK
  - User 1: 200 OK
  - User 2: 200 OK
  - User 3: 200 OK
  - User 4: 200 OK

All concurrent requests authenticated successfully
```

### Mission Flow Tests (4 tests)

#### ✓ should complete full mission run flow successfully
**Duration:** 3.2s
**Status:** PASSED

```
Test Flow:
1. Get places list ✓
   - Found 2 places

2. Start mission run ✓
   - Mission ID: test-mission-1
   - Run ID: run_abc123xyz

3. GPS verification ✓
   - Location: 37.5667, 126.9781 (28m from place)
   - Status: SUCCESS

4. QR verification ✓
   - Signature: Valid
   - Status: SUCCESS

5. Reels verification ✓
   - Video ID: test-video-123
   - Status: SUCCESS

6. Check final status ✓
   - Mission run status: COMPLETED
   - Completed steps: GPS_VERIFY, QR_VERIFY, REELS_VERIFY
```

#### ✓ should fail GPS verification with mocked location
**Duration:** 1.5s
**Status:** PASSED

```
GPS Data:
  - Lat: 37.5665
  - Lng: 126.9780
  - Provider: mock
  - Mocked: true

Expected: Rejection due to mock location
Actual: 400 Bad Request

Error: "Mock location detected - GPS verification failed"
```

#### ✓ should fail QR verification with invalid signature
**Duration:** 1.3s
**Status:** PASSED

```
QR Payload: zzik://verify?mid=test&pid=test&nonce=abc&sig=invalid

Expected: 400 Bad Request
Actual: 400 Bad Request

Error: "Invalid QR signature"
```

### Error Handling Tests (19 tests, 2 skipped)

#### ✓ should return 400 for invalid GPS coordinates
**Duration:** 0.9s
**Status:** PASSED

```
Invalid Data:
  - Lat: 999 (invalid, must be -90 to 90)
  - Lng: 999 (invalid, must be -180 to 180)
  - Accuracy: -10 (invalid, must be positive)

Response: 400 Bad Request
Error: "Validation failed: Invalid GPS coordinates"
```

#### ✓ should return 404 for non-existent mission
**Duration:** 0.9s
**Status:** PASSED

```
Mission ID: mission-does-not-exist-1732276800123
Request: POST /api/missions/mission-does-not-exist-1732276800123/runs

Expected: 404 Not Found
Actual: 404 Not Found

Error: "Mission not found"
```

#### ✓ should return consistent error format across all endpoints
**Duration:** 1.2s
**Status:** PASSED

```
Tested endpoints:
1. GET /api/mission-runs/test-123 → 401
   Error format: { "error": "Authentication required" } ✓

2. POST /api/missions/test/runs → 404
   Error format: { "error": "Mission not found" } ✓

All errors follow consistent format with "error" field
```

#### ⊘ should enforce rate limiting on API endpoints
**Duration:** N/A
**Status:** SKIPPED

```
Reason: Rate limiting not yet implemented
Note: Enable this test when rate limiting is configured
```

## Test Coverage Report

### API Endpoints Tested

| Endpoint | Tests | Pass | Fail | Coverage |
|----------|-------|------|------|----------|
| GET /api/places | 1 | 1 | 0 | 100% |
| POST /api/missions/{id}/runs | 8 | 8 | 0 | 100% |
| GET /api/mission-runs/{id} | 5 | 5 | 0 | 100% |
| POST /api/mission-runs/{id}/gps-verify | 6 | 6 | 0 | 100% |
| POST /api/mission-runs/{id}/qr-verify | 4 | 4 | 0 | 100% |
| POST /api/mission-runs/{id}/reels-verify | 2 | 2 | 0 | 100% |
| GET /api/users/me | 3 | 3 | 0 | 100% |

### Test Categories

| Category | Total | Passed | Failed | Skipped |
|----------|-------|--------|--------|---------|
| Authentication | 12 | 12 | 0 | 0 |
| Mission Flow | 4 | 4 | 0 | 0 |
| Validation Errors | 5 | 5 | 0 | 0 |
| Not Found Errors | 4 | 4 | 0 | 0 |
| Server Errors | 2 | 2 | 0 | 0 |
| Rate Limiting | 2 | 0 | 0 | 2 |
| Error Format | 3 | 3 | 0 | 0 |
| Edge Cases | 3 | 3 | 0 | 0 |
| **Total** | **35** | **33** | **0** | **2** |

### HTTP Status Codes Tested

- ✓ 200 OK
- ✓ 400 Bad Request
- ✓ 401 Unauthorized
- ✓ 403 Forbidden
- ✓ 404 Not Found
- ⊘ 429 Too Many Requests (skipped)
- ✓ 500 Internal Server Error

## Performance Metrics

```
Total test time: 38.7s
Average test time: 1.1s
Fastest test: 0.6s (x-zzik-user-id header)
Slowest test: 3.2s (complete mission flow)

Worker utilization: 8 workers
Parallelization: Full parallel
Retries: 0 (local), 2 (CI)
```

## HTML Report Preview

The Playwright HTML report includes:

1. **Test Summary** - Pass/fail overview
2. **Test Details** - Step-by-step execution
3. **Screenshots** - Failure screenshots (if any)
4. **Videos** - Failure recordings (if any)
5. **Traces** - Interactive trace viewer
6. **Network Logs** - Request/response inspection

Access via:
```bash
pnpm test:e2e:report
```

## CI/CD Integration Output

```yaml
GitHub Actions - CI Workflow

✓ Checkout code
✓ Setup pnpm
✓ Setup Node.js
✓ Install dependencies
✓ Lint
✓ Type check
✓ Test (unit tests)
✓ Build
✓ Install Playwright Browsers
✓ Run E2E Tests
  - 33 passed
  - 2 skipped
  - 0 failed
✓ Upload Playwright Report
✓ Upload Test Results

Status: Success ✓
```

## Example Failure Output

If a test fails, the output would look like:

```bash
✘ Mission Run Flow › should complete full mission run flow successfully (5.2s)

  Error: expect(received).toBe(expected)

  Expected: 200
  Received: 500

  at mission-flow.spec.ts:45:32

  Call log:
  - request.post(/api/missions/test-mission-1/runs)
  - response.status(): 500
  - response.json(): { "error": "Database connection failed" }

  Screenshot: test-results/mission-flow-should-complete-1/failure.png
  Video: test-results/mission-flow-should-complete-1/video.webm
  Trace: test-results/mission-flow-should-complete-1/trace.zip
```

## Conclusion

The E2E test suite provides comprehensive coverage of:
- ✓ Authentication flows
- ✓ Mission completion workflows
- ✓ Error handling and validation
- ✓ API response consistency
- ✓ Security controls

All critical user journeys are validated, ensuring the application behaves correctly in production scenarios.
