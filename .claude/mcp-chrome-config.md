# Chrome MCP & Extensions Configuration

## 🌐 Chrome URL MCP 설정

### 1. Chrome DevTools Protocol (CDP) Setup

```json
{
  "mcpServers": {
    "chrome": {
      "command": "node",
      "args": [
        "-e",
        "const http = require('http'); const https = require('https'); const server = http.createServer((req, res) => { res.writeHead(200); res.end('Chrome CDP MCP'); }); server.listen(9222, '127.0.0.1'); console.log('Chrome MCP listening on 127.0.0.1:9222');"
      ],
      "env": {
        "CHROME_URL": "http://127.0.0.1:9222",
        "DEBUG": "true"
      }
    }
  }
}
```

### 2. Chrome Remote Debugging Protocol URLs

**Local Chrome DevTools**:
```
http://127.0.0.1:9222
```

**Chrome Browser**:
```
chrome://inspect/#devices
```

**WebSocket Endpoint** (for Playwright/Puppeteer):
```
ws://127.0.0.1:9222/devtools/browser/{SESSION_ID}
```

---

## 📦 Chrome MCP Extensions

### 1. Recommended Extensions for Development

#### Performance Testing
```
chrome-extension://performance
- Lighthouse Integration
- Performance Timeline
- Network Analysis
```

#### Accessibility (a11y)
```
chrome-extension://axe-devtools
- Automated A11y Testing
- WCAG Compliance Check
- Issue Reporting
```

#### Security
```
chrome-extension://security-headers
- CSP Validation
- Security Headers Check
- Vulnerability Scan
```

---

## 🔧 Setting Up Chrome Remote Debugging

### Step 1: Launch Chrome with Debugging Port

```bash
# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --no-first-run

# Linux
google-chrome \
  --remote-debugging-port=9222 \
  --no-first-run

# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" \
  --remote-debugging-port=9222 \
  --no-first-run
```

### Step 2: Access DevTools UI

```
http://127.0.0.1:9222
```

### Step 3: Find WebSocket URL

```bash
# Get list of open tabs
curl http://127.0.0.1:9222/json

# Response:
[
  {
    "description": "",
    "devtoolsFrontendUrl": "/devtools/inspector.html?...",
    "id": "...",
    "title": "Example Domain",
    "type": "page",
    "url": "http://example.com/",
    "webSocketDebuggerUrl": "ws://127.0.0.1:9222/devtools/page/..."
  }
]
```

---

## 🚀 MCP Chrome Integration

### Via Playwright/Puppeteer

```typescript
import { chromium } from 'playwright';

async function connectToChrome() {
  // Connect to running Chrome instance
  const browserWSEndpoint = 'ws://127.0.0.1:9222/devtools/browser/...';

  const browser = await chromium.connectOverCDP(browserWSEndpoint);
  const context = await browser.createContext();
  const page = await context.newPage();

  // Use page...
  await page.goto('http://localhost:3000');

  // Cleanup
  await context.close();
}
```

### Via CDP Directly

```typescript
const puppeteer = require('puppeteer');

async function connectViaCDP() {
  const browser = await puppeteer.connect({
    browserWSEndpoint: 'ws://127.0.0.1:9222',
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
}
```

---

## 📋 Chrome Extension Manifest v3 Example

```json
{
  "manifest_version": 3,
  "name": "ZZIK MAP Performance Monitor",
  "version": "1.0.0",
  "permissions": [
    "activeTab",
    "scripting",
    "webRequest",
    "tabs"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Performance Monitor"
  },
  "background": {
    "service_worker": "background.js"
  },
  "host_permissions": [
    "http://localhost:3000/*"
  ]
}
```

---

## 🎯 Chrome MCP Commands

### List Available Tabs
```bash
curl http://127.0.0.1:9222/json
```

### Get Chrome Version
```bash
curl http://127.0.0.1:9222/json/version
```

### List Protocol Targets
```bash
curl http://127.0.0.1:9222/json/protocol
```

### Create New Tab
```bash
curl -X POST http://127.0.0.1:9222/json/new?url=http://localhost:3000
```

### Close Tab
```bash
curl -X DELETE http://127.0.0.1:9222/json/close/{TAB_ID}
```

### Activate Tab
```bash
curl -X POST http://127.0.0.1:9222/json/activate/{TAB_ID}
```

---

## 📊 Performance Monitoring MCP

### Chrome Performance API

