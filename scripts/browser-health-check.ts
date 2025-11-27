/**
 * ZZIK MAP - Browser Health Check Script
 * Captures screenshots and console errors for UX/UI improvement
 */

import { chromium, ConsoleMessage } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUTPUT_DIR = '/tmp/zzik-browser-check';

interface PageCheck {
  url: string;
  name: string;
  screenshot: string;
  consoleErrors: string[];
  consoleWarnings: string[];
  networkErrors: string[];
  loadTime: number;
  issues: string[];
}

async function checkPage(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  pagePath: string,
  pageName: string
): Promise<PageCheck> {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const networkErrors: string[] = [];
  const issues: string[] = [];

  // Listen to console messages
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(msg.text());
    }
  });

  // Listen to network failures
  page.on('requestfailed', (request) => {
    networkErrors.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
  });

  const url = `${BASE_URL}${pagePath}`;
  const startTime = Date.now();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    issues.push(`Page load timeout or error: ${e}`);
  }

  const loadTime = Date.now() - startTime;

  // Wait for animations to settle
  await page.waitForTimeout(1500);

  // Take screenshot
  const screenshotPath = path.join(OUTPUT_DIR, `${pageName}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  // Check for common UI issues

  // 1. Check for hydration errors
  const hydrationError = await page.locator('text=Hydration').count();
  if (hydrationError > 0) {
    issues.push('Possible hydration error detected');
  }

  // 2. Check for missing images
  const brokenImages = await page.evaluate(() => {
    const images = document.querySelectorAll('img');
    return Array.from(images).filter(img => !img.complete || img.naturalWidth === 0).length;
  });
  if (brokenImages > 0) {
    issues.push(`${brokenImages} broken image(s) detected`);
  }

  // 3. Check for overlapping elements (basic check)
  const overlappingCheck = await page.evaluate(() => {
    // Check if any buttons or links overlap
    const buttons = document.querySelectorAll('button, a');
    let overlaps = 0;
    buttons.forEach((btn, i) => {
      const rect1 = btn.getBoundingClientRect();
      buttons.forEach((other, j) => {
        if (i >= j) return;
        const rect2 = other.getBoundingClientRect();
        if (
          rect1.left < rect2.right &&
          rect1.right > rect2.left &&
          rect1.top < rect2.bottom &&
          rect1.bottom > rect2.top
        ) {
          overlaps++;
        }
      });
    });
    return overlaps;
  });
  if (overlappingCheck > 0) {
    issues.push(`${overlappingCheck} potentially overlapping clickable elements`);
  }

  // 4. Check for accessibility issues
  const missingAltText = await page.evaluate(() => {
    const images = document.querySelectorAll('img:not([alt])');
    return images.length;
  });
  if (missingAltText > 0) {
    issues.push(`${missingAltText} image(s) missing alt text`);
  }

  // 5. Check for low contrast (basic)
  const lowContrastText = await page.evaluate(() => {
    const elements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button');
    let lowContrast = 0;
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const color = style.color;
      const opacity = parseFloat(style.opacity);
      // Very basic check - if opacity is very low
      if (opacity < 0.4) lowContrast++;
    });
    return lowContrast;
  });
  if (lowContrastText > 0) {
    issues.push(`${lowContrastText} element(s) with potentially low contrast`);
  }

  // 6. Check page load time
  if (loadTime > 3000) {
    issues.push(`Slow page load: ${loadTime}ms (target: <3000ms)`);
  }

  await context.close();

  return {
    url,
    name: pageName,
    screenshot: screenshotPath,
    consoleErrors,
    consoleWarnings,
    networkErrors,
    loadTime,
    issues,
  };
}

async function main() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('🔍 ZZIK MAP Browser Health Check\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  const browser = await chromium.launch({ headless: true });

  const pages = [
    { path: '/', name: 'home' },
    { path: '/journey', name: 'journey' },
    { path: '/explore', name: 'explore' },
  ];

  const results: PageCheck[] = [];

  for (const { path: pagePath, name } of pages) {
    console.log(`Checking ${name} (${pagePath})...`);
    const result = await checkPage(browser, pagePath, name);
    results.push(result);

    console.log(`  ✓ Screenshot: ${result.screenshot}`);
    console.log(`  ⏱ Load time: ${result.loadTime}ms`);

    if (result.consoleErrors.length > 0) {
      console.log(`  ❌ Console errors: ${result.consoleErrors.length}`);
      result.consoleErrors.forEach(err => console.log(`     - ${err.substring(0, 100)}`));
    }

    if (result.consoleWarnings.length > 0) {
      console.log(`  ⚠️  Console warnings: ${result.consoleWarnings.length}`);
    }

    if (result.networkErrors.length > 0) {
      console.log(`  🌐 Network errors: ${result.networkErrors.length}`);
      result.networkErrors.forEach(err => console.log(`     - ${err}`));
    }

    if (result.issues.length > 0) {
      console.log(`  🔸 Issues: ${result.issues.length}`);
      result.issues.forEach(issue => console.log(`     - ${issue}`));
    }

    console.log('');
  }

  await browser.close();

  // Generate summary report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    pages: results,
    summary: {
      totalPages: results.length,
      totalConsoleErrors: results.reduce((sum, r) => sum + r.consoleErrors.length, 0),
      totalConsoleWarnings: results.reduce((sum, r) => sum + r.consoleWarnings.length, 0),
      totalNetworkErrors: results.reduce((sum, r) => sum + r.networkErrors.length, 0),
      totalIssues: results.reduce((sum, r) => sum + r.issues.length, 0),
      averageLoadTime: Math.round(results.reduce((sum, r) => sum + r.loadTime, 0) / results.length),
    },
  };

  const reportPath = path.join(OUTPUT_DIR, 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📊 Report saved: ${reportPath}`);

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`Pages checked: ${report.summary.totalPages}`);
  console.log(`Console errors: ${report.summary.totalConsoleErrors}`);
  console.log(`Console warnings: ${report.summary.totalConsoleWarnings}`);
  console.log(`Network errors: ${report.summary.totalNetworkErrors}`);
  console.log(`UI issues: ${report.summary.totalIssues}`);
  console.log(`Avg load time: ${report.summary.averageLoadTime}ms`);

  // Exit with error code if issues found
  const hasErrors = report.summary.totalConsoleErrors > 0 || report.summary.totalNetworkErrors > 0;
  process.exit(hasErrors ? 1 : 0);
}

main().catch(console.error);
