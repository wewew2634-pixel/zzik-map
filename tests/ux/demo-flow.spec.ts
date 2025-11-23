import { test, expect } from '@playwright/test'

test.describe('Demo Page Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to demo page
    await page.goto('http://localhost:3000/demo')
  })

  test('should load demo page without console errors', async ({ page }) => {
    const consoleErrors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Check for console errors
    expect(consoleErrors).toHaveLength(0)
  })

  test('should display App Store landing page', async ({ page }) => {
    // Check main elements
    await expect(page.getByText('ZZIK LIVE')).toBeVisible()
    await expect(page.getByText('단골지수 기반 로컬 이득 맵')).toBeVisible()
    await expect(page.getByText('4.8')).toBeVisible()
    await expect(page.getByText('2.3K 평가')).toBeVisible()

    // Check screenshot previews
    await expect(page.getByText('Map')).toBeVisible()
    await expect(page.getByText('Search')).toBeVisible()
    await expect(page.getByText('Saved')).toBeVisible()
    await expect(page.getByText('Profile')).toBeVisible()

    // Check download button
    const downloadBtn = page.getByRole('button', { name: '다운로드' })
    await expect(downloadBtn).toBeVisible()
    await expect(downloadBtn).toBeEnabled()
  })

  test('should navigate to onboarding when download button clicked', async ({ page }) => {
    // Click download button
    await page.getByRole('button', { name: '다운로드' }).click()

    // Wait for transition
    await page.waitForTimeout(500)

    // Check onboarding content
    await expect(page.getByText('단골지수로 가게를 고르세요')).toBeVisible()
    await expect(page.getByText('리뷰 대신 진짜 단골이 많은 집을 찾아드립니다')).toBeVisible()

    // Check progress indicators
    const progressIndicators = page.locator('.h-1.rounded-full')
    await expect(progressIndicators).toHaveCount(3)
  })

  test('should progress through all onboarding steps', async ({ page }) => {
    // Go to onboarding
    await page.getByRole('button', { name: '다운로드' }).click()
    await page.waitForTimeout(300)

    // Step 1: 단골지수
    await expect(page.getByText('단골지수로 가게를 고르세요')).toBeVisible()
    await expect(page.getByText('🎯')).toBeVisible()

    // Check buttons
    const nextBtn1 = page.getByRole('button', { name: '다음' })
    const skipBtn = page.getByRole('button', { name: '건너뛰기' })
    await expect(nextBtn1).toBeVisible()
    await expect(skipBtn).toBeVisible()

    // Click next
    await nextBtn1.click()
    await page.waitForTimeout(300)

    // Step 2: QR·GPS 검증
    await expect(page.getByText('QR·GPS로 자동 검증')).toBeVisible()
    await expect(page.getByText('📍')).toBeVisible()

    const nextBtn2 = page.getByRole('button', { name: '다음' })
    await nextBtn2.click()
    await page.waitForTimeout(300)

    // Step 3: 이득 추천
    await expect(page.getByText('이득 좋은 가게만 추천')).toBeVisible()
    await expect(page.getByText('💰')).toBeVisible()

    // Last step should have "시작하기" button
    const startBtn = page.getByRole('button', { name: '시작하기' })
    await expect(startBtn).toBeVisible()
  })

  test('should skip to app navigator when skip button clicked', async ({ page }) => {
    // Go to onboarding
    await page.getByRole('button', { name: '다운로드' }).click()
    await page.waitForTimeout(300)

    // Click skip
    await page.getByRole('button', { name: '건너뛰기' }).click()
    await page.waitForTimeout(300)

    // Should see app navigator
    await expect(page.getByText('📱 모든 페이지 둘러보기')).toBeVisible()
    await expect(page.getByText('각 카드를 클릭하여 실제 페이지로 이동하세요')).toBeVisible()
  })

  test('should display app navigator after completing onboarding', async ({ page }) => {
    // Complete onboarding flow
    await page.getByRole('button', { name: '다운로드' }).click()
    await page.waitForTimeout(300)

    await page.getByRole('button', { name: '다음' }).click()
    await page.waitForTimeout(300)

    await page.getByRole('button', { name: '다음' }).click()
    await page.waitForTimeout(300)

    await page.getByRole('button', { name: '시작하기' }).click()
    await page.waitForTimeout(300)

    // Check header
    await expect(page.getByRole('heading', { name: 'ZZIK LIVE' })).toBeVisible()
    await expect(page.getByText('데모 모드')).toBeVisible()

    // Check reset button
    const resetBtn = page.getByRole('button', { name: '처음으로' })
    await expect(resetBtn).toBeVisible()

    // Check all 4 navigation cards
    await expect(page.getByRole('heading', { name: 'Map', level: 3 })).toBeVisible()
    await expect(page.getByText('단골지수 기반 장소 탐색')).toBeVisible()

    await expect(page.getByRole('heading', { name: 'Search', level: 3 })).toBeVisible()
    await expect(page.getByText('실시간 검색 + 카테고리')).toBeVisible()

    await expect(page.getByRole('heading', { name: 'Saved', level: 3 })).toBeVisible()
    await expect(page.getByText('저장된 장소 관리')).toBeVisible()

    await expect(page.getByRole('heading', { name: 'Profile', level: 3 })).toBeVisible()
    await expect(page.getByText('내 통계 + 설정')).toBeVisible()

    // Check info card
    await expect(page.getByText('데모 정보')).toBeVisible()
    await expect(page.getByText('4개 페이지 완성')).toBeVisible()
    await expect(page.getByText('Linear-grade UX 97/100 달성')).toBeVisible()
  })

  test('should reset to landing when reset button clicked', async ({ page }) => {
    // Navigate to app navigator
    await page.getByRole('button', { name: '다운로드' }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: '건너뛰기' }).click()
    await page.waitForTimeout(300)

    // Click reset button
    await page.getByRole('button', { name: '처음으로' }).click()
    await page.waitForTimeout(300)

    // Should be back at landing
    await expect(page.getByRole('button', { name: '다운로드' })).toBeVisible()
    await expect(page.getByText('4.8')).toBeVisible()
  })

  test('should have working keyboard navigation', async ({ page }) => {
    // Focus download button
    await page.keyboard.press('Tab')

    const downloadBtn = page.getByRole('button', { name: '다운로드' })
    await expect(downloadBtn).toBeFocused()

    // Press Enter to activate
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)

    // Should navigate to onboarding
    await expect(page.getByText('단골지수로 가게를 고르세요')).toBeVisible()
  })

  test('should have ARIA attributes for accessibility', async ({ page }) => {
    // Go to app navigator
    await page.getByRole('button', { name: '다운로드' }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: '건너뛰기' }).click()
    await page.waitForTimeout(300)

    // Check buttons have proper roles
    const resetBtn = page.getByRole('button', { name: '처음으로' })
    await expect(resetBtn).toHaveAttribute('type', 'button')
  })

  test('should display all animations without errors', async ({ page }) => {
    const consoleErrors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Test landing page animations
    await page.waitForSelector('.animate-zzik-pulse-glow')
    await page.waitForSelector('.animate-zzik-fade-in')
    await page.waitForSelector('.animate-zzik-slide-up')

    // Navigate through all stages
    await page.getByRole('button', { name: '다운로드' }).click()
    await page.waitForTimeout(500)

    await page.getByRole('button', { name: '다음' }).click()
    await page.waitForTimeout(500)

    await page.getByRole('button', { name: '다음' }).click()
    await page.waitForTimeout(500)

    await page.getByRole('button', { name: '시작하기' }).click()
    await page.waitForTimeout(500)

    // No console errors during animations
    expect(consoleErrors).toHaveLength(0)
  })
})

