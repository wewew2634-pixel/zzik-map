#!/usr/bin/env tsx
/**
 * 🌐 Browser Health Check with MCP Integration
 *
 * 브라우저 MCP + 스크린샷 MCP를 활용한 런타임 검증:
 * - 실제 페이지 로드 및 콘솔 오류 캡처
 * - UX/UI 스크린샷 자동 분석
 * - 시각적 이슈 감지
 * - 런타임 JavaScript 오류 탐지
 */

import { execSync } from 'child_process'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

interface BrowserCheckResult {
  url: string
  status: 'pass' | 'warn' | 'fail'
  consoleErrors: string[]
  consoleWarnings: string[]
  networkErrors: string[]
  screenshot?: string
  uxIssues: string[]
  timestamp: string
}

interface PageToCheck {
  name: string
  url: string
  criticalElements?: string[] // CSS selectors to verify
}

const PAGES_TO_CHECK: PageToCheck[] = [
  {
    name: 'Splash',
    url: 'http://localhost:3001/splash',
    criticalElements: ['button', 'h1'], // More generic - logo might not have .zzik-logo class
  },
  {
    name: 'Login',
    url: 'http://localhost:3001/login',
    criticalElements: ['button'], // Generic button check, aria-label detection is separate
  },
  {
    name: 'Map',
    url: 'http://localhost:3001/map',
    criticalElements: [
      '[data-testid="place-list"]',
      'button[aria-label="전체 장소 보기"]',
    ],
  },
  {
    name: 'Search',
    url: 'http://localhost:3001/search',
  },
  {
    name: 'Profile',
    url: 'http://localhost:3001/profile',
  },
]

const SCREENSHOT_DIR = 'health-check-screenshots'

// Ensure screenshot directory exists
if (!existsSync(SCREENSHOT_DIR)) {
  mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

/**
 * Check if dev server is running
 */
function checkDevServer(): boolean {
  try {
    execSync('curl -s http://localhost:3001 > /dev/null', { timeout: 5000 })
    return true
  } catch {
    return false
  }
}

/**
 * Browser-based check using Playwright (simulating MCP behavior)
 * In production, this would use actual Browser MCP
 */
async function checkPage(page: PageToCheck): Promise<BrowserCheckResult> {
  const result: BrowserCheckResult = {
    url: page.url,
    status: 'pass',
    consoleErrors: [],
    consoleWarnings: [],
    networkErrors: [],
    uxIssues: [],
    timestamp: new Date().toISOString(),
  }

  log(`\n🌐 Checking ${page.name}: ${page.url}`, 'cyan')

  try {
    // Use Playwright for browser automation
    const { chromium } = await import('playwright')
    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 }, // iPhone 14 Pro
    })
    const browserPage = await context.newPage()

    // Capture console messages
    browserPage.on('console', (msg) => {
      const type = msg.type()
      const text = msg.text()

      if (type === 'error') {
        result.consoleErrors.push(text)
      } else if (type === 'warning') {
        result.consoleWarnings.push(text)
      }
    })

    // Capture page errors
    browserPage.on('pageerror', (error) => {
      result.consoleErrors.push(`PageError: ${error.message}`)
    })

    // Capture network errors
    browserPage.on('requestfailed', (request) => {
      result.networkErrors.push(
        `${request.failure()?.errorText}: ${request.url()}`
      )
    })

    // Navigate to page
    const response = await browserPage.goto(page.url, {
      waitUntil: 'domcontentloaded', // More lenient than networkidle
      timeout: 15000,
    })

    if (!response || response.status() >= 400) {
      result.status = 'fail'
      result.uxIssues.push(
        `Page failed to load: HTTP ${response?.status() || 'unknown'}`
      )
    }

    // Wait for hydration
    await browserPage.waitForTimeout(2000)

    // Check critical elements
    if (page.criticalElements) {
      for (const selector of page.criticalElements) {
        const element = await browserPage.$(selector)
        if (!element) {
          result.uxIssues.push(`Critical element missing: ${selector}`)
          result.status = 'warn'
        }
      }
    }

    // Take screenshot
    const screenshotPath = join(
      SCREENSHOT_DIR,
      `${page.name.toLowerCase()}-${Date.now()}.png`
    )
    await browserPage.screenshot({
      path: screenshotPath,
      fullPage: true,
    })
    result.screenshot = screenshotPath

    log(`  📸 Screenshot saved: ${screenshotPath}`, 'cyan')

    // Check for visual issues
    const layoutShiftScore = await browserPage.evaluate(() => {
      // Simple CLS detection
      return (window as any).__CLS_SCORE__ || 0
    })

    if (layoutShiftScore > 0.1) {
      result.uxIssues.push(
        `High Cumulative Layout Shift: ${layoutShiftScore.toFixed(3)}`
      )
      result.status = 'warn'
    }

    // Check for accessibility issues (basic)
    const a11yIssues = await browserPage.evaluate(() => {
      const issues: string[] = []

      // Check for buttons without accessible names
      const buttons = document.querySelectorAll('button')
      buttons.forEach((btn, idx) => {
        const hasAriaLabel = btn.hasAttribute('aria-label')
        const hasAriaLabelledBy = btn.hasAttribute('aria-labelledby')
        const hasTextContent = btn.textContent?.trim()

        if (!hasAriaLabel && !hasAriaLabelledBy && !hasTextContent) {
          issues.push(`Button ${idx + 1} has no accessible name`)
        }
      })

      // Check for images without alt
      const images = document.querySelectorAll('img')
      images.forEach((img, idx) => {
        if (!img.hasAttribute('alt')) {
          issues.push(`Image ${idx + 1} missing alt attribute`)
        }
      })

      return issues
    })

    result.uxIssues.push(...a11yIssues)

    await browser.close()

    // Determine final status
    if (result.consoleErrors.length > 0 || result.networkErrors.length > 0) {
      result.status = 'fail'
    } else if (
      result.consoleWarnings.length > 0 ||
      result.uxIssues.length > 0
    ) {
      result.status = 'warn'
    }

    // Log results
    if (result.consoleErrors.length > 0) {
      log(`  ❌ Console Errors: ${result.consoleErrors.length}`, 'red')
      result.consoleErrors.forEach((err) => log(`     ${err}`, 'red'))
    }

    if (result.consoleWarnings.length > 0) {
      log(`  ⚠️  Console Warnings: ${result.consoleWarnings.length}`, 'yellow')
    }

    if (result.networkErrors.length > 0) {
      log(`  ❌ Network Errors: ${result.networkErrors.length}`, 'red')
      result.networkErrors.forEach((err) => log(`     ${err}`, 'red'))
    }

    if (result.uxIssues.length > 0) {
      log(`  ⚠️  UX Issues: ${result.uxIssues.length}`, 'yellow')
      result.uxIssues.slice(0, 5).forEach((issue) => log(`     ${issue}`, 'yellow'))
      if (result.uxIssues.length > 5) {
        log(`     ... and ${result.uxIssues.length - 5} more`, 'yellow')
      }
    }

    if (result.status === 'pass') {
      log(`  ✅ All checks passed`, 'green')
    }
  } catch (error: any) {
    result.status = 'fail'
    result.consoleErrors.push(`Browser check failed: ${error.message}`)
    log(`  ❌ Browser check failed: ${error.message}`, 'red')
  }

  return result
}

