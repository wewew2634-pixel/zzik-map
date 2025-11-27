# Browser Automation Skill V2
## Puppeteer/Playwright Integration for Visual QA

## When to Use
Invoke this skill when:
- Running visual regression tests
- Capturing screenshots for UX review
- Checking console/network errors
- Measuring performance metrics
- Cross-browser testing

---

## Setup

### Dependencies
```bash
pnpm add -D playwright @playwright/test
pnpm exec playwright install chromium
```

### Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/test/e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
});
```

---

## Screenshot Capture

### Full Page Screenshots
```typescript
import { chromium } from 'playwright';

async function captureFullPage(url: string, outputPath: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({
    path: outputPath,
    fullPage: true,
  });

  await browser.close();
}
```

### Viewport-Specific Screenshots
```typescript
const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

async function captureResponsive(url: string, outputDir: string) {
  const browser = await chromium.launch();

  for (const viewport of viewports) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.screenshot({
      path: `${outputDir}/${viewport.name}.png`,
    });
    await page.close();
  }

  await browser.close();
}
```

### Element Screenshots
```typescript
async function captureElement(url: string, selector: string, outputPath: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(url);
  await page.waitForSelector(selector);

  const element = page.locator(selector);
  await element.screenshot({ path: outputPath });

  await browser.close();
}
```

---

## Console & Network Monitoring

### Console Error Collection
```typescript
interface ConsoleEntry {
  type: string;
  text: string;
  location?: { url: string; lineNumber: number };
}

async function collectConsoleErrors(url: string): Promise<ConsoleEntry[]> {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const entries: ConsoleEntry[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      entries.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
      });
    }
  });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Allow time for dynamic content

  await browser.close();
  return entries;
}
```

### Network Error Detection
```typescript
interface NetworkError {
  url: string;
  method: string;
  status?: number;
  error?: string;
}

async function detectNetworkErrors(url: string): Promise<NetworkError[]> {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors: NetworkError[] = [];

  page.on('requestfailed', (request) => {
    errors.push({
      url: request.url(),
      method: request.method(),
      error: request.failure()?.errorText,
    });
  });

  page.on('response', (response) => {
    if (response.status() >= 400) {
      errors.push({
        url: response.url(),
        method: response.request().method(),
        status: response.status(),
      });
    }
  });

  await page.goto(url, { waitUntil: 'networkidle' });

  await browser.close();
  return errors;
}
```

---

## Performance Metrics

### Core Web Vitals
```typescript
interface WebVitals {
  lcp?: number;  // Largest Contentful Paint
  fid?: number;  // First Input Delay
  cls?: number;  // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  fcp?: number;  // First Contentful Paint
}

