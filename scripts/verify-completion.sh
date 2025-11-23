#!/bin/bash

# ZZIK 작업 완료 자동 검증 스크립트
# 누락 사항 및 거짓 주장을 찾아냅니다

set -e

echo "🔍 ZZIK 작업 검증 시작..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ERRORS=0
WARNINGS=0
PROJECT_ROOT="/home/ubuntu/work/zzik-map"

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# Phase 1: 핵심 설정 파일 검증
# ============================================

echo "📋 Phase 1: 핵심 설정 파일 검증"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1.1 .claude/settings.json 프로젝트 이름
echo -n "  [1/5] .claude/settings.json 프로젝트 이름... "
if grep -q '"name": "ZZIK Map"' "$PROJECT_ROOT/.claude/settings.json"; then
  echo -e "${GREEN}✅${NC}"
else
  echo -e "${RED}❌${NC}"
  echo "       현재: $(grep '"name"' "$PROJECT_ROOT/.claude/settings.json" | head -1)"
  echo "       예상: \"name\": \"ZZIK Map\""
  ERRORS=$((ERRORS + 1))
fi

# 1.2 .claude/settings.json 버전
echo -n "  [2/5] .claude/settings.json 버전... "
if grep -q '"version": "0.1.0"' "$PROJECT_ROOT/.claude/settings.json"; then
  echo -e "${GREEN}✅${NC}"
else
  echo -e "${YELLOW}⚠️${NC}"
  echo "       현재: $(grep '"version"' "$PROJECT_ROOT/.claude/settings.json" | head -1)"
  WARNINGS=$((WARNINGS + 1))
fi

# 1.3 package.json name
echo -n "  [3/5] package.json name... "
if grep -q '"name": "zzik-map"' "$PROJECT_ROOT/package.json"; then
  echo -e "${GREEN}✅${NC}"
else
  echo -e "${RED}❌${NC}"
  echo "       현재: $(grep '"name"' "$PROJECT_ROOT/package.json" | head -1)"
  ERRORS=$((ERRORS + 1))
fi

# 1.4 settings.local.json 경로
echo -n "  [4/5] .claude/settings.local.json 경로... "
LIVE_COUNT=$(grep "zzik-live" "$PROJECT_ROOT/.claude/settings.local.json" 2>/dev/null | wc -l)
if [ "$LIVE_COUNT" -eq 0 ]; then
  echo -e "${GREEN}✅${NC}"
else
  echo -e "${RED}❌${NC}"
  echo "       ${LIVE_COUNT}개의 'zzik-live' 경로 발견"
  ERRORS=$((ERRORS + 1))
fi

# 1.5 MCP Prisma 경로
echo -n "  [5/5] .claude/mcp-settings.json Prisma 경로... "
if grep -q "/home/ubuntu/work/zzik-map/prisma/schema.prisma" "$PROJECT_ROOT/.claude/mcp-settings.json"; then
  echo -e "${GREEN}✅${NC}"
else
  echo -e "${RED}❌${NC}"
  echo "       현재: $(grep "PRISMA_SCHEMA_PATH" "$PROJECT_ROOT/.claude/mcp-settings.json")"
  ERRORS=$((ERRORS + 1))
fi

echo ""

# ============================================
# Phase 2: 불필요 파일/폴더 스캔
# ============================================

echo "🗑️  Phase 2: 불필요 파일/폴더 스캔"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 2.1 루트 v5.1 폴더
echo -n "  [1/4] 루트 v5.1 폴더 (coverage, artifacts 등)... "
V51_FOLDERS=$(ls -d "$PROJECT_ROOT"/{coverage,artifacts,health-check-screenshots,deep-analysis-report,figma} 2>/dev/null | wc -l)
if [ "$V51_FOLDERS" -eq 0 ]; then
  echo -e "${GREEN}✅${NC}"
else
  echo -e "${RED}❌${NC}"
  echo "       ${V51_FOLDERS}개 폴더 발견:"
  ls -d "$PROJECT_ROOT"/{coverage,artifacts,health-check-screenshots,deep-analysis-report,figma} 2>/dev/null || true
  ERRORS=$((ERRORS + 1))
fi

# 2.2 apps/web/ 테스트 폴더
echo -n "  [2/4] apps/web/ 테스트 폴더 (coverage, playwright-report 등)... "
WEB_TEST_FOLDERS=$(ls -d "$PROJECT_ROOT/apps/web"/{coverage,playwright-report,test-results} 2>/dev/null | wc -l)
if [ "$WEB_TEST_FOLDERS" -eq 0 ]; then
  echo -e "${GREEN}✅${NC}"
else
  echo -e "${RED}❌${NC}"
  echo "       ${WEB_TEST_FOLDERS}개 폴더 발견:"
  ls -d "$PROJECT_ROOT/apps/web"/{coverage,playwright-report,test-results} 2>/dev/null || true
  ERRORS=$((ERRORS + 1))
fi

