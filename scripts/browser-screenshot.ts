#!/usr/bin/env -S npx tsx

/**
 * Browser Screenshot Automation
 * Captures screenshots of all pages for visual regression testing
 * Usage: pnpm exec tsx scripts/browser-screenshot.ts
 */

import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const SCREENSHOT_DIR = join(process.cwd(), '../.test/screenshots');
const BASE_URL = 'http://localhost:3000';

async function captureScreenshots(): Promise<void> {
  let browser = null;

  try {
    console.log('📸 Starting Screenshot Automation...\n');

    // Create screenshot directory
    await mkdir(SCREENSHOT_DIR, { recursive: true });

    // Launch browser
    console.log('📱 Launching Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Desktop viewport
    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    // Pages to capture
    const pages = [
      { path: '/', name: 'home' },
      { path: '/explore', name: 'explore' },
      { path: '/journey', name: 'journey' },
    ];

    // Viewports to test
    const viewports = [
      { name: 'mobile', width: 375, height: 812 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 },
    ];

    for (const pageConfig of pages) {
      console.log(`\n📷 Capturing: ${pageConfig.path}`);

      const url = `${BASE_URL}${pageConfig.path}`;

      for (const viewport of viewports) {
        try {
          // Set viewport
          await page.setViewport({
            width: viewport.width,
            height: viewport.height,
          });

          // Navigate
          await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000,
          });

          // Wait for animations to complete
          await page.waitForTimeout(500);

          // Capture screenshot
          const screenshotPath = join(
            SCREENSHOT_DIR,
            `${pageConfig.name}-${viewport.name}-${new Date().getTime()}.png`
          );

          await page.screenshot({
            path: screenshotPath,
            fullPage: true,
          });

          console.log(`   ✓ ${viewport.name}: ${screenshotPath}`);
        } catch (error) {
          console.log(
            `   ✗ ${viewport.name}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }

    console.log(`\n✅ Screenshots saved to: ${SCREENSHOT_DIR}\n`);
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
captureScreenshots().catch(console.error);
