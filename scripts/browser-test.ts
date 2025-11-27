#!/usr/bin/env -S npx tsx

/**
 * Browser Automation Test Script
 * Tests basic browser automation with Puppeteer
 * Usage: pnpm exec tsx scripts/browser-test.ts
 */

import puppeteer from 'puppeteer';

interface ScreenshotResult {
  success: boolean;
  url: string;
  timestamp: string;
  filePath?: string;
  error?: string;
}

async function testBrowserAutomation(): Promise<void> {
  let browser = null;

  try {
    console.log('🌐 Starting Browser Automation Test...\n');

    // Launch browser
    console.log('📱 Launching Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    // Test URLs
    const testUrls = [
      'http://localhost:3000',
      'http://localhost:3000/explore',
      'http://localhost:3000/journey',
    ];

    const results: ScreenshotResult[] = [];

    // Test each URL
    for (const url of testUrls) {
      console.log(`\n📷 Testing: ${url}`);

      try {
        await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 30000,
        });

        // Get page metrics
        const metrics = await page.metrics();
        console.log(`   ✓ Loaded successfully`);
        console.log(`   - Heap Size: ${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)}MB`);
        console.log(`   - Title: ${await page.title()}`);

        // Get page content info
        const pageInfo = await page.evaluate(() => ({
          links: document.querySelectorAll('a').length,
          buttons: document.querySelectorAll('button').length,
          images: document.querySelectorAll('img').length,
          forms: document.querySelectorAll('form').length,
        }));

        console.log(`   - Links: ${pageInfo.links}`);
        console.log(`   - Buttons: ${pageInfo.buttons}`);
        console.log(`   - Images: ${pageInfo.images}`);
        console.log(`   - Forms: ${pageInfo.forms}`);

        results.push({
          success: true,
          url,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.log(`   ✗ Failed: ${error instanceof Error ? error.message : String(error)}`);
        results.push({
          success: false,
          url,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Test performance metrics
    console.log('\n⚡ Performance Metrics:');
    const perfMetrics = await page.evaluate(() => ({
      navigationStart: performance.timing.navigationStart,
      loadEventEnd: performance.timing.loadEventEnd,
      domContentLoaded: performance.timing.domContentLoaded,
      firstPaint: 0, // Will be calculated
    }));

    const pageLoadTime = perfMetrics.loadEventEnd - perfMetrics.navigationStart;
    console.log(`   - Page Load Time: ${pageLoadTime}ms`);

    // Test accessibility
    console.log('\n♿ Accessibility Check:');
    const a11yInfo = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const imagesWithoutAlt = Array.from(images).filter((img) => !img.hasAttribute('alt'));
      const buttons = document.querySelectorAll('button');
      const buttonsWithoutText = Array.from(buttons).filter(
        (btn) => !btn.textContent?.trim() && !btn.getAttribute('aria-label')
      );

      return {
        imagesWithoutAlt: imagesWithoutAlt.length,
        totalImages: images.length,
        buttonsWithoutLabel: buttonsWithoutText.length,
        totalButtons: buttons.length,
      };
    });

    console.log(`   - Images without alt text: ${a11yInfo.imagesWithoutAlt}/${a11yInfo.totalImages}`);
    console.log(`   - Buttons without labels: ${a11yInfo.buttonsWithoutLabel}/${a11yInfo.totalButtons}`);

    // Summary
    console.log('\n📊 Test Summary:');
    const successCount = results.filter((r) => r.success).length;
    console.log(`   ✓ Passed: ${successCount}/${results.length}`);

    if (successCount === results.length) {
      console.log('\n🎉 All browser automation tests passed!\n');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Check details above.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run tests
testBrowserAutomation().catch(console.error);
