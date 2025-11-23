# E2E Test Cases Reference

Complete list of all E2E test cases organized by category.

## Authentication Tests (12 tests)

**File:** `auth.spec.ts`

1. **should successfully authenticate with valid JWT token**
   - Creates valid JWT token
   - Makes authenticated request
   - Verifies success (not 401)

2. **should reject request without authorization header**
   - Makes request without auth header
   - Expects 401 Unauthorized
   - Verifies error message contains "Authentication"

3. **should reject request with malformed authorization header**
   - Sends "InvalidToken123" without "Bearer " prefix
   - Expects 401 Unauthorized
   - Verifies error response

4. **should reject request with invalid JWT token**
   - Sends token with invalid signature
   - Expects 401 Unauthorized
   - Verifies error contains "invalid" or "expired"

5. **should reject expired JWT token**
   - Creates token expired 1 hour ago
   - Makes request with expired token
   - Expects 401 Unauthorized
   - Verifies error mentions expiration

6. **should reject token with missing subject (sub)**
   - Creates token without "sub" claim
   - Makes request
   - Expects 401 Unauthorized

7. **should accept x-zzik-user-id header in development mode**
   - Sends request with x-zzik-user-id header
   - Should NOT return 401
   - Tests development mode auth fallback

8. **should validate token with different user IDs**
   - Tests multiple user IDs
   - All should authenticate successfully
   - Verifies flexibility in user ID format

9. **should include user context in authenticated requests**
   - Creates mission run with specific user
   - Verifies user context is used
   - Tests backend user association

10. **should handle concurrent requests with different tokens**
    - Creates 5 users
    - Makes 5 parallel requests
    - All should authenticate successfully

11. **should validate JWT signature with correct secret**
    - Creates token with correct secret
    - Makes request
    - Should authenticate successfully

12. **should reject JWT signed with wrong secret**
    - Creates token with wrong secret
    - Makes request
    - Expects 401 Unauthorized

---

## Mission Flow Tests (4 tests)

**File:** `mission-flow.spec.ts`

1. **should complete full mission run flow successfully**
   - Step 1: Get places list
   - Step 2: Start mission run
   - Step 3: Verify GPS location (within 30m)
   - Step 4: Verify QR code (valid signature)
   - Step 5: Verify reels completion
   - Step 6: Check final status (COMPLETED)

2. **should fail GPS verification with mocked location**
   - Start mission run
   - Submit GPS data with mocked=true flag
   - Should fail or return error
   - Tests anti-spoofing

3. **should fail QR verification with invalid signature**
   - Start mission run
   - Submit QR with invalid signature
   - Expects 400+ error
   - Verifies signature validation

4. **should fail GPS verification when too far from place**
   - Start mission run
   - Submit GPS coordinates 11km away
   - Should fail or return error
   - Tests proximity validation

---

## Error Handling Tests (19 tests, 2 skipped)

**File:** `errors.spec.ts`

### Validation Errors (400) - 5 tests

1. **should return 400 for invalid mission ID format**
   - POST to /api/missions/invalid@mission#id/runs
   - Expects 400 if validation triggers
   - Checks for validation error message

2. **should return 400 for missing required fields in GPS verification**
   - POST without lat, lng fields
   - Expects 400 or 404
   - Verifies missing field error

3. **should return 400 for invalid GPS coordinates**
   - Sends lat=999, lng=999, accuracy=-10
   - Expects 400 or 404
   - Tests coordinate validation

4. **should return 400 for malformed QR payload**
   - Sends "not-a-valid-qr-url"
   - Expects 400 or 404
   - Tests QR format validation

5. **should return 400 for invalid request body format**
   - Sends non-JSON string as body
   - Expects 400+
   - Tests body parsing

### Not Found Errors (404) - 4 tests

6. **should return 404 for non-existent mission**
   - POST to /api/missions/nonexistent-{timestamp}/runs
   - Should return 404 if mission doesn't exist
   - Checks error message

7. **should return 404 for non-existent mission run**
   - GET /api/mission-runs/nonexistent-{timestamp}
   - Should return 404 if run doesn't exist
   - Verifies error message

