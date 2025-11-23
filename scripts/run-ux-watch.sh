#!/usr/bin/env bash
set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

INTERVAL="${1:-15}"
TEST_FILE="${2:-tests/ux/map-basic.spec.ts}"

echo -e "${BLUE}🎭 ZZIK LIVE v4 - Playwright Auto-Refresh Watch Mode${NC}"
echo "========================================================="
echo ""
echo -e "${YELLOW}📊 Settings:${NC}"
echo "  • Test file: ${TEST_FILE}"
echo "  • Refresh interval: ${INTERVAL} seconds"
echo "  • Mode: Headed (browser visible)"
echo ""
echo -e "${BLUE}🔄 Auto-refresh will run every ${INTERVAL} seconds...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

# Check if dev server is running
if ! curl -fsS "http://localhost:3000" >/dev/null 2>&1; then
  echo -e "${RED}❌ Dev server not running!${NC}"
  echo "Please run: pnpm dev"
  exit 1
fi

COUNTER=1

while true; do
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

  echo "========================================================="
  echo -e "${BLUE}🔄 Run #${COUNTER} - ${TIMESTAMP}${NC}"
  echo "========================================================="

  # Run Playwright in headed mode (browser visible)
  npx playwright test "${TEST_FILE}" \
    --headed \
    --workers=1 \
    --reporter=list \
    --project=chromium-desktop || true

  echo ""
  echo -e "${GREEN}✓ Run #${COUNTER} completed${NC}"
  echo -e "${YELLOW}⏳ Waiting ${INTERVAL} seconds before next run...${NC}"
  echo ""

  COUNTER=$((COUNTER + 1))
  sleep "${INTERVAL}"
done
