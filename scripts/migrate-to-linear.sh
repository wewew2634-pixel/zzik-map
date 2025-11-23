#!/bin/bash
# ZZIK LIVE - Linear 2025 스타일 마이그레이션 스크립트

set -e

echo "🎨 ZZIK Linear 2025 Migration Script"
echo "====================================="
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 프로젝트 루트 확인
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Error: package.json not found. Run this script from project root.${NC}"
  exit 1
fi

echo -e "${YELLOW}Step 1: Catalyst UI Kit 통합${NC}"
echo "--------------------------------"

# Catalyst 컴포넌트 디렉토리 생성
echo "Creating Catalyst components directory..."
mkdir -p apps/web/src/components/catalyst

# Catalyst 컴포넌트 복사
if [ -d ".claude/catalyst-ui-kit/typescript" ]; then
  echo "Copying Catalyst components..."
  cp -r .claude/catalyst-ui-kit/typescript/* apps/web/src/components/catalyst/
  echo -e "${GREEN}✓ Catalyst components copied${NC}"
else
  echo -e "${RED}❌ Catalyst UI Kit not found in .claude/catalyst-ui-kit/${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: 의존성 설치${NC}"
echo "--------------------------------"

cd apps/web

# 필수 의존성 설치
echo "Installing required dependencies..."
pnpm add @headlessui/react lucide-react clsx motion

echo -e "${GREEN}✓ Dependencies installed${NC}"

echo ""
echo -e "${YELLOW}Step 3: Linear 컴포넌트 생성${NC}"
echo "--------------------------------"

# Linear 컴포넌트 디렉토리 생성
mkdir -p src/components/linear

echo -e "${GREEN}✓ Linear components directory created${NC}"

cd ../..

echo ""
echo -e "${YELLOW}Step 4: 이모지 검색 및 리포트${NC}"
echo "--------------------------------"

# 이모지 검색
EMOJI_COUNT=$(grep -r "🔍\|🗺\|₩\|◎\|🟢\|🟡\|🔴\|🚀\|📍\|💰" apps/web/src/ 2>/dev/null | wc -l || echo "0")

if [ "$EMOJI_COUNT" -gt 0 ]; then
  echo -e "${RED}⚠️  Found $EMOJI_COUNT emoji occurrences:${NC}"
  grep -rn "🔍\|🗺\|₩\|◎\|🟢\|🟡\|🔴\|🚀\|📍\|💰" apps/web/src/ 2>/dev/null || true
  echo ""
  echo -e "${YELLOW}👉 These need to be replaced with Lucide icons${NC}"
else
  echo -e "${GREEN}✓ No emojis found${NC}"
fi

echo ""
echo -e "${YELLOW}Step 5: 검증${NC}"
echo "--------------------------------"

# 필수 파일 확인
echo "Checking required files..."

REQUIRED_FILES=(
  "apps/web/src/components/catalyst/button.tsx"
  "apps/web/src/components/catalyst/badge.tsx"
  "apps/web/src/components/catalyst/dialog.tsx"
)

ALL_GOOD=true
for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file ${RED}(missing)${NC}"
    ALL_GOOD=false
  fi
done

echo ""
if [ "$ALL_GOOD" = true ]; then
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✅ Migration setup completed!${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Copy Linear components from IMPLEMENTATION_EXAMPLES.md"
  echo "2. Replace old components with Linear versions"
  echo "3. Remove all emojis (${EMOJI_COUNT} found)"
  echo "4. Run: pnpm dev"
  echo "5. Compare with Linear.app"
  echo ""
  echo "📚 Documentation:"
  echo "  - ZZIK_LINEAR_DESIGN_SYSTEM.md (design rules)"
  echo "  - IMPLEMENTATION_EXAMPLES.md (copy-paste examples)"
else
  echo -e "${RED}❌ Some required files are missing${NC}"
  exit 1
fi
