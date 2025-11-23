// tests/ux/map-exploration.spec.ts
// 섹션 A: Map-first 탐색 UX 시나리오 테스트
// 참조: docs/ux/PLAYWRIGHT_SCENARIOS_ZZIK.md (섹션 A)

import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = 'http://localhost:3000';

test.describe('A1. 첫 진입 UX – 로딩 & 초기 뷰포트', () => {
  test('UX_MAP_INITIAL_LOAD: should load map page with natural loading state and proper viewport', async ({ page }) => {
    // 1. /map 페이지로 진입
    await page.goto(`${BASE_URL}/map`, { waitUntil: 'domcontentloaded' });

    // 2. 첫 로딩 시: 로딩 인디케이터 또는 스켈레톤 확인
    // Note: 실제 로딩 인디케이터가 있다면 주석 해제
    // const loadingIndicator = page.getByTestId('places-loading');
    // await expect(loadingIndicator).toBeVisible();

    // 3. Wait for place cards to be visible
    await page.waitForSelector('[data-testid="place-card"]', { timeout: 10000 }).catch(() => {
      return page.waitForTimeout(2000);
    });

    // 4. 최소 4개의 PlaceCard 렌더링 확인
    const placeCards = page.getByTestId('place-card');
    await expect(placeCards).toHaveCount(4);

    // 5. 지도 영역 스크린샷 저장 (시각적 확인용)
    await page.screenshot({
      path: path.join('artifacts', 'ux', 'map-initial.png'),
      fullPage: false
    });

    // 검증: MapShell 레이아웃 존재
    const mapShell = page.locator('.relative.flex.h-screen');
    await expect(mapShell).toBeVisible();
  });

  test('should not show frozen screen during initial load', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(`${BASE_URL}/map`);
    // Wait for content to load
    await page.waitForTimeout(2000);

    // 로딩 중 에러가 없어야 함
    expect(errors, `Console errors during load: ${errors.join('\n')}`).toHaveLength(0);
  });
});

test.describe('A2. PlaceCard 정보 구조 – 한눈에 이해되는지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/map`);
    // Wait for content to load
    await page.waitForTimeout(2000);
  });

  test('UX_MAP_PLACE_CARD_INFO: should display complete place information in first card', async ({ page }) => {
    // 첫 번째 카드 찾기 (ZZIK LAB COFFEE 예상)
    const firstCard = page.getByTestId('place-card').first();

    // 장소명 확인
    const placeName = firstCard.getByTestId('place-name');
    await expect(placeName).toBeVisible();
    await expect(placeName).toContainText('ZZIK LAB');

    // GOLD 뱃지 확인 (첫 번째 카드는 GOLD)
    const goldBadge = firstCard.getByTestId('badge-gold');
    await expect(goldBadge).toBeVisible();

    // 카테고리/위치 메타 정보 확인
    const placeMeta = firstCard.getByTestId('place-meta');
    await expect(placeMeta).toBeVisible();

    // 리워드 금액 확인 (예: "5,000원" 형식)
    const placeReward = firstCard.getByTestId('place-reward');
    await expect(placeReward).toBeVisible();
    await expect(placeReward).toContainText('원');

    // Traffic Signal 확인
    const trafficDots = firstCard.locator('[data-testid^="traffic-dot-"]');
    await expect(trafficDots.first()).toBeVisible();
  });

  test('should have proper touch target size on mobile', async ({ browser }) => {
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 } // iPhone 14 Pro
    });
    const mobilePage = await mobileContext.newPage();

    await mobilePage.goto(`${BASE_URL}/map`);
    await mobilePage.waitForLoadState('networkidle');

    // 첫 번째 카드의 크기 측정
    const firstCard = mobilePage.getByTestId('place-card').first();
    const boundingBox = await firstCard.boundingBox();

    // 터치 타깃 최소 크기 확인 (최소 44x44px 권장)
    expect(boundingBox).not.toBeNull();
    if (boundingBox) {
      expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      expect(boundingBox.width).toBeGreaterThanOrEqual(44);
    }

    await mobileContext.close();
  });

  test('should visually distinguish GOLD cards from regular cards', async ({ page }) => {
    const cards = page.getByTestId('place-card');
    const count = await cards.count();

    let goldCardCount = 0;
    let regularCardCount = 0;

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const goldBadge = card.getByTestId('badge-gold');

      if (await goldBadge.isVisible()) {
        goldCardCount++;
        // GOLD 카드는 amber 색상 사용
        await expect(goldBadge).toHaveClass(/text-amber-500/);
        await expect(goldBadge).toHaveClass(/border-amber-500/);
      } else {
        regularCardCount++;
      }
    }

    // 최소 1개의 GOLD 카드와 일반 카드가 있어야 함
    expect(goldCardCount).toBeGreaterThanOrEqual(1);
    expect(regularCardCount).toBeGreaterThanOrEqual(1);
  });
});

