#!/bin/bash

# ZZIK 자동 수정 스크립트
# 검증에서 발견된 문제를 자동으로 수정합니다

set -e

echo "🔧 ZZIK 자동 수정 시작..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PROJECT_ROOT="/home/ubuntu/work/zzik-map"
FIXED=0

# 색상
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ============================================
# Fix 1: .claude/settings.json 프로젝트 정보
# ============================================

echo -n "  [1/5] .claude/settings.json 프로젝트 정보 수정... "
if grep -q '"ZZIK LIVE"' "$PROJECT_ROOT/.claude/settings.json"; then
  sed -i 's/"ZZIK LIVE"/"ZZIK Map"/g' "$PROJECT_ROOT/.claude/settings.json"
  sed -i 's/"4.0.0"/"0.1.0"/g' "$PROJECT_ROOT/.claude/settings.json"
  echo -e "${GREEN}✅${NC}"
  FIXED=$((FIXED + 1))
else
  echo -e "${YELLOW}⏭️  이미 수정됨${NC}"
fi

# ============================================
# Fix 2: .claude/settings.local.json 경로
# ============================================

echo -n "  [2/5] .claude/settings.local.json 경로 수정... "
LIVE_COUNT=$(grep "zzik-live" "$PROJECT_ROOT/.claude/settings.local.json" 2>/dev/null | wc -l)
if [ "$LIVE_COUNT" -gt 0 ]; then
  sed -i 's/zzik-live/zzik-map/g' "$PROJECT_ROOT/.claude/settings.local.json"
  echo -e "${GREEN}✅ (${LIVE_COUNT}개 수정)${NC}"
  FIXED=$((FIXED + 1))
else
  echo -e "${YELLOW}⏭️  이미 수정됨${NC}"
fi

# ============================================
# Fix 3: apps/web/ 테스트 폴더 삭제
# ============================================

echo -n "  [3/5] apps/web/ 테스트 폴더 삭제... "
DELETED=0
for folder in coverage playwright-report test-results; do
  if [ -d "$PROJECT_ROOT/apps/web/$folder" ]; then
    rm -rf "$PROJECT_ROOT/apps/web/$folder"
    DELETED=$((DELETED + 1))
  fi
done

if [ "$DELETED" -gt 0 ]; then
  echo -e "${GREEN}✅ (${DELETED}개 삭제)${NC}"
  FIXED=$((FIXED + 1))
else
  echo -e "${YELLOW}⏭️  이미 삭제됨${NC}"
fi

# ============================================
# Fix 4: package.json name
# ============================================

echo -n "  [4/5] package.json name 수정... "
if ! grep -q '"name": "zzik-map"' "$PROJECT_ROOT/package.json"; then
  sed -i 's/"name": "zzik-live"/"name": "zzik-map"/g' "$PROJECT_ROOT/package.json"
  echo -e "${GREEN}✅${NC}"
  FIXED=$((FIXED + 1))
else
  echo -e "${YELLOW}⏭️  이미 수정됨${NC}"
fi

# ============================================
# Fix 5: MCP Prisma 경로
# ============================================

echo -n "  [5/5] MCP Prisma 경로 수정... "
if grep -q "zzik-live" "$PROJECT_ROOT/.claude/mcp-settings.json"; then
  sed -i 's/zzik-live/zzik-map/g' "$PROJECT_ROOT/.claude/mcp-settings.json"
  echo -e "${GREEN}✅${NC}"
  FIXED=$((FIXED + 1))
else
  echo -e "${YELLOW}⏭️  이미 수정됨${NC}"
fi

# ============================================
# 최종 결과
# ============================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 수정 결과"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  수정된 항목: ${FIXED}개"
echo ""

if [ "$FIXED" -gt 0 ]; then
  echo -e "${GREEN}✅ 자동 수정 완료!${NC}"
  echo ""
  echo "🔍 재검증을 권장합니다:"
  echo "   bash scripts/verify-completion.sh"
else
  echo -e "${YELLOW}⏭️  수정할 항목이 없습니다${NC}"
fi

echo ""