8. **should return 404 for non-existent API endpoint**
   - GET /api/non-existent-endpoint
   - Expects 404
   - Tests default 404 handling

9. **should return 404 for accessing other user mission run**
   - GET mission run belonging to different user
   - Expects 403 or 404
   - Tests authorization

### Server Errors (500) - 2 tests

10. **should handle database connection errors gracefully**
    - Makes request that might fail
    - Verifies error response is JSON
    - Checks error format

11. **should return proper error format for all errors**
    - Tests multiple endpoints
    - All should return JSON errors
    - All should have "error" field

### Rate Limiting (429) - 2 tests (skipped)

12. **should enforce rate limiting on API endpoints** (SKIPPED)
    - Makes 100+ rapid requests
    - Should eventually return 429
    - Currently skipped (not implemented)

13. **should include rate limit headers** (SKIPPED)
    - Checks for rate limit headers
    - Informational test
    - Skipped until implemented

### Error Response Format - 3 tests

14. **should return consistent error format across all endpoints**
    - Tests authentication error (401)
    - Tests not found error (404)
    - All should have "error" field

15. **should include request ID in error responses**
    - Checks for x-request-id header
    - Informational test
    - Documents current behavior

16. **should handle CORS errors properly**
    - Sends Origin header
    - Checks CORS headers
    - Verifies no CORS errors

### Validation Edge Cases - 3 tests

17. **should handle very long input strings**
    - Sends 10,000 character string
    - Should handle gracefully (400/413/404)
    - Tests input size limits

18. **should handle special characters in input**
    - Sends `<script>alert("xss")</script>`
    - Should sanitize or reject
    - Tests XSS prevention

19. **should handle null and undefined values**
    - Sends null and undefined in request
    - Should handle gracefully
    - Tests type handling

---

## Test Statistics

| Category | Total | Description |
|----------|-------|-------------|
| Authentication | 12 | JWT and auth flows |
| Mission Flow | 4 | User journey |
| Validation (400) | 5 | Input validation |
| Not Found (404) | 4 | Resource errors |
| Server Errors (500) | 2 | Error handling |
| Rate Limiting (429) | 2 | Rate limits (skipped) |
| Error Format | 3 | Response consistency |
| Edge Cases | 3 | Boundary testing |
| **Total** | **35** | **All scenarios** |

## Test Execution

```bash
# Run all tests
pnpm test:e2e

# Run specific category
pnpm exec playwright test e2e/auth.spec.ts
pnpm exec playwright test e2e/mission-flow.spec.ts
pnpm exec playwright test e2e/errors.spec.ts

# Run specific test
pnpm exec playwright test -g "should successfully authenticate"
pnpm exec playwright test -g "should complete full mission run"
pnpm exec playwright test -g "should return 404"
```

## Expected Test Data

For tests to pass, the following data should exist:

```typescript
// Mission
{
  id: "test-mission-1",
  placeId: "test-place-1",
  status: "ACTIVE",
  requiredSteps: ["GPS_VERIFY", "QR_VERIFY", "REELS_VERIFY"]
}

// Place
{
  id: "test-place-1",
  lat: 37.5665,
  lng: 126.9780,
  name: "Test Place Seoul"
}
```

## Test Utilities Used

- `createTestUser()` - Generate JWT tokens
- `createTestAuthHeader()` - Create auth headers
- `mockGpsNearby()` - Generate nearby GPS coords
- `mockGpsFarFrom()` - Generate far GPS coords
- `mockQrPayload()` - Generate valid QR codes
- `mockInvalidQrPayload()` - Generate invalid QR codes

## Notes

- 2 tests are skipped (rate limiting) until feature is implemented
- Tests use unique user IDs to avoid conflicts
- Some tests may skip if test data doesn't exist
- All tests are designed to be independent
- Tests clean up after themselves when possible

---

**Last Updated:** 2025-11-22
**Total Test Cases:** 35
**Active Tests:** 33
**Skipped Tests:** 2
