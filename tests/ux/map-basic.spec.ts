// tests/ux/map-basic.spec.ts
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Map Basic Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/map`, { waitUntil: 'domcontentloaded' });
    // Wait for either place cards or map container to be visible
    await page.waitForSelector('.relative.flex.h-screen, [data-testid="place-card"]', {
      timeout: 10000
    }).catch(() => {
      // Fallback: just wait a bit
      return page.waitForTimeout(2000);
    });
  });

  test('should render MapShell with correct layout', async ({ page }) => {
    const mapShell = page.locator('.relative.flex.h-screen');
    await expect(mapShell).toBeVisible();
  });

  test('should display exactly 4 PlaceCards initially', async ({ page }) => {
    const cards = page.locator('[data-testid="place-card"]');
    await expect(cards).toHaveCount(4);
  });

  test('should display GOLD badge with correct styling on first card', async ({ page }) => {
    const firstCard = page.locator('[data-testid="place-card"]').first();
    const goldBadge = firstCard.locator('[data-testid="badge-gold"]');
    await expect(goldBadge).toBeVisible();
    await expect(goldBadge).toHaveClass(/text-zzik-accent-gold/);
    await expect(goldBadge).toHaveClass(/border-zzik-border-highlight/);
  });

  test('should display traffic signal dots with correct colors', async ({ page }) => {
    const firstCard = page.locator('[data-testid="place-card"]').first();

    // First card should have a traffic signal dot (green in mock data)
    const trafficDot = firstCard.locator('[data-testid^="traffic-dot-"]');
    await expect(trafficDot).toBeVisible();

    // Verify it has the correct color class (zzik-accent-green for green)
    await expect(trafficDot).toHaveClass(/bg-zzik-accent-green/);
  });

  test('should scroll PlaceCard list smoothly', async ({ page }) => {
    const list = page.locator('[data-testid="place-list"]');
    await list.evaluate((el) => el.scrollTo({ top: 500, behavior: 'smooth' }));
    // 단순 smoke test: 스크롤 후에도 카드가 렌더링되어 있어야 함
    await expect(list.locator('[data-testid="place-card"]').first()).toBeVisible();
  });

  test('should display filter buttons with correct initial state', async ({ page }) => {
    const allBtn = page.getByRole('button', { name: '전체' });
    const goldBtn = page.getByRole('button', { name: 'GOLD 단골집' });
    const activeBtn = page.getByRole('button', { name: '신호 ON' });

    await expect(allBtn).toHaveClass(/bg-zzik-text-primary/);
    await expect(allBtn).toHaveClass(/text-zzik-bg/);

    await expect(goldBtn).toHaveClass(/bg-zzik-surface-base/);
    await expect(activeBtn).toHaveClass(/bg-zzik-surface-base/);
  });

  test('should display bottom tabs with Map tab active', async ({ page }) => {
    const mapTab = page.getByRole('button', { name: 'Map' });
    const searchTab = page.getByRole('button', { name: 'Search' });
    const savedTab = page.getByRole('button', { name: 'Saved' });
    const profileTab = page.getByRole('button', { name: 'Profile' });

    // Verify all tabs are visible
    await expect(mapTab).toBeVisible();
    await expect(searchTab).toBeVisible();
    await expect(savedTab).toBeVisible();
    await expect(profileTab).toBeVisible();

    // Verify Map tab is active (has text-zzik-text-primary class)
    await expect(mapTab).toHaveClass(/text-zzik-text-primary/);
  });

  test('should have no console errors on initial load', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000); // Wait for content to render

    expect(errors, `Console errors: ${errors.join('\n')}`).toHaveLength(0);
  });

  test('should display drag handle on mobile viewport and hide on desktop', async ({ browser }) => {
    const mobileContext = await browser.newContext({
      viewport: { width: 430, height: 932 }
    });
    const mobilePage = await mobileContext.newPage();

    await mobilePage.goto(`${BASE_URL}/map`, { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(2000);

    const dragHandleMobile = mobilePage.locator('[data-testid="drag-handle"]');
    await expect(dragHandleMobile).toBeVisible();

    await mobileContext.close();

    const desktopContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const desktopPage = await desktopContext.newPage();

    await desktopPage.goto(`${BASE_URL}/map`, { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(2000);

    const dragHandleDesktop = desktopPage.locator('[data-testid="drag-handle"]');
    await expect(dragHandleDesktop).toBeHidden();

    await desktopContext.close();
  });
});

test.describe('Map Filter Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/map`, { waitUntil: 'domcontentloaded' });
    // Wait for filter buttons to be visible
    await page.waitForSelector('button:has-text("전체")', { timeout: 10000 }).catch(() => {
      return page.waitForTimeout(2000);
    });
  });

  test('should filter to GOLD places only', async ({ page }) => {
    const goldBtn = page.getByRole('button', { name: 'GOLD' });
    await goldBtn.click();

    const cards = page.locator('[data-testid="place-card"]');
    const count = await cards.count();

    // 예시: GOLD 카드 2개 기대
    expect(count).toBe(2);

    for (let i = 0; i < count; i++) {
      const badge = cards.nth(i).locator('[data-testid="badge-gold"]');
      await expect(badge).toBeVisible();
    }
  });

  test('should filter to active places', async ({ page }) => {
    const activeBtn = page.getByRole('button', { name: '신호 ON' });
    await activeBtn.click();
    await page.waitForTimeout(300); // Wait for filter animation

    // Active filter: successRate >= 80 OR missions >= 10
    // All 4 seed places meet this criteria
    const cards = page.locator('[data-testid="place-card"]');
    await expect(cards).toHaveCount(4);
  });

  test('should update filter button styles on click', async ({ page }) => {
    const allBtn = page.getByRole('button', { name: '전체' });
    const goldBtn = page.getByRole('button', { name: 'GOLD 단골집' });

    await goldBtn.click();

    await expect(goldBtn).toHaveClass(/bg-zzik-text-primary/);
    await expect(allBtn).toHaveClass(/bg-zzik-surface-base/);
  });
});
