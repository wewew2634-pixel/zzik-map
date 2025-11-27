# ZZIK Testing Agent

You are a specialized agent for testing and quality assurance in ZZIK MAP.

---

## Purpose

Ensure code quality through comprehensive testing including unit tests, integration tests, and E2E tests.

---

## Tech Stack

- **Test Runner**: Vitest
- **Component Testing**: React Testing Library
- **E2E Testing**: Playwright
- **Mocking**: MSW (Mock Service Worker)
- **Coverage**: Vitest coverage

---

## Setup

### Install Dependencies
```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
pnpm add -D @playwright/test msw
```

### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup File
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## Unit Testing

### Component Test Example
```typescript
// src/components/zzik/vibe/VibeBadge.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VibeBadge } from './VibeBadge';

describe('VibeBadge', () => {
  it('renders vibe label correctly', () => {
    render(<VibeBadge vibe="cozy" />);
    expect(screen.getByText('Cozy')).toBeInTheDocument();
  });

  it('shows icon when specified', () => {
    render(<VibeBadge vibe="modern" showIcon />);
    expect(screen.getByText('🏢')).toBeInTheDocument();
  });

  it('applies correct size class', () => {
    const { container } = render(<VibeBadge vibe="vintage" size="lg" />);
    expect(container.firstChild).toHaveClass('badge-lg');
  });
});
```

### Hook Test Example
```typescript
// src/hooks/useVibe.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useVibe } from './useVibe';

describe('useVibe', () => {
  it('initializes with empty state', () => {
    const { result } = renderHook(() => useVibe());

    expect(result.current.analyzedImage).toBeNull();
    expect(result.current.matches).toEqual([]);
    expect(result.current.isAnalyzing).toBe(false);
  });

  it('analyzes image and returns vibe scores', async () => {
    const { result } = renderHook(() => useVibe());

    await act(async () => {
      await result.current.analyzeImage('data:image/jpeg;base64,xxx');
    });

    await waitFor(() => {
      expect(result.current.analysisResult).not.toBeNull();
      expect(result.current.analysisResult?.primaryVibe).toBeDefined();
    });
  });
});
```

### Utility Test Example
```typescript
// src/lib/vibe-utils.test.ts
import { describe, it, expect } from 'vitest';
import {
  getVibeScoreLevel,
  calculateVibeSimilarity,
  isValidVibe,
} from './vibe-utils';

describe('vibe-utils', () => {
  describe('getVibeScoreLevel', () => {
    it('returns perfect for scores >= 90', () => {
      expect(getVibeScoreLevel(95)).toBe('perfect');
      expect(getVibeScoreLevel(90)).toBe('perfect');
    });

    it('returns high for scores 75-89', () => {
      expect(getVibeScoreLevel(85)).toBe('high');
      expect(getVibeScoreLevel(75)).toBe('high');
    });

    it('returns medium for scores 50-74', () => {
      expect(getVibeScoreLevel(60)).toBe('medium');
    });

    it('returns low for scores < 50', () => {
      expect(getVibeScoreLevel(30)).toBe('low');
    });
  });

  describe('isValidVibe', () => {
    it('returns true for valid vibes', () => {
      expect(isValidVibe('cozy')).toBe(true);
      expect(isValidVibe('modern')).toBe(true);
    });

    it('returns false for invalid vibes', () => {
      expect(isValidVibe('invalid')).toBe(false);
    });
  });

  describe('calculateVibeSimilarity', () => {
    it('returns 100 for identical vectors', () => {
      const vec = [0.5, 0.5, 0.5, 0.5];
      expect(calculateVibeSimilarity(vec, vec)).toBe(100);
    });

    it('handles orthogonal vectors', () => {
      const vec1 = [1, 0, 0, 0];
      const vec2 = [0, 1, 0, 0];
      expect(calculateVibeSimilarity(vec1, vec2)).toBe(50);
    });
  });
});
```

---

## Integration Testing

