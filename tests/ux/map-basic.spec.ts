// tests/ux/map-basic.spec.ts
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Map Basic Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/map`);
    await page.waitForLoadState('networkidle');
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
    await expect(goldBadge).toHaveClass(/text-amber-500/);
    await expect(goldBadge).toHaveClass(/border-amber-500\/80/);
  });

  test('should display traffic signal dots with correct colors', async ({ page }) => {
    const firstCard = page.locator('[data-testid="place-card"]').first();
    const greenDot = firstCard.locator('[data-testid="traffic-dot-success"]');
    const yellowDot = firstCard.locator('[data-testid="traffic-dot-warning"]');
    const redDot = firstCard.locator('[data-testid="traffic-dot-danger"]');

    await expect(greenDot).toHaveClass(/bg-emerald-400/);
    await expect(yellowDot).toHaveClass(/bg-amber-400/);
    await expect(redDot).toHaveClass(/bg-rose-500/);
  });

  test('should scroll PlaceCard list smoothly', async ({ page }) => {
    const list = page.locator('[data-testid="place-list"]');
    await list.evaluate((el) => el.scrollTo({ top: 500, behavior: 'smooth' }));
    // 단순 smoke test: 스크롤 후에도 카드가 렌더링되어 있어야 함
    await expect(list.locator('[data-testid="place-card"]').first()).toBeVisible();
  });

  test('should display filter buttons with correct initial state', async ({ page }) => {
    const allBtn = page.getByRole('button', { name: '전체' });
    const goldBtn = page.getByRole('button', { name: 'GOLD' });
    const activeBtn = page.getByRole('button', { name: '활성' });

    await expect(allBtn).toHaveClass(/bg-zinc-50/);
    await expect(allBtn).toHaveClass(/text-zinc-900/);

    await expect(goldBtn).toHaveClass(/bg-zinc-800/);
    await expect(activeBtn).toHaveClass(/bg-zinc-800/);
  });

  test('should display bottom tabs with Map tab active', async ({ page }) => {
    const mapTab = page.getByRole('link', { name: 'Map' });
    const searchTab = page.getByRole('link', { name: 'Search' });
    const savedTab = page.getByRole('link', { name: 'Saved' });
    const profileTab = page.getByRole('link', { name: 'Profile' });

    await expect(mapTab).toHaveAttribute('aria-current', 'page');
    await expect(searchTab).not.toHaveAttribute('aria-current', 'page');
    await expect(savedTab).not.toHaveAttribute('aria-current', 'page');
    await expect(profileTab).not.toHaveAttribute('aria-current', 'page');
  });

  test('should have no console errors on initial load', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    expect(errors, `Console errors: ${errors.join('\n')}`).toHaveLength(0);
  });

  test('should display drag handle on mobile viewport and hide on desktop', async ({ browser }) => {
    const mobileContext = await browser.newContext({
      viewport: { width: 430, height: 932 }
    });
    const mobilePage = await mobileContext.newPage();

    await mobilePage.goto(`${BASE_URL}/map`);
    await mobilePage.waitForLoadState('networkidle');

    const dragHandleMobile = mobilePage.locator('[data-testid="drag-handle"]');
    await expect(dragHandleMobile).toBeVisible();

    const desktopContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const desktopPage = await desktopContext.newPage();

    await desktopPage.goto(`${BASE_URL}/map`);
    await desktopPage.waitForLoadState('networkidle');

    const dragHandleDesktop = desktopPage.locator('[data-testid="drag-handle"]');
    await expect(dragHandleDesktop).toBeHidden();
  });
});

test.describe('Map Filter Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/map`);
    await page.waitForLoadState('networkidle');
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
    const activeBtn = page.getByRole('button', { name: '활성' });
    await activeBtn.click();

    // successRate 또는 missions 기준은 프론트 로직과 맞춰 튜닝 필요
    const cards = page.locator('[data-testid="place-card"]');
    await expect(cards).toHaveCount(3);
  });

  test('should update filter button styles on click', async ({ page }) => {
    const allBtn = page.getByRole('button', { name: '전체' });
    const goldBtn = page.getByRole('button', { name: 'GOLD' });

    await goldBtn.click();

    await expect(goldBtn).toHaveClass(/bg-zinc-50/);
    await expect(allBtn).toHaveClass(/bg-zinc-800/);
  });
});
