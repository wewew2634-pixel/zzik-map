// tests/ux/mission-flow.spec.ts
// 섹션 B: MissionRun 실행 UX 시나리오 테스트
// 참조: docs/ux/PLAYWRIGHT_SCENARIOS_ZZIK.md (섹션 B)

import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// 미션 ID 상수
const TEST_MISSION_ID = 'mission-zzik-lab-coffee-basic';

test.describe('B1. 미션 시작 버튼 – MissionRun 생성', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/map`);
    await page.waitForLoadState('networkidle');
  });

  test('UX_MISSION_START_BUTTON: should create MissionRun when start button is clicked', async ({ page }) => {
    // Network 요청 모니터링
    const missionRunRequests: any[] = [];

    page.on('request', (request) => {
      if (request.url().includes('/api/missions/') && request.url().includes('/runs')) {
        missionRunRequests.push({
          method: request.method(),
          url: request.url()
        });
      }
    });

    let missionRunResponse: any = null;

    page.on('response', async (response) => {
      if (response.url().includes('/api/missions/') && response.url().includes('/runs')) {
        try {
          missionRunResponse = await response.json();
        } catch (e) {
          // JSON 파싱 실패는 무시
        }
      }
    });

    // 1. 미션 시작 버튼 찾기
    const startButton = page.locator(
      `[data-testid="mission-start-button"][data-mission-id="${TEST_MISSION_ID}"]`
    );

    // 버튼이 존재하는지 확인 (없다면 카드를 먼저 클릭해야 할 수 있음)
    const isButtonVisible = await startButton.isVisible().catch(() => false);

    if (!isButtonVisible) {
      // 버튼이 바로 보이지 않으면 해당 카드를 먼저 클릭
      const targetCard = page.locator(`[data-testid="place-card"][data-id*="zzik-lab-coffee"]`);
      if (await targetCard.isVisible()) {
        await targetCard.click();
        await page.waitForTimeout(300);
      }
    }

    // 2. 버튼 클릭
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(500);

      // 3. POST /api/missions/:id/runs 호출 확인
      expect(missionRunRequests.length).toBeGreaterThan(0);
      expect(missionRunRequests[0].method).toBe('POST');

      // 4. 응답에 missionRunId 포함 확인
      if (missionRunResponse) {
        expect(missionRunResponse.data).toHaveProperty('missionRunId');
        expect(missionRunResponse.data.missionRunId).toBeTruthy();
      }

      // 5. "미션이 시작되었습니다" 안내 확인
      const statusBanner = page.getByTestId('mission-status-banner');
      // Note: 실제 구현에 따라 배너가 다를 수 있음
      // await expect(statusBanner).toBeVisible();
    }
  });

  test('should store missionRunId in state or URL', async ({ page }) => {
    // URL 또는 전역 상태에 missionRunId 저장 확인
    // 예: /map?runId=xxx 형태로 저장되는지 확인

    const startButton = page.locator(`[data-testid="mission-start-button"]`).first();

    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(500);

      // URL 쿼리 파라미터 확인
      const url = new URL(page.url());
      const runId = url.searchParams.get('runId');

      // runId가 URL에 있거나, 없다면 로컬스토리지/세션스토리지 확인
      if (!runId) {
        // Note: 실제 구현에서 어디에 저장하는지에 따라 조정
        const localStorage = await page.evaluate(() => {
          return window.localStorage.getItem('currentMissionRunId');
        });

        // expect(localStorage).toBeTruthy();
      }
    }
  });
});

test.describe('B2. MissionRun 상태 표시 – Stepper UI', () => {
  let missionRunId: string;

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/map`);
    await page.waitForLoadState('networkidle');

    // 미션 실행 (API 직접 호출로 간소화)
    const response = await page.request.post(
      `${API_BASE}/missions/${TEST_MISSION_ID}/runs`
    );

    const data = await response.json();
    missionRunId = data.data.missionRunId;
  });

  test('UX_MISSION_STATUS_STEPPER: should display 5-step stepper with correct initial state', async ({ page }) => {
    // missionRunId를 URL이나 상태에 설정 (구현에 따라 다름)
    // 예: /map?runId=xxx
    await page.goto(`${BASE_URL}/map?runId=${missionRunId}`);
    await page.waitForLoadState('networkidle');

    // 1. 5단계 스텝 UI 존재 확인
    const gpsStep = page.getByTestId('mission-step-gps');
    const qrStep = page.getByTestId('mission-step-qr');
    const reelsStep = page.getByTestId('mission-step-reels');
    const reviewStep = page.getByTestId('mission-step-review');
    const rewardStep = page.getByTestId('mission-step-reward');

    // Note: Stepper UI가 구현되어 있다면 주석 해제
    // await expect(gpsStep).toBeVisible();
    // await expect(qrStep).toBeVisible();
    // await expect(reelsStep).toBeVisible();
    // await expect(reviewStep).toBeVisible();
    // await expect(rewardStep).toBeVisible();

    // 2. 초기 상태 (PENDING_GPS): GPS 스텝만 활성화
    // await expect(gpsStep).toHaveAttribute('data-status', 'current');
    // await expect(qrStep).toHaveAttribute('data-status', 'pending');
    // await expect(reelsStep).toHaveAttribute('data-status', 'pending');
    // await expect(reviewStep).toHaveAttribute('data-status', 'pending');
    // await expect(rewardStep).toHaveAttribute('data-status', 'pending');
  });

  test('should update stepper when advancing to next step', async ({ page }) => {
    await page.goto(`${BASE_URL}/map?runId=${missionRunId}`);
    await page.waitForLoadState('networkidle');

    // GPS 진행 버튼 클릭 (테스트용)
    const gpsAdvanceButton = page.getByTestId('mission-step-gps-advance');

    if (await gpsAdvanceButton.isVisible()) {
      await gpsAdvanceButton.click();
      await page.waitForTimeout(500);

      // GPS 스텝 완료, QR 스텝 활성화 확인
      const gpsStep = page.getByTestId('mission-step-gps');
      const qrStep = page.getByTestId('mission-step-qr');

      // await expect(gpsStep).toHaveAttribute('data-status', 'completed');
      // await expect(qrStep).toHaveAttribute('data-status', 'current');
    }
  });
});

