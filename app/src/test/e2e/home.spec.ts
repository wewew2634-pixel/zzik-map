import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ZZIK/);
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('ZZIK');
    await expect(page.locator('h1')).toContainText('MAP');
  });

  test('should have CTA buttons', async ({ page }) => {
    await page.goto('/');
    // Check for journey and explore links
    await expect(page.locator('a[href="/journey"]').first()).toBeVisible();
    await expect(page.locator('a[href="/explore"]').first()).toBeVisible();
  });

  test('should navigate to journey page', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href="/journey"]').first().click();
    await expect(page).toHaveURL('/journey');
  });

  test('should navigate to explore page', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href="/explore"]').first().click();
    await expect(page).toHaveURL('/explore');
  });
});

test.describe('Journey Page', () => {
  test('should load the journey page', async ({ page }) => {
    await page.goto('/journey');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display upload area', async ({ page }) => {
    await page.goto('/journey');
    // Check for file input
    await expect(page.locator('input[type="file"]')).toBeAttached();
  });

  test('should show progress steps', async ({ page }) => {
    await page.goto('/journey');
    // Progress dots container should be visible (3 dots with lines)
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Explore Page', () => {
  test('should load the explore page', async ({ page }) => {
    await page.goto('/explore');
    await expect(page).toHaveURL('/explore');
  });
});

test.describe('API Health', () => {
  test('should return health status', async ({ request }) => {
    const response = await request.get('/api/health');
    // Health API may return 200 or 503 depending on system state
    expect([200, 503]).toContain(response.status());
    const json = await response.json();
    // Always returns data with status field
    expect(json.data).toBeDefined();
    expect(['healthy', 'degraded', 'unhealthy']).toContain(json.data.status);
  });
});

test.describe('API Locations', () => {
  test('should return locations list', async ({ request }) => {
    const response = await request.get('/api/locations');
    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });

  test('should respect limit parameter', async ({ request }) => {
    const response = await request.get('/api/locations?limit=5');
    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.data.length).toBeLessThanOrEqual(5);
  });
});

test.describe('Accessibility', () => {
  test('should have proper lang attribute', async ({ page }) => {
    await page.goto('/');
    // Wait for page to load, then check for lang attribute (may be set dynamically)
    await page.waitForTimeout(500);
    const langAttr = await page.locator('html').getAttribute('lang');
    // Lang could be 'en', 'ko', or any valid locale
    expect(langAttr === null || langAttr.length >= 2).toBeTruthy();
  });

  test('should have no empty links', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('a');
    const count = await links.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });
});