async function measureWebVitals(url: string): Promise<WebVitals> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle' });

  const metrics = await page.evaluate(() => {
    return new Promise<WebVitals>((resolve) => {
      const vitals: WebVitals = {};

      // Get navigation timing
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (nav) {
        vitals.ttfb = nav.responseStart - nav.requestStart;
      }

      // Get paint timing
      const paints = performance.getEntriesByType('paint');
      paints.forEach((paint) => {
        if (paint.name === 'first-contentful-paint') {
          vitals.fcp = paint.startTime;
        }
      });

      // Get LCP
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        vitals.lcp = lcpEntries[lcpEntries.length - 1].startTime;
      }

      // Get CLS
      let clsValue = 0;
      const layoutShifts = performance.getEntriesByType('layout-shift');
      layoutShifts.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      vitals.cls = clsValue;

      resolve(vitals);
    });
  });

  await browser.close();
  return metrics;
}
```

### Page Load Metrics
```typescript
async function measurePageLoad(url: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const startTime = Date.now();
  await page.goto(url, { waitUntil: 'load' });
  const loadTime = Date.now() - startTime;

  const startNetworkIdle = Date.now();
  await page.waitForLoadState('networkidle');
  const networkIdleTime = Date.now() - startTime;

  await browser.close();

  return {
    loadTime,
    networkIdleTime,
    delta: networkIdleTime - loadTime,
  };
}
```

---

## Visual Analysis

### Low Contrast Detection
```typescript
async function detectLowContrast(url: string): Promise<string[]> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(url);

  const lowContrastElements = await page.evaluate(() => {
    const issues: string[] = [];
    const elements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button, label');

    elements.forEach((el) => {
      const style = window.getComputedStyle(el);
      const color = style.color;
      const bgColor = style.backgroundColor;

      // Basic contrast check (simplified)
      if (color.includes('rgb') && bgColor.includes('rgb')) {
        // Extract RGB values and calculate luminance
        // If contrast < 4.5:1, flag as issue
        const text = el.textContent?.trim().slice(0, 30);
        if (text && color === 'rgb(82, 82, 91)') { // zinc-600 example
          issues.push(`Low contrast text: "${text}" - ${el.tagName.toLowerCase()}`);
        }
      }
    });

    return issues;
  });

  await browser.close();
  return lowContrastElements;
}
```

### Broken Image Detection
```typescript
async function detectBrokenImages(url: string): Promise<string[]> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle' });

  const brokenImages = await page.evaluate(() => {
    const images = document.querySelectorAll('img');
    const broken: string[] = [];

    images.forEach((img) => {
      if (!img.complete || img.naturalWidth === 0) {
        broken.push(img.src || img.getAttribute('data-src') || 'unknown');
      }
    });

    return broken;
  });

  await browser.close();
  return brokenImages;
}
```

---

## Accessibility Checks

### Focus Order Validation
```typescript
async function validateFocusOrder(url: string): Promise<string[]> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(url);

  const focusOrder = await page.evaluate(() => {
    const focusable = document.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    return Array.from(focusable).map((el, i) => ({
      index: i,
      tag: el.tagName.toLowerCase(),
      text: el.textContent?.trim().slice(0, 20) || '',
      tabIndex: el.getAttribute('tabindex'),
    }));
  });

  await browser.close();
  return focusOrder.map((f) => `${f.index}: ${f.tag} - ${f.text}`);
}
```

### ARIA Validation
```typescript
async function validateAria(url: string): Promise<string[]> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(url);

  const issues = await page.evaluate(() => {
    const problems: string[] = [];

    // Check for buttons without accessible names
    document.querySelectorAll('button').forEach((btn) => {
      if (!btn.textContent?.trim() && !btn.getAttribute('aria-label')) {
        problems.push(`Button without accessible name: ${btn.outerHTML.slice(0, 100)}`);
      }
    });

    // Check for images without alt text
    document.querySelectorAll('img').forEach((img) => {
      if (!img.alt && !img.getAttribute('role')) {
        problems.push(`Image without alt text: ${img.src.slice(-50)}`);
      }
    });

    // Check for form inputs without labels
    document.querySelectorAll('input, select, textarea').forEach((input) => {
      const id = input.id;
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = input.getAttribute('aria-label');
      const hasAriaLabelledBy = input.getAttribute('aria-labelledby');

      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
        problems.push(`Form control without label: ${input.outerHTML.slice(0, 100)}`);
      }
    });

    return problems;
  });

  await browser.close();
  return issues;
}
```

---

## Health Check Script

### Complete Browser Health Check
```typescript
interface HealthCheckResult {
  url: string;
  timestamp: string;
  consoleErrors: ConsoleEntry[];
  networkErrors: NetworkError[];
  brokenImages: string[];
  accessibilityIssues: string[];
  webVitals: WebVitals;
  loadTime: number;
  screenshotPath?: string;
}

async function runHealthCheck(url: string): Promise<HealthCheckResult> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const result: HealthCheckResult = {
    url,
    timestamp: new Date().toISOString(),
    consoleErrors: [],
    networkErrors: [],
    brokenImages: [],
    accessibilityIssues: [],
    webVitals: {},
    loadTime: 0,
  };

  // Collect console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      result.consoleErrors.push({
        type: msg.type(),
        text: msg.text(),
      });
    }
  });

  // Collect network errors
  page.on('requestfailed', (request) => {
    result.networkErrors.push({
      url: request.url(),
      method: request.method(),
      error: request.failure()?.errorText,
    });
  });

  // Navigate and measure
  const startTime = Date.now();
  await page.goto(url, { waitUntil: 'networkidle' });
  result.loadTime = Date.now() - startTime;

  // Capture screenshot
  const screenshotPath = `/tmp/health-check-${Date.now()}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  result.screenshotPath = screenshotPath;

  // Run checks
  result.brokenImages = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img'))
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.src);
  });

  await browser.close();
  return result;
}
```

---

## Integration with Tests

### Visual Regression Test
```typescript
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('home page matches snapshot', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('home.png', {
      maxDiffPixels: 100,
    });
  });

  test('journey page matches snapshot', async ({ page }) => {
    await page.goto('/journey');
    await expect(page).toHaveScreenshot('journey.png');
  });
});
```

### A11y Test
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

---

## Quick Commands

```bash
# Run E2E tests
pnpm exec playwright test

# Run with UI mode
pnpm exec playwright test --ui

# Update screenshots
pnpm exec playwright test --update-snapshots

# Run specific test
pnpm exec playwright test home.spec.ts

# Show report
pnpm exec playwright show-report
```

---

*Browser Automation Skill V2.0*
*Visual QA & Performance Monitoring*
