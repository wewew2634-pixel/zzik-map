import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  // Collect console logs
  const consoleLogs = [];
  const errorLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => errorLogs.push(`[ERROR] ${err.message}\n${err.stack}`));

  // Splash page
  console.log('📸 Taking splash page screenshot...');
  await page.goto('http://localhost:3000/splash');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/splash.png', fullPage: true });
  console.log('✓ Saved to /tmp/splash.png');

  // Login page
  console.log('\n📸 Taking login page screenshot...');
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/login.png', fullPage: true });
  console.log('✓ Saved to /tmp/login.png');

  // Print console logs
  if (consoleLogs.length > 0) {
    console.log('\n🔍 Browser Console Logs:');
    consoleLogs.forEach(log => console.log(log));
  }

  if (errorLogs.length > 0) {
    console.log('\n❌ Browser Errors:');
    errorLogs.forEach(log => console.log(log));
  }

  await browser.close();
})();
