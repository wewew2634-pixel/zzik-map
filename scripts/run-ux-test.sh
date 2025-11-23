#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-help}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎭 ZZIK LIVE v4 - Playwright UX Tests${NC}"
echo "========================================"
echo ""

# Check if dev server is running
echo "🔎 Checking dev server at http://localhost:3000 ..."

if ! curl -fsS "http://localhost:3000" >/dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Dev server not running.${NC}"
  echo "Please run: pnpm dev"
  echo ""
  exit 1
else
  echo -e "${GREEN}✅ Dev server is running.${NC}"
fi

echo ""

# Run tests based on mode
case "$MODE" in
    "map")
        echo -e "${BLUE}Running Map Exploration Tests (A1-A4)...${NC}"
        npx playwright test tests/ux/map-exploration.spec.ts
        ;;
    "mission")
        echo -e "${BLUE}Running Mission Flow Tests (B1-B4)...${NC}"
        npx playwright test tests/ux/mission-flow.spec.ts
        ;;
    "basic")
        echo -e "${BLUE}Running Basic Tests...${NC}"
        npx playwright test tests/ux/map-basic.spec.ts
        ;;
    "all")
        echo -e "${BLUE}Running All UX Tests...${NC}"
        npx playwright test tests/ux/
        ;;
    "ui")
        echo -e "${BLUE}Running Tests in UI Mode...${NC}"
        npx playwright test --ui
        ;;
    "debug")
        echo -e "${BLUE}Running Tests in Debug Mode...${NC}"
        npx playwright test --debug "$2"
        ;;
    "report")
        echo -e "${BLUE}Opening Test Report...${NC}"
        npx playwright show-report
        ;;
    *)
        echo "Usage: ./scripts/run-ux-test.sh [option]"
        echo ""
        echo "Options:"
        echo "  map       - Run Map Exploration tests (섹션 A: A1-A4)"
        echo "  mission   - Run Mission Flow tests (섹션 B: B1-B4)"
        echo "  basic     - Run Basic tests (existing)"
        echo "  all       - Run all UX tests"
        echo "  ui        - Run tests in UI mode"
        echo "  debug     - Run tests in debug mode"
        echo "  report    - Open test report"
        echo ""
        echo "Examples:"
        echo "  ./scripts/run-ux-test.sh map"
        echo "  ./scripts/run-ux-test.sh mission"
        echo "  ./scripts/run-ux-test.sh all"
        echo "  ./scripts/run-ux-test.sh ui"
        echo ""
        echo -e "${BLUE}📄 Scenario Reference:${NC}"
        echo "  docs/ux/PLAYWRIGHT_SCENARIOS_ZZIK.md"
        echo ""
        exit 0
        ;;
esac

echo ""
echo -e "${GREEN}✅ Tests completed!${NC}"
echo ""
echo "To view detailed report, run:"
echo "  ./scripts/run-ux-test.sh report"
echo ""