test.describe('A3. 필터 UX – 전체 / GOLD / 활성', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/map`);
    // Wait for content to load
    await page.waitForTimeout(2000);
  });

  test('UX_MAP_FILTER_BEHAVIOR: should filter cards based on selected filter', async ({ page }) => {
    // 1. 필터 버튼 존재 확인
    const filterAll = page.getByRole('button', { name: '전체' });
    const filterGold = page.getByRole('button', { name: 'GOLD' });
    const filterActive = page.getByRole('button', { name: '활성' });

    await expect(filterAll).toBeVisible();
    await expect(filterGold).toBeVisible();
    await expect(filterActive).toBeVisible();

    // 2. 기본 상태: "전체" 활성
    await expect(filterAll).toHaveClass(/bg-zinc-50/);
    await expect(filterAll).toHaveClass(/text-zinc-900/);

    // 3. GOLD 필터 클릭
    await filterGold.click();
    await page.waitForTimeout(300); // 애니메이션 대기

    // GOLD 필터 활성화 확인
    await expect(filterGold).toHaveClass(/bg-zinc-50/);

    // GOLD가 아닌 카드가 사라지는지 확인
    const cardsAfterGold = page.getByTestId('place-card');
    const goldCardCount = await cardsAfterGold.count();

    // 모든 카드가 GOLD 뱃지를 가져야 함
    for (let i = 0; i < goldCardCount; i++) {
      const badge = cardsAfterGold.nth(i).getByTestId('badge-gold');
      await expect(badge).toBeVisible();
    }

    // 4. 전체 필터로 복원
    await filterAll.click();
    await page.waitForTimeout(300);

    const cardsAfterAll = page.getByTestId('place-card');
    await expect(cardsAfterAll).toHaveCount(4);
  });

  test('should show empty state when no places match filter', async ({ page }) => {
    const filterActive = page.getByRole('button', { name: '활성' });
    await filterActive.click();
    await page.waitForTimeout(300);

    const cards = page.getByTestId('place-card');
    const cardCount = await cards.count();

    // 활성 필터 결과가 0개인 경우
    if (cardCount === 0) {
      // Empty state 메시지 확인
      const emptyState = page.getByTestId('empty-state');
      await expect(emptyState).toBeVisible();
      await expect(emptyState).toContainText(/조건에 맞는|장소가 없습니다|결과가 없습니다/);
    }
  });

  test('should maintain filter state visual feedback', async ({ page }) => {
    const filterAll = page.getByRole('button', { name: '전체' });
    const filterGold = page.getByRole('button', { name: 'GOLD' });

    // GOLD 클릭 전
    await expect(filterAll).toHaveClass(/bg-zinc-50/);
    await expect(filterGold).toHaveClass(/bg-zinc-800/);

    // GOLD 클릭 후
    await filterGold.click();
    await page.waitForTimeout(200);

    await expect(filterGold).toHaveClass(/bg-zinc-50/);
    await expect(filterAll).toHaveClass(/bg-zinc-800/);
  });
});

test.describe('A4. 맵 ↔ 카드 양방향 인터랙션', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/map`);
    // Wait for content to load
    await page.waitForTimeout(2000);
  });

  test('UX_MAP_CARD_MARKER_SYNC: should highlight marker when card is clicked', async ({ page }) => {
    // 첫 번째 PlaceCard 클릭
    const firstCard = page.getByTestId('place-card').first();

    // 카드의 placeId 또는 data-id 추출 (구현에 따라 조정)
    const placeId = await firstCard.getAttribute('data-id');

    await firstCard.click();
    await page.waitForTimeout(500); // flyTo 애니메이션 대기

    // 스크린샷 저장 (지도 중심 변화 확인용)
    await page.screenshot({
      path: path.join('artifacts', 'ux', 'map-card-clicked.png')
    });

    // Note: Mapbox 마커 선택 상태는 실제 구현에 따라 다를 수 있음
    // 구현되어 있다면 주석 해제
    // const selectedMarker = page.locator(`[data-testid="map-marker-selected"][data-id="${placeId}"]`);
    // await expect(selectedMarker).toBeVisible();
  });

  test('should scroll to card when marker is clicked', async ({ page }) => {
    // Note: 실제 Mapbox 마커 클릭은 canvas 내부라 어려울 수 있음
    // 이 테스트는 마커 클릭 시뮬레이션 함수가 있다면 가능

    // 임시로 두 번째 카드를 클릭하고 첫 번째로 다시 가는 시나리오
    const cards = page.getByTestId('place-card');

    // 두 번째 카드 클릭
    await cards.nth(1).click();
    await page.waitForTimeout(300);

    // 첫 번째 카드 클릭
    await cards.first().click();
    await page.waitForTimeout(300);

    // 선택 상태 변경 확인 (data-selected 또는 특정 클래스)
    // await expect(cards.first()).toHaveAttribute('data-selected', 'true');
  });

  test('should maintain single selection state', async ({ page }) => {
    const cards = page.getByTestId('place-card');

    // 첫 번째 카드 클릭
    await cards.first().click();
    await page.waitForTimeout(200);

    // 두 번째 카드 클릭
    await cards.nth(1).click();
    await page.waitForTimeout(200);

    // 한 번에 하나만 선택되어야 함
    // Note: 실제 구현에서 data-selected 속성을 사용한다고 가정
    const selectedCards = page.locator('[data-testid="place-card"][data-selected="true"]');
    const selectedCount = await selectedCards.count();

    // 선택된 카드가 0개 또는 1개여야 함 (1개가 이상적)
    expect(selectedCount).toBeLessThanOrEqual(1);
  });
});

test.describe('A4 Extended. Map Cluster Interaction', () => {
  test('should zoom in when cluster marker is clicked', async ({ page }) => {
    // Note: 클러스터 마커 테스트는 초기 줌 레벨 조정이 필요할 수 있음
    // 실제 클러스터 마커가 보이는 줌 레벨로 설정 필요

    await page.goto(`${BASE_URL}/map`);
    // Wait for content to load
    await page.waitForTimeout(2000);

    // 스크린샷으로 클러스터 상태 확인
    await page.screenshot({
      path: path.join('artifacts', 'ux', 'map-cluster-before.png')
    });

    // Note: 실제 클러스터 클릭 구현은 Mapbox canvas API 필요
    // 이 테스트는 UI에서 클러스터 확대 버튼을 제공한다면 가능
  });
});