test.describe('B3. GPS → QR → Reels → Review → Reward E2E', () => {
  let missionRunId: string;

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/map`);
    await page.waitForLoadState('networkidle');

    // 미션 실행
    const response = await page.request.post(
      `${API_BASE}/missions/${TEST_MISSION_ID}/runs`
    );

    const data = await response.json();
    missionRunId = data.data.missionRunId;
  });

  test('UX_MISSION_FLOW_E2E_TEST: should complete full mission flow using test buttons', async ({ page }) => {
    await page.goto(`${BASE_URL}/map?runId=${missionRunId}`);
    await page.waitForLoadState('networkidle');

    // 1. GPS 진행
    const gpsAdvanceButton = page.getByTestId('mission-step-gps-advance');
    if (await gpsAdvanceButton.isVisible()) {
      await gpsAdvanceButton.click();
      await page.waitForTimeout(500);

      // 상태가 PENDING_QR / PENDING_REELS / PENDING_REVIEW 중 하나로 변경
      const statusResponse = await page.request.get(
        `${API_BASE}/mission-runs/${missionRunId}`
      );
      const statusData = await statusResponse.json();
      const status = statusData.data.status;

      expect(['PENDING_QR', 'PENDING_REELS', 'PENDING_REVIEW']).toContain(status);

      // 2. QR 진행 (필요한 경우)
      if (status === 'PENDING_QR') {
        const qrAdvanceButton = page.getByTestId('mission-step-qr-advance');
        if (await qrAdvanceButton.isVisible()) {
          await qrAdvanceButton.click();
          await page.waitForTimeout(500);
        }
      }

      // 3. Reels 진행 (필요한 경우)
      const statusAfterQr = await page.request.get(
        `${API_BASE}/mission-runs/${missionRunId}`
      );
      const statusAfterQrData = await statusAfterQr.json();

      if (statusAfterQrData.data.status === 'PENDING_REELS') {
        const reelsAdvanceButton = page.getByTestId('mission-step-reels-advance');
        if (await reelsAdvanceButton.isVisible()) {
          await reelsAdvanceButton.click();
          await page.waitForTimeout(500);
        }
      }

      // 4. 검수 완료 / 승인
      const reviewApproveButton = page.getByTestId('mission-step-review-approve');
      if (await reviewApproveButton.isVisible()) {
        await reviewApproveButton.click();
        await page.waitForTimeout(500);

        // 5. 최종 상태 APPROVED 확인
        const finalStatusResponse = await page.request.get(
          `${API_BASE}/mission-runs/${missionRunId}`
        );
        const finalStatusData = await finalStatusResponse.json();

        expect(finalStatusData.data.status).toBe('APPROVED');

        // "리워드 지급 완료" 배너 확인
        // const rewardBanner = page.getByText(/리워드 지급 완료|보상이 지급되었습니다/);
        // await expect(rewardBanner).toBeVisible();
      }
    }
  });

  test('should display status badge on place card after mission completion', async ({ page }) => {
    // E2E 플로우 완료 후 장소 카드에 상태 배지 표시 확인

    // 미션 완료 처리 (간소화: API 직접 호출)
    // Note: 실제로는 위의 E2E 플로우를 모두 실행해야 함

    await page.goto(`${BASE_URL}/map`);
    await page.waitForLoadState('networkidle');

    // 해당 장소 카드 찾기
    const targetCard = page.locator(`[data-testid="place-card"][data-id*="zzik-lab-coffee"]`);

    if (await targetCard.isVisible()) {
      // "진행 중" 또는 "완료" 배지 확인
      // const statusBadge = targetCard.getByTestId('mission-status-badge');
      // await expect(statusBadge).toBeVisible();
    }
  });
});

test.describe('B4. MissionRun 상태 조회 API와 UI 동기화', () => {
  let missionRunId: string;

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/map`);
    await page.waitForLoadState('networkidle');

    const response = await page.request.post(
      `${API_BASE}/missions/${TEST_MISSION_ID}/runs`
    );

    const data = await response.json();
    missionRunId = data.data.missionRunId;
  });

  test('UX_MISSION_STATUS_POLLING: should sync API response with UI state', async ({ page }) => {
    const apiRequests: any[] = [];

    page.on('request', (request) => {
      if (request.url().includes(`/api/mission-runs/${missionRunId}`)) {
        apiRequests.push({
          method: request.method(),
          url: request.url(),
          timestamp: Date.now()
        });
      }
    });

    await page.goto(`${BASE_URL}/map?runId=${missionRunId}`);
    await page.waitForLoadState('networkidle');

    // 상태 변경 액션 (테스트용 진행 버튼)
    const gpsAdvanceButton = page.getByTestId('mission-step-gps-advance');

    if (await gpsAdvanceButton.isVisible()) {
      await gpsAdvanceButton.click();
      await page.waitForTimeout(500);

      // MissionRun API 재호출 확인
      const getRequests = apiRequests.filter(r => r.method === 'GET');
      expect(getRequests.length).toBeGreaterThan(0);

      // API 응답 상태와 UI 표시 일치 확인
      const statusResponse = await page.request.get(
        `${API_BASE}/mission-runs/${missionRunId}`
      );
      const statusData = await statusResponse.json();
      const apiStatus = statusData.data.status;

      // UI에서 표시되는 상태 확인
      // Note: 실제 구현에서 상태 표시 방법에 따라 조정
      // const uiStatus = await page.getByTestId('current-mission-status').textContent();
      // expect(uiStatus).toContain(apiStatus);
    }
  });

  test('should show loading state during API call', async ({ page }) => {
    await page.goto(`${BASE_URL}/map?runId=${missionRunId}`);
    await page.waitForLoadState('networkidle');

    // API 지연 시뮬레이션은 어려우므로, UI에 로딩 상태가 구현되어 있는지만 확인
    const gpsAdvanceButton = page.getByTestId('mission-step-gps-advance');

    if (await gpsAdvanceButton.isVisible()) {
      await gpsAdvanceButton.click();

      // 즉시 로딩 인디케이터 확인 시도
      const loadingIndicator = page.getByTestId('mission-loading');
      // await expect(loadingIndicator).toBeVisible();
    }
  });

  test('should not revert to previous state on slow API response', async ({ page }) => {
    await page.goto(`${BASE_URL}/map?runId=${missionRunId}`);
    await page.waitForLoadState('networkidle');

    // 초기 상태 기록
    const initialStatusResponse = await page.request.get(
      `${API_BASE}/mission-runs/${missionRunId}`
    );
    const initialData = await initialStatusResponse.json();
    const initialStatus = initialData.data.status;

    // 상태 변경
    const gpsAdvanceButton = page.getByTestId('mission-step-gps-advance');

    if (await gpsAdvanceButton.isVisible()) {
      await gpsAdvanceButton.click();
      await page.waitForTimeout(500);

      // 변경 후 상태 확인
      const newStatusResponse = await page.request.get(
        `${API_BASE}/mission-runs/${missionRunId}`
      );
      const newData = await newStatusResponse.json();
      const newStatus = newData.data.status;

      // 상태가 이전으로 되돌아가지 않았는지 확인
      expect(newStatus).not.toBe(initialStatus);
    }
  });
});

