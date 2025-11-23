#!/usr/bin/env bash
set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

INTERVAL="${1:-15}"
TEST_FILE="${2:-tests/ux/map-basic.spec.ts}"
PORT=9323

echo -e "${BLUE}🎭 ZZIK LIVE v4 - Live Test Monitor${NC}"
echo "========================================================="
echo ""
echo -e "${YELLOW}📊 Settings:${NC}"
echo "  • Test file: ${TEST_FILE}"
echo "  • Refresh interval: ${INTERVAL} seconds"
echo "  • Report URL: http://localhost:${PORT}"
echo ""

# Check if dev server is running
if ! curl -fsS "http://localhost:3000" >/dev/null 2>&1; then
  echo -e "${RED}❌ Dev server not running!${NC}"
  echo "Please run: pnpm dev"
  exit 1
fi

# Create live report HTML
cat > playwright-report/live.html <<'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZZIK Live Test Monitor</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a0a;
      color: #e0e0e0;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 20px;
      text-align: center;
    }
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
      color: white;
    }
    .status {
      background: #1a1a1a;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #667eea;
    }
    .status h2 {
      font-size: 18px;
      margin-bottom: 10px;
      color: #667eea;
    }
    .counter {
      font-size: 48px;
      font-weight: bold;
      color: #667eea;
      text-align: center;
      margin: 20px 0;
    }
    .timer {
      text-align: center;
      font-size: 16px;
      color: #888;
      margin-bottom: 20px;
    }
    iframe {
      width: 100%;
      height: calc(100vh - 400px);
      border: none;
      border-radius: 8px;
      background: white;
    }
    .loading {
      text-align: center;
      padding: 40px;
      color: #888;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .pulse {
      animation: pulse 2s infinite;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎭 ZZIK Live Test Monitor</h1>
    <p>Real-time Playwright test execution</p>
  </div>

  <div class="status">
    <h2>📊 Test Status</h2>
    <div class="counter" id="runCounter">Run #<span id="count">0</span></div>
    <div class="timer">Next refresh in <span id="timer">INTERVAL</span> seconds</div>
    <div class="loading pulse">⏳ Running tests...</div>
  </div>

  <iframe src="index.html" id="reportFrame"></iframe>

  <script>
    const INTERVAL = INTERVAL_PLACEHOLDER;
    let countdown = INTERVAL;
    let runCount = 0;

    function updateTimer() {
      document.getElementById('timer').textContent = countdown;
      countdown--;

      if (countdown < 0) {
        countdown = INTERVAL;
        runCount++;
        document.getElementById('count').textContent = runCount;

        // Reload iframe
        const iframe = document.getElementById('reportFrame');
        iframe.src = iframe.src.split('?')[0] + '?t=' + Date.now();
      }
    }

    setInterval(updateTimer, 1000);
    updateTimer();
  </script>
</body>
</html>
EOF

# Replace placeholders
sed -i "s/INTERVAL_PLACEHOLDER/${INTERVAL}/g" playwright-report/live.html
sed -i "s/INTERVAL/${INTERVAL}/g" playwright-report/live.html

# Start HTTP server for reports in background
echo -e "${BLUE}🌐 Starting report server on http://localhost:${PORT}${NC}"
cd playwright-report && python3 -m http.server ${PORT} >/dev/null 2>&1 &
SERVER_PID=$!
cd ..

echo -e "${GREEN}✅ Report server started (PID: ${SERVER_PID})${NC}"
echo ""
echo -e "${YELLOW}🚀 Open in browser:${NC}"
echo -e "   ${BLUE}http://localhost:${PORT}/live.html${NC}"
echo ""
echo -e "${BLUE}🔄 Starting auto-refresh test loop...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

# Cleanup function
cleanup() {
  echo ""
  echo -e "${YELLOW}🛑 Stopping...${NC}"
  kill $SERVER_PID 2>/dev/null || true
  echo -e "${GREEN}✅ Stopped${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

COUNTER=1

while true; do
  TIMESTAMP=$(date '+%H:%M:%S')

  echo "========================================================="
  echo -e "${BLUE}🔄 Run #${COUNTER} - ${TIMESTAMP}${NC}"
  echo "========================================================="

  # Run tests and generate HTML report
  npx playwright test "${TEST_FILE}" \
    --reporter=html \
    --workers=1 \
    --project=chromium-desktop 2>&1 | grep -E '(passed|failed|✓|✘|Running)' || true

  echo ""
  echo -e "${GREEN}✓ Run #${COUNTER} completed - Report updated${NC}"
  echo -e "${YELLOW}⏳ Waiting ${INTERVAL} seconds...${NC}"
  echo ""

  COUNTER=$((COUNTER + 1))
  sleep "${INTERVAL}"
done
