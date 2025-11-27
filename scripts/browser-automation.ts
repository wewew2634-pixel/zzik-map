#!/usr/bin/env -S npx tsx

/**
 * Browser Automation with Playwright
 * Performs visual tests, screenshots, and accessibility audits
 * Usage: pnpm exec tsx scripts/browser-automation.ts
 */

import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const SCREENSHOT_DIR = join(process.cwd(), '.test/screenshots');
const BASE_URL = 'http://localhost:3000';

interface PageTest {
  path: string;
  name: string;
  waitForSelector?: string;
}

const PAGES: PageTest[] = [
  { path: '/', name: 'home' },
  { path: '/explore', name: 'explore' },
  { path: '/journey', name: 'journey' },
];

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
];

async function runBrowserAutomation(): Promise<void> {
  let browser = null;

  try {
    console.log('🌐 Starting Browser Automation with Playwright...\n');

    // Create screenshot directory
    await mkdir(SCREENSHOT_DIR, { recursive: true });

    // Launch browser
    console.log('📱 Launching Chromium...');
    browser = await chromium.launch({
      headless: true,
      args: ['--disable-gpu'],
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // Test each page
    for (const pageConfig of PAGES) {
      console.log(`\n📄 Testing: ${pageConfig.path}`);
      const url = `${BASE_URL}${pageConfig.path}`;

      // Test each viewport
      for (const viewport of VIEWPORTS) {
        try {
          // Set viewport
          await context.close();
          const newContext = await browser.newContext({
            viewport: {
              width: viewport.width,
              height: viewport.height,
            },
          });
          const newPage = await newContext.newPage();

          // Navigate
          await newPage.goto(url, {
            waitUntil: 'networkidle',
            timeout: 30000,
          });

          // Wait for content to render
          await newPage.waitForLoadState('networkidle');
          await newPage.waitForTimeout(500);

          // Get page metrics
          const title = await newPage.title();
          const url_value = newPage.url();

          console.log(`   ✓ ${viewport.name}`);
          console.log(`     - Title: ${title}`);
          console.log(`     - URL: ${url_value}`);

          // Count elements
          const elementCount = await newPage.evaluate(() => ({
            links: document.querySelectorAll('a').length,
            buttons: document.querySelectorAll('button').length,
            images: document.querySelectorAll('img').length,
            inputs: document.querySelectorAll('input').length,
          }));

          console.log(
            `     - Elements: ${elementCount.links} links, ${elementCount.buttons} buttons, ${elementCount.images} images`
          );

          // Check accessibility issues
          const a11yIssues = await newPage.evaluate(() => {
            const issues = [];

            // Check images without alt text
            const imagesNoAlt = Array.from(document.querySelectorAll('img')).filter(
              (img) => !img.hasAttribute('alt')
            );
            if (imagesNoAlt.length > 0) {
              issues.push(`${imagesNoAlt.length} images without alt text`);
            }

            // Check buttons without text
            const buttonsNoText = Array.from(document.querySelectorAll('button')).filter(
              (btn) =>
                !btn.textContent?.trim() &&
                !btn.getAttribute('aria-label') &&
                !btn.getAttribute('title')
            );
            if (buttonsNoText.length > 0) {
              issues.push(`${buttonsNoText.length} buttons without accessible text`);
            }

            // Check form fields without labels
            const inputsNoLabel = Array.from(document.querySelectorAll('input')).filter(
              (input) => {
                const id = input.id;
                if (!id) return true;
                const label = document.querySelector(`label[for="${id}"]`);
                return !label && !input.getAttribute('aria-label');
              }
            );
            if (inputsNoLabel.length > 0) {
              issues.push(`${inputsNoLabel.length} form fields without labels`);
            }

            return issues;
          });

          if (a11yIssues.length > 0) {
            console.log(`     ⚠️  A11y Issues: ${a11yIssues.join(', ')}`);
          } else {
            console.log(`     ✓ No a11y issues detected`);
          }

          // Capture screenshot
          const timestamp = new Date().getTime();
          const screenshotPath = join(
            SCREENSHOT_DIR,
            `${pageConfig.name}-${viewport.name}-${timestamp}.png`
          );

          await newPage.screenshot({
            path: screenshotPath,
            fullPage: false,
          });

          console.log(`     📸 Screenshot: ${screenshotPath}`);

          await newContext.close();
        } catch (error) {
          console.log(
            `   ✗ ${viewport.name}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }

    // Performance metrics
    console.log('\n⚡ Performance Metrics:');
    const context2 = await browser.newContext();
    const perfPage = await context2.newPage();

    await perfPage.goto(`${BASE_URL}/`, {
      waitUntil: 'networkidle',
    });

    const perfMetrics = await perfPage.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
        loadEvent: nav.loadEventEnd - nav.loadEventStart,
        duration: nav.duration,
      };
    });

    console.log(`   - DOM Content Loaded: ${perfMetrics.domContentLoaded}ms`);
    console.log(`   - Load Event: ${perfMetrics.loadEvent}ms`);
    console.log(`   - Total Duration: ${perfMetrics.duration.toFixed(0)}ms`);

    await context2.close();

    console.log(`\n✅ Browser automation completed!\n`);
    console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}`);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run
runBrowserAutomation().catch(console.error);