### API Route Test
```typescript
// src/app/api/vibe/analyze/route.test.ts
import { describe, it, expect, vi } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('POST /api/vibe/analyze', () => {
  it('returns vibe analysis for valid image', async () => {
    const request = new NextRequest('http://localhost/api/vibe/analyze', {
      method: 'POST',
      body: JSON.stringify({ image: 'base64-encoded-image' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.analysis).toBeDefined();
    expect(data.analysis.primaryVibe).toBeDefined();
  });

  it('returns 400 for missing image', async () => {
    const request = new NextRequest('http://localhost/api/vibe/analyze', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
```

### Database Integration Test
```typescript
// src/lib/journey/recommendations.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createClient } from '@/lib/supabase/server';
import { getContentBasedRecommendations } from './recommendations';

describe('recommendations (integration)', () => {
  beforeEach(async () => {
    // Seed test data
    const supabase = createClient();
    await supabase.from('journeys').delete().neq('id', '');
    // Insert test journeys...
  });

  it('returns recommendations based on user profile', async () => {
    const recommendations = await getContentBasedRecommendations(
      { lat: 37.5665, lng: 126.9780 },
      { nationality: 'Japanese', tripDuration: 5, travelStyle: 'standard' },
      5
    );

    expect(recommendations.length).toBeLessThanOrEqual(5);
    recommendations.forEach((rec) => {
      expect(rec.matchScore).toBeGreaterThan(0);
    });
  });
});
```

---

## E2E Testing with Playwright

### Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Example
```typescript
// e2e/journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Journey Intelligence', () => {
  test('user can upload photo and see recommendations', async ({ page }) => {
    await page.goto('/journey/new');

    // Upload photo
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./e2e/fixtures/test-photo.jpg');

    // Wait for GPS extraction
    await expect(page.locator('.extraction-status')).toContainText('Success', {
      timeout: 10000,
    });

    // Click analyze
    await page.click('button:has-text("Get Recommendations")');

    // Wait for recommendations
    await expect(page.locator('.recommendation-card')).toHaveCount(3, {
      timeout: 15000,
    });

    // Verify recommendation content
    const firstRec = page.locator('.recommendation-card').first();
    await expect(firstRec.locator('.match-score')).toBeVisible();
    await expect(firstRec.locator('.place-name')).toBeVisible();
  });

  test('handles manual location input when GPS fails', async ({ page }) => {
    await page.goto('/journey/new');

    // Upload photo without GPS
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./e2e/fixtures/no-gps-photo.jpg');

    // Should show manual input prompt
    await expect(page.locator('.manual-location-prompt')).toBeVisible();

    // Select location on map
    await page.click('.map-container');
    await page.click('button:has-text("Confirm Location")');

    // Should proceed to analysis
    await expect(page.locator('.extraction-status')).toContainText('Manual');
  });
});
```

---

## Mock Service Worker

### Handler Setup
```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock Gemini API
  http.post('https://generativelanguage.googleapis.com/*', () => {
    return HttpResponse.json({
      candidates: [{
        content: {
          parts: [{
            text: JSON.stringify({
              vibeScores: {
                cozy: 75,
                modern: 85,
                vintage: 30,
              },
              primaryVibe: 'modern',
              confidence: 'high',
            }),
          }],
        },
      }],
    });
  }),

  // Mock Supabase
  http.get('*/rest/v1/places*', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Test Cafe',
        latitude: 37.5665,
        longitude: 126.9780,
      },
    ]);
  }),
];
```

### Server Setup
```typescript
// src/test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

---

## Test Scripts

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Coverage Targets

| Area | Target | Notes |
|------|--------|-------|
| Statements | 80% | Overall code coverage |
| Branches | 75% | Conditional logic coverage |
| Functions | 85% | All exported functions |
| Lines | 80% | Line-by-line coverage |

### Critical Paths (100% coverage required)
- Payment processing
- GPS extraction pipeline
- Authentication flows
- Data validation

---

## CI Integration

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm test:coverage
      - run: pnpm test:e2e

      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## Quality Standards

- All new features require tests
- PRs blocked if coverage drops below 80%
- E2E tests for critical user flows
- Mock external APIs (Gemini, Supabase) in tests
- Test mobile responsiveness in Playwright