# 2.3 v5.1 리포트 파일
echo -n "  [3/4] v5.1 리포트 파일 (JSON/HTML)... "
REPORT_FILES=$(find "$PROJECT_ROOT" -maxdepth 1 -type f \( -name "*report*.json" -o -name "*report*.html" -o -name "live-view.html" -o -name "mobile-qr.html" \) 2>/dev/null | wc -l)
if [ "$REPORT_FILES" -eq 0 ]; then
  echo -e "${GREEN}✅${NC}"
else
  echo -e "${YELLOW}⚠️${NC}"
  echo "       ${REPORT_FILES}개 파일 발견 (확인 필요)"
  WARNINGS=$((WARNINGS + 1))
fi

# 2.4 v5.1 문서 파일
echo -n "  [4/4] v5.1 문서 파일 (OPTIMIZATION_VERIFICATION 등)... "
V51_DOCS=$(ls "$PROJECT_ROOT"/{OPTIMIZATION_VERIFICATION_REPORT.md,PROJECT_ORGANIZATION.md,ux-agents.json} 2>/dev/null | wc -l)
if [ "$V51_DOCS" -eq 0 ]; then
  echo -e "${GREEN}✅${NC}"
else
  echo -e "${YELLOW}⚠️${NC}"
  echo "       ${V51_DOCS}개 문서 발견 (확인 필요)"
  WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================
# Phase 3: Agent/Skills 구성 확인
# ============================================

echo "🤖 Phase 3: Agent/Skills 구성 확인"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 3.1 Agents
echo -n "  [1/3] Agents 개수... "
AGENT_COUNT=$(ls -1 "$PROJECT_ROOT/.claude/agents"/*.md 2>/dev/null | wc -l)
if [ "$AGENT_COUNT" -ge 3 ]; then
  echo -e "${GREEN}✅ ${AGENT_COUNT}개${NC}"
else
  echo -e "${YELLOW}⚠️ ${AGENT_COUNT}개 (예상: 4개+)${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# 3.2 Skills
echo -n "  [2/3] Skills 개수... "
SKILL_COUNT=$(ls -d "$PROJECT_ROOT/.claude/skills"/*/ 2>/dev/null | wc -l)
if [ "$SKILL_COUNT" -ge 6 ]; then
  echo -e "${GREEN}✅ ${SKILL_COUNT}개${NC}"
else
  echo -e "${YELLOW}⚠️ ${SKILL_COUNT}개 (예상: 6개+)${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# 3.3 Commands
echo -n "  [3/3] Commands 개수... "
COMMAND_COUNT=$(ls -1 "$PROJECT_ROOT/.claude/commands"/*.md 2>/dev/null | wc -l)
if [ "$COMMAND_COUNT" -ge 5 ]; then
  echo -e "${GREEN}✅ ${COMMAND_COUNT}개${NC}"
else
  echo -e "${YELLOW}⚠️ ${COMMAND_COUNT}개 (예상: 6개+)${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================
# Phase 4: 프로젝트 크기 측정
# ============================================

echo "📊 Phase 4: 프로젝트 크기 측정"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 4.1 전체 크기
TOTAL_SIZE=$(du -sh "$PROJECT_ROOT" 2>/dev/null | cut -f1)
echo "  전체 크기: ${TOTAL_SIZE}"

# 4.2 빌드 제외 크기
CLEAN_SIZE=$(du -sh "$PROJECT_ROOT" --exclude=node_modules --exclude=.next 2>/dev/null | cut -f1)
echo "  정리된 크기 (빌드 제외): ${CLEAN_SIZE}"

# 4.3 node_modules
NODE_SIZE=$(du -sh "$PROJECT_ROOT/node_modules" 2>/dev/null | cut -f1 || echo "N/A")
echo "  node_modules: ${NODE_SIZE}"

echo ""

# ============================================
# 최종 결과
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 검증 결과 요약"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_CHECKS=17
PASSED=$((TOTAL_CHECKS - ERRORS - WARNINGS))
SUCCESS_RATE=$((PASSED * 100 / TOTAL_CHECKS))

echo "  전체 검사: ${TOTAL_CHECKS}개"
echo -e "  통과: ${GREEN}${PASSED}개${NC}"
if [ "$WARNINGS" -gt 0 ]; then
  echo -e "  경고: ${YELLOW}${WARNINGS}개${NC}"
fi
if [ "$ERRORS" -gt 0 ]; then
  echo -e "  실패: ${RED}${ERRORS}개${NC}"
fi
echo ""
echo "  달성률: ${SUCCESS_RATE}%"
echo ""

# 최종 판단
if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
  echo -e "${GREEN}✅ 모든 검증 통과! (100%)${NC}"
  echo ""
  echo "🚀 프로젝트 상태: Production Ready"
  exit 0
elif [ "$ERRORS" -eq 0 ]; then
  echo -e "${YELLOW}⚠️  경고가 있지만 개발 가능 (${SUCCESS_RATE}%)${NC}"
  echo ""
  echo "💡 개선 권장 사항이 있습니다."
  exit 0
else
  echo -e "${RED}❌ ${ERRORS}개 항목 실패 (${SUCCESS_RATE}%)${NC}"
  echo ""
  echo "🔧 즉시 수정이 필요합니다."
  echo ""
  echo "자동 수정을 원하시면: bash scripts/auto-fix.sh"
  exit 1
fi