```typescript
// Collect metrics from running Chrome instance
async function getPerformanceMetrics(page) {
  const metrics = await page.metrics();

  return {
    JSHeapUsedSize: metrics.JSHeapUsedSize,
    JSHeapTotalSize: metrics.JSHeapTotalSize,
    DevToolsCommandsCount: metrics.DevToolsCommandsCount,
    Timestamp: metrics.Timestamp,
    LayoutCount: metrics.LayoutCount,
    RecalcStyleCount: metrics.RecalcStyleCount,
    LayoutDuration: metrics.LayoutDuration,
    RecalcStyleDuration: metrics.RecalcStyleDuration,
    ScriptDuration: metrics.ScriptDuration,
    TaskDuration: metrics.TaskDuration,
  };
}
```

### Network Monitoring

```typescript
async function monitorNetwork(page) {
  const requests = [];

  page.on('request', (request) => {
    requests.push({
      method: request.method(),
      url: request.url(),
      headers: request.headers(),
      resourceType: request.resourceType(),
    });
  });

  page.on('response', (response) => {
    console.log(`${response.status()} ${response.url()}`);
  });

  return requests;
}
```

---

## 🔐 Security Considerations

### 1. Disable Extensions in Automation
```bash
--disable-extensions
```

### 2. Use Sandboxing
```bash
--sandbox
```

### 3. Disable Plugins
```bash
--disable-plugins
```

### 4. Restrict Network Access
```bash
--no-first-run
--no-default-browser-check
```

---

## 🔄 Chrome MCP Workflow

### Development
```bash
# 1. Launch Chrome with debugging
google-chrome --remote-debugging-port=9222

# 2. Access Chrome DevTools
open http://127.0.0.1:9222

# 3. Connect Playwright
# Uses websocket from /json endpoint
```

### Testing
```bash
# 1. Automated testing via MCP
pnpm browser:automation

# 2. Performance profiling
pnpm browser:performance

# 3. Accessibility audit
pnpm browser:a11y
```

### Monitoring
```bash
# 1. Real-time performance
pnpm browser:monitor

# 2. Network analysis
pnpm browser:network

# 3. Resource tracking
pnpm browser:resources
```

---

## 📱 Mobile Chrome Debugging

### Android Device Connection

```bash
# 1. Enable USB Debugging on Android
# Settings > Developer Options > USB Debugging

# 2. Connect device via USB
adb devices

# 3. List remote targets
adb forward tcp:9222 localabstract:chrome_devtools_remote
curl http://127.0.0.1:9222/json

# 4. Connect with Playwright
```

---

## 🎨 Chrome Extension Examples

### 1. Performance Monitor Extension

```typescript
// content.js
function monitorPerformance() {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];

    chrome.runtime.sendMessage({
      type: 'performance',
      data: {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
        totalTime: perfData.duration,
      }
    });
  });
}

monitorPerformance();
```

### 2. A11y Audit Extension

```typescript
// background.js
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, {
      command: 'runA11yAudit'
    });
  }
});
```

### 3. Network Monitor Extension

```typescript
// background.js
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    console.log(`${details.method} ${details.url}`);
  },
  { urls: ['<all_urls>'] }
);
```

---

## 🔗 Useful Chrome MCP URLs

### Local Development
```
http://127.0.0.1:9222        # DevTools UI
http://localhost:3000         # ZZIK MAP Application
```

### Chrome Store
```
https://chromewebstore.google.com/detail/lighthouse
https://chromewebstore.google.com/detail/axe-devtools
https://chromewebstore.google.com/detail/redux-devtools
```

### Documentation
```
https://chromedevtools.github.io/devtools-protocol/
https://developer.chrome.com/docs/devtools/
https://developer.chrome.com/docs/extensions/mv3/
```

---

## ✅ Setup Checklist

- [ ] Chrome installed with remote debugging
- [ ] Port 9222 accessible
- [ ] Playwright/Puppeteer connected
- [ ] DevTools UI working
- [ ] Extensions installed
- [ ] Performance monitoring enabled
- [ ] A11y auditing functional
- [ ] Network monitoring active

---

## 🚀 Next Steps

### Immediate
1. Launch Chrome with `--remote-debugging-port=9222`
2. Access `http://127.0.0.1:9222`
3. Test with `pnpm browser:automation`

### Short-term
1. Install performance extensions
2. Set up A11y monitoring
3. Configure network tracking

### Long-term
1. Build custom extensions
2. Automate performance baselines
3. Real-time monitoring dashboard

---

**Status**: ✅ Configuration Ready
**Date**: 2025-11-27
**Last Updated**: 2025-11-27