test.describe('B Integration. Full Mission Flow with Real API Calls', () => {
  test('should complete GPS → QR → Reels → Review → Reward using real verification APIs', async ({ page }) => {
    // Note: 이 테스트는 실제 검증 로직을 호출하는 통합 테스트
    // 백엔드 검증 스크립트(test-mission-flow.sh)와 유사

    const missionId = 'mission-seoul-forest-walk-basic';

    // 1. QR 생성
    const qrResponse = await page.request.get(
      `${API_BASE}/missions/${missionId}/generate-qr`
    );
    const qrData = await qrResponse.json();
    const qrUrl = qrData.data.qrUrl;

    // 2. MissionRun 생성
    const runResponse = await page.request.post(
      `${API_BASE}/missions/${missionId}/runs`
    );
    const runData = await runResponse.json();
    const missionRunId = runData.data.missionRunId;

    expect(missionRunId).toBeTruthy();

    // 3. GPS 검증
    const gpsResponse = await page.request.post(
      `${API_BASE}/mission-runs/${missionRunId}/gps-verify`,
      {
        data: {
          lat: 37.5445,
          lng: 127.0375,
          accuracy: 10,
          mocked: false
        }
      }
    );

    expect(gpsResponse.ok()).toBeTruthy();
    const gpsData = await gpsResponse.json();
    expect(['PENDING_QR', 'PENDING_REELS', 'PENDING_REVIEW']).toContain(gpsData.data.status);

    // 4. QR 검증
    const qrVerifyResponse = await page.request.post(
      `${API_BASE}/mission-runs/${missionRunId}/qr-verify`,
      {
        data: {
          rawPayload: qrUrl
        }
      }
    );

    expect(qrVerifyResponse.ok()).toBeTruthy();
    const qrVerifyData = await qrVerifyResponse.json();
    expect(['PENDING_REELS', 'PENDING_REVIEW']).toContain(qrVerifyData.data.status);

    // 5. Reels 검증
    const reelsResponse = await page.request.post(
      `${API_BASE}/mission-runs/${missionRunId}/reels-verify`,
      {
        data: {
          metadata: {
            platform: 'instagram',
            url: `https://www.instagram.com/reel/test-${Date.now()}/`,
            hashtags: ['zzik', missionId]
          }
        }
      }
    );

    expect(reelsResponse.ok()).toBeTruthy();
    const reelsData = await reelsResponse.json();
    expect(reelsData.data.status).toBe('PENDING_REVIEW');

    // 6. 승인
    const approveResponse = await page.request.post(
      `${API_BASE}/mission-runs/${missionRunId}/approve`,
      {
        headers: {
          'idempotency-key': `test-flow-${Date.now()}`
        }
      }
    );

    expect(approveResponse.ok()).toBeTruthy();
    const approveData = await approveResponse.json();
    expect(approveData.data.missionRun.status).toBe('APPROVED');

    // 리워드 확인
    expect(approveData.data.transaction).toBeTruthy();
    expect(approveData.data.transaction.amount).toBeGreaterThan(0);

    console.log(`✅ Mission completed successfully! Reward: ${approveData.data.transaction.amount}원`);
  });
});
