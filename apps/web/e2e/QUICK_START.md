# E2E Testing Quick Start Guide

## 🚀 Setup (First Time)

### 1. Install Playwright Browsers

```bash
pnpm exec playwright install chromium
```

Or install all browsers:

```bash
pnpm exec playwright install
```

### 2. Set Environment Variables

Create `.env.local` with:

```env
AUTH_JWT_SECRET=test_jwt_secret_minimum_32_characters_long_for_testing
QR_SIGNING_SECRET=test_qr_signing_secret
ENCRYPTION_KEY=test_encryption_key_32_chars_min
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here
DATABASE_URL=postgresql://user:pass@localhost:5432/zzik_test
```

### 3. Seed Test Data (Optional)

```bash
tsx e2e/setup/seed-test-data.ts
```

## 🏃 Running Tests

### Run All Tests

```bash
pnpm test:e2e
```

### Run in Interactive UI Mode

```bash
pnpm test:e2e:ui
```

### Run in Debug Mode

```bash
pnpm test:e2e:debug
```

### Run Specific Test File

```bash
pnpm exec playwright test e2e/auth.spec.ts
pnpm exec playwright test e2e/mission-flow.spec.ts
pnpm exec playwright test e2e/errors.spec.ts
```

### Run Specific Test

```bash
pnpm exec playwright test -g "should successfully authenticate"
```

### Run in Headed Mode (See Browser)

```bash
pnpm test:e2e:headed
```

## 📊 View Results

### Open HTML Report

```bash
pnpm test:e2e:report
```

### View in UI Mode

```bash
pnpm test:e2e:ui
```

## 📁 File Structure

```
e2e/
├── utils/           # Test utilities
│   ├── auth.ts      # JWT helpers
│   ├── gps.ts       # GPS mocking
│   ├── qr.ts        # QR generation
│   └── api.ts       # API helpers
├── setup/
│   └── seed-test-data.ts  # Data seeding
├── auth.spec.ts     # Auth tests (12)
├── mission-flow.spec.ts   # Flow tests (4)
├── errors.spec.ts   # Error tests (19)
├── README.md        # Full documentation
├── TEST_CASES.md    # Test case list
└── QUICK_START.md   # This file
```

## 🧪 Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { createTestAuthHeader } from './utils';

test('my test', async ({ request }) => {
  const headers = createTestAuthHeader({ userId: 'test-123' });

  const response = await request.get('/api/endpoint', {
    headers,
  });

  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data).toHaveProperty('field');
});
```

### Using Test Utilities

```typescript
import {
  createTestAuthHeader,
  mockGpsNearby,
  mockQrPayload
} from './utils';

// Auth
const headers = createTestAuthHeader({ userId: 'user-123' });

// GPS near Seoul
const gps = mockGpsNearby(37.5665, 126.9780, 30);

// Valid QR code
const qr = mockQrPayload({
  missionId: 'mission-1',
  placeId: 'place-1'
});
```

## 🔍 Debugging

### Run Single Test in Debug Mode

```bash
pnpm exec playwright test -g "test name" --debug
```

### Check Test List

```bash
pnpm exec playwright test --list
```

### View Trace

After test failure:

```bash
pnpm test:e2e:report
# Click on failed test → View trace
```

## 🐛 Troubleshooting

### Tests Timing Out

```bash
# Increase timeout in playwright.config.ts
timeout: 60000  # 60 seconds
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Dev Server Not Starting

```bash
# Manually start dev server
pnpm dev

# Then run tests with existing server
pnpm test:e2e
```

### Tests Failing - Database

```bash
# Check DATABASE_URL is set
echo $DATABASE_URL

# Seed test data
tsx e2e/setup/seed-test-data.ts
```

## 📚 Test Statistics

- **Total Tests:** 35
- **Test Files:** 3
- **Auth Tests:** 12
- **Flow Tests:** 4
- **Error Tests:** 19

## 🎯 Common Commands

```bash
# Quick test run
pnpm test:e2e

# Interactive debugging
pnpm test:e2e:ui

# View last results
pnpm test:e2e:report

# Run auth tests only
pnpm exec playwright test e2e/auth

# Run with browser visible
pnpm test:e2e:headed

# List all tests
pnpm exec playwright test --list
```

## 🌐 CI/CD

Tests automatically run in GitHub Actions:
- On push to main/develop
- On pull requests
- After build succeeds

View results in GitHub Actions artifacts:
- playwright-report
- playwright-results

## 📖 Documentation

- `README.md` - Full testing guide
- `TEST_CASES.md` - All test cases
- `E2E_TEST_SETUP_REPORT.md` - Setup details
- `E2E_TEST_OUTPUT_EXAMPLE.md` - Example output

## 💡 Tips

1. Use `test.only()` to run single test
2. Use `test.skip()` to skip tests
3. Use `test.step()` for readable output
4. Check console.log in test output
5. Use UI mode for interactive debugging
6. Screenshots saved in `test-results/`
7. Videos saved on failure only
8. Traces available in HTML report

## 🔗 Resources

- [Playwright Docs](https://playwright.dev)
- [API Reference](https://playwright.dev/docs/api/class-test)
- [Best Practices](https://playwright.dev/docs/best-practices)

---

**Need Help?** Check `e2e/README.md` for detailed documentation.