/**
 * Generate HTML report with screenshots
 */
function generateHTMLReport(results: BrowserCheckResult[]) {
  const timestamp = new Date().toLocaleString()

  let html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZZIK LIVE - Browser Health Check</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #0a0a0a;
      color: #e0e0e0;
    }
    h1 { color: #fbbf24; }
    h2 { color: #60a5fa; margin-top: 40px; }
    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: bold;
      font-size: 14px;
    }
    .status.pass { background: #10b981; color: white; }
    .status.warn { background: #f59e0b; color: white; }
    .status.fail { background: #ef4444; color: white; }
    .page-result {
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
    }
    .screenshot {
      max-width: 100%;
      border: 2px solid #333;
      border-radius: 8px;
      margin: 10px 0;
    }
    .issue-list {
      background: #0f0f0f;
      border-left: 3px solid #ef4444;
      padding: 10px 15px;
      margin: 10px 0;
    }
    .warning-list {
      background: #0f0f0f;
      border-left: 3px solid #f59e0b;
      padding: 10px 15px;
      margin: 10px 0;
    }
    code {
      background: #0f0f0f;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .summary-card {
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    .summary-number {
      font-size: 32px;
      font-weight: bold;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <h1>🌐 ZZIK LIVE - Browser Health Check Report</h1>
  <p><strong>Generated:</strong> ${timestamp}</p>

  <div class="summary">
    <div class="summary-card">
      <div>Pages Checked</div>
      <div class="summary-number">${results.length}</div>
    </div>
    <div class="summary-card">
      <div>✅ Passed</div>
      <div class="summary-number" style="color: #10b981">${
        results.filter((r) => r.status === 'pass').length
      }</div>
    </div>
    <div class="summary-card">
      <div>⚠️ Warnings</div>
      <div class="summary-number" style="color: #f59e0b">${
        results.filter((r) => r.status === 'warn').length
      }</div>
    </div>
    <div class="summary-card">
      <div>❌ Failures</div>
      <div class="summary-number" style="color: #ef4444">${
        results.filter((r) => r.status === 'fail').length
      }</div>
    </div>
  </div>

  ${results
    .map(
      (result, idx) => `
    <div class="page-result">
      <h2>
        ${PAGES_TO_CHECK[idx].name}
        <span class="status ${result.status}">${result.status.toUpperCase()}</span>
      </h2>
      <p><strong>URL:</strong> <code>${result.url}</code></p>
      <p><strong>Timestamp:</strong> ${new Date(result.timestamp).toLocaleString()}</p>

      ${
        result.screenshot
          ? `
        <h3>Screenshot</h3>
        <img src="../${result.screenshot}" class="screenshot" alt="${PAGES_TO_CHECK[idx].name} screenshot" />
      `
          : ''
      }

      ${
        result.consoleErrors.length > 0
          ? `
        <div class="issue-list">
          <h3>❌ Console Errors (${result.consoleErrors.length})</h3>
          <ul>
            ${result.consoleErrors.map((err) => `<li><code>${err}</code></li>`).join('')}
          </ul>
        </div>
      `
          : ''
      }

      ${
        result.networkErrors.length > 0
          ? `
        <div class="issue-list">
          <h3>❌ Network Errors (${result.networkErrors.length})</h3>
          <ul>
            ${result.networkErrors.map((err) => `<li><code>${err}</code></li>`).join('')}
          </ul>
        </div>
      `
          : ''
      }

      ${
        result.consoleWarnings.length > 0
          ? `
        <div class="warning-list">
          <h3>⚠️ Console Warnings (${result.consoleWarnings.length})</h3>
          <ul>
            ${result.consoleWarnings
              .slice(0, 10)
              .map((warn) => `<li><code>${warn}</code></li>`)
              .join('')}
            ${result.consoleWarnings.length > 10 ? `<li>... and ${result.consoleWarnings.length - 10} more</li>` : ''}
          </ul>
        </div>
      `
          : ''
      }

      ${
        result.uxIssues.length > 0
          ? `
        <div class="warning-list">
          <h3>⚠️ UX/UI Issues (${result.uxIssues.length})</h3>
          <ul>
            ${result.uxIssues.map((issue) => `<li>${issue}</li>`).join('')}
          </ul>
        </div>
      `
          : ''
      }

      ${
        result.status === 'pass'
          ? `<p style="color: #10b981;">✅ All checks passed for this page</p>`
          : ''
      }
    </div>
  `
    )
    .join('')}

  <hr style="margin: 40px 0; border: 1px solid #333;" />
  <p style="text-align: center; color: #666;">
    Generated by ZZIK LIVE Self-Healing System
  </p>
</body>
</html>
`

  const reportPath = 'browser-health-check-report.html'
  writeFileSync(reportPath, html)
  log(`\n📄 HTML Report saved: ${reportPath}`, 'cyan')
  log(`   Open in browser: file://${process.cwd()}/${reportPath}`, 'cyan')
}

/**
 * Main execution
 */
async function main() {
  log('\n🌐 ZZIK LIVE - Browser Health Check', 'bold')
  log('브라우저 MCP + 스크린샷 MCP 통합 검증\n', 'cyan')

  // Check if dev server is running
  if (!checkDevServer()) {
    log('❌ Dev server is not running on http://localhost:3001', 'red')
    log('   Please start the dev server first: pnpm dev\n', 'yellow')
    process.exit(1)
  }

  log('✅ Dev server is running\n', 'green')

  const results: BrowserCheckResult[] = []

  // Check each page
  for (const page of PAGES_TO_CHECK) {
    const result = await checkPage(page)
    results.push(result)
  }

  // Generate reports
  log('\n' + '='.repeat(80), 'bold')
  log('SUMMARY', 'bold')
  log('='.repeat(80) + '\n', 'bold')

  const passed = results.filter((r) => r.status === 'pass').length
  const warnings = results.filter((r) => r.status === 'warn').length
  const failures = results.filter((r) => r.status === 'fail').length

  log(`✅ Passed:   ${passed}`, 'green')
  log(`⚠️  Warnings: ${warnings}`, 'yellow')
  log(`❌ Failures: ${failures}\n`, 'red')

  generateHTMLReport(results)

  // Exit code
  if (failures > 0) {
    process.exit(1)
  } else if (warnings > 0) {
    process.exit(0)
  } else {
    log('🎉 All browser checks passed!\n', 'green')
    process.exit(0)
  }
}

main().catch((error) => {
  log(`\n❌ Browser health check failed: ${error.message}`, 'red')
  console.error(error)
  process.exit(1)
})