test.describe('Individual Pages Navigation', () => {
  test('should navigate to Map page from demo', async ({ page }) => {
    await page.goto('http://localhost:3000/demo')

    // Go to app navigator
    await page.getByRole('button', { name: '다운로드' }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: '건너뛰기' }).click()
    await page.waitForTimeout(300)

    // Click Map card - need to find the specific clickable card
    // The Map card contains the text "단골지수 기반 장소 탐색"
    await page.locator('text=단골지수 기반 장소 탐색').locator('..').locator('..').locator('..').click()

    // Wait for navigation
    await page.waitForURL('**/map')

    // Verify Map page loaded
    await expect(page).toHaveURL(/.*map/)
  })

  test('should load all 4 individual pages without errors', async ({ page }) => {
    const pages = [
      { url: 'http://localhost:3000/map', title: '필터 옵션' },
      { url: 'http://localhost:3000/search', title: '검색' },
      { url: 'http://localhost:3000/saved', title: '저장된 장소' },
      { url: 'http://localhost:3000/profile', title: '단골 탐험가' },
    ]

    for (const pageInfo of pages) {
      const consoleErrors: string[] = []

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      await page.goto(pageInfo.url, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(1000)

      // Should load without errors (filter out React dev warnings)
      expect(consoleErrors.filter(e => !e.includes('React') && !e.includes('Warning')).length).toBe(0)
    }
  })
})
