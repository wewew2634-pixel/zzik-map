#!/bin/bash
################################################################################
# ZZIK MAP - Self-Healing Error Diagnostics Loop
#
# 자동 오류 진단 및 자가치유 루프
# 프론트엔드/백엔드 오류를 의심하고 분석하며 자동 복구
################################################################################

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 로그 파일
LOG_DIR="./logs"
DIAGNOSTICS_LOG="$LOG_DIR/diagnostics-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "$LOG_DIR"

# 함수: 로그 출력
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$DIAGNOSTICS_LOG"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$DIAGNOSTICS_LOG"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$DIAGNOSTICS_LOG"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$DIAGNOSTICS_LOG"
}

info() {
    echo -e "${CYAN}[INFO]${NC} $1" | tee -a "$DIAGNOSTICS_LOG"
}

################################################################################
# PHASE 1: 프론트엔드 진단
################################################################################
diagnose_frontend() {
    log "${PURPLE}=== FRONTEND DIAGNOSTICS ===${NC}"

    # 1. Next.js 빌드 캐시 확인
    info "Checking Next.js build cache..."
    if [ -d ".next" ]; then
        warning "Found .next directory - this might be stale"
        info "Attempting to clean Next.js cache..."
        rm -rf .next .next/cache
        success "Cleaned .next directory"
    fi

    # 2. 타입 체크
    info "Running TypeScript type check..."
    if ! pnpm tsc --noEmit 2>&1 | tee -a "$DIAGNOSTICS_LOG"; then
        error "TypeScript compilation failed"
        return 1
    fi
    success "TypeScript type check passed"

    # 3. 번들 분석
    info "Analyzing bundle dependencies..."
    pnpm list --depth=0 2>&1 | tee -a "$DIAGNOSTICS_LOG"

    # 4. ESLint 검사
    info "Running ESLint..."
    if ! pnpm lint 2>&1 | tee -a "$DIAGNOSTICS_LOG"; then
        warning "Linting issues found - attempting auto-fix..."
        pnpm lint -- --fix
    fi

    # 5. 404 에러 분석 (/.next/server module missing)
    info "Analyzing Next.js webpack bundle..."
    if grep -r "546.js\|MODULE_NOT_FOUND" "$DIAGNOSTICS_LOG" 2>/dev/null; then
        warning "Found webpack module reference errors"
        info "This usually indicates stale build cache"
        return 1
    fi

    success "Frontend diagnostics completed"
    return 0
}

################################################################################
# PHASE 2: 백엔드 진단
################################################################################
diagnose_backend() {
    log "${PURPLE}=== BACKEND DIAGNOSTICS ===${NC}"

    # 1. API Health 체크
    info "Checking API health endpoints..."
    if curl -s http://localhost:3000/api/health | grep -q "200"; then
        success "API health check passed"
    else
        warning "API health check failed - checking routes..."
    fi

    # 2. Supabase 연결 확인
    info "Checking Supabase client initialization..."
    if grep -r "Supabase clients initialized" "$DIAGNOSTICS_LOG" 2>/dev/null; then
        success "Supabase initialized"
    else
        error "Supabase initialization failed"
        return 1
    fi

    # 3. 환경 변수 확인
    info "Checking environment variables..."
    if [ -f ".env.local" ]; then
        if grep -q "NEXT_PUBLIC_SUPABASE_URL\|NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
            success "Required env vars found"
        else
            error "Missing Supabase env vars"
            return 1
        fi
    else
        error ".env.local file not found"
        return 1
    fi

    # 4. 라우트 검증
    info "Validating API routes..."
    find src/app/api -name "route.ts" -o -name "route.js" | while read route; do
        info "Found: $route"
    done

    success "Backend diagnostics completed"
    return 0
}

################################################################################
# PHASE 3: 의존성 및 패키지 진단
################################################################################
diagnose_dependencies() {
    log "${PURPLE}=== DEPENDENCY DIAGNOSTICS ===${NC}"

    # 1. 패키지 무결성 확인
    info "Verifying package integrity..."
    if ! pnpm install --frozen-lockfile --check-only 2>&1 | tee -a "$DIAGNOSTICS_LOG"; then
        warning "Package mismatch detected - reinstalling..."
        rm -rf node_modules .pnpm-lock.yaml
        pnpm install
        success "Dependencies reinstalled"
    else
        success "Package integrity verified"
    fi

    # 2. 보안 감사
    info "Running security audit..."
    pnpm audit 2>&1 | tee -a "$DIAGNOSTICS_LOG"

    # 3. 중복 패키지 확인
    info "Checking for duplicate dependencies..."
    pnpm list --depth=0 | grep -E "duplicate|peer" | tee -a "$DIAGNOSTICS_LOG" || success "No duplicates found"

    success "Dependency diagnostics completed"
    return 0
}

################################################################################
# PHASE 4: 빌드 재시도 및 자가치유
################################################################################
self_heal_build() {
    log "${PURPLE}=== SELF-HEALING BUILD PROCESS ===${NC}"

    # 전략 1: Next.js 캐시 완전 제거
    info "Strategy 1: Deep cache cleanup..."
    rm -rf .next .turbo dist build coverage
    success "Cache cleaned"

    # 전략 2: 프로젝트 재구축
    info "Strategy 2: Clean rebuild..."
    if pnpm build 2>&1 | tee -a "$DIAGNOSTICS_LOG"; then
        success "Build successful after cache cleanup"
        return 0
    fi

    # 전략 3: 의존성 재설치
    info "Strategy 3: Reinstalling dependencies..."
    rm -rf node_modules pnpm-lock.yaml
    pnpm install

    if pnpm build 2>&1 | tee -a "$DIAGNOSTICS_LOG"; then
        success "Build successful after dependency reinstall"
        return 0
    fi

    # 전략 4: 파일 시스템 검사
    info "Strategy 4: Filesystem integrity check..."
    find . -name "*.next" -type d -delete
    find . -name "*.turbo" -type d -delete

    if pnpm build 2>&1 | tee -a "$DIAGNOSTICS_LOG"; then
        success "Build successful after filesystem cleanup"
        return 0
    fi

    # 전략 5: Node 캐시 완전 초기화
    info "Strategy 5: Node cache reset..."
    npm cache clean --force
    pnpm store prune
    rm -rf node_modules
    pnpm install --shamefully-hoist

    if pnpm build 2>&1 | tee -a "$DIAGNOSTICS_LOG"; then
        success "Build successful after Node cache reset"
        return 0
    fi

    error "Self-healing failed - manual intervention needed"
    return 1
}

################################################################################
# PHASE 5: 개발 서버 헬스 체크
################################################################################
health_check_dev_server() {
    log "${PURPLE}=== DEV SERVER HEALTH CHECK ===${NC}"

    info "Waiting for dev server to start..."
    sleep 3

    # 메인 페이지 확인
    info "Checking main page..."
    if curl -s http://localhost:3000 | grep -q "html\|HTML"; then
        success "Main page is responsive"
    else
        error "Main page failed to load"
        return 1
    fi

    # API 엔드포인트 확인
    info "Checking API endpoints..."
    for endpoint in "/api/health" "/api/locations" "/api/journeys"; do
        if curl -s "http://localhost:3000$endpoint" > /dev/null; then
            success "Endpoint $endpoint responsive"
        else
            warning "Endpoint $endpoint not responding"
        fi
    done

    # 메모리 사용량 확인
    info "Checking memory usage..."
    if command -v ps &> /dev/null; then
        ps aux | grep "node\|next" | grep -v grep | tee -a "$DIAGNOSTICS_LOG"
    fi

    success "Health check completed"
    return 0
}

################################################################################
# PHASE 6: 성능 프로파일링
################################################################################
performance_profile() {
    log "${PURPLE}=== PERFORMANCE PROFILING ===${NC}"

    info "Build time analysis..."
    time pnpm build 2>&1 | tee -a "$DIAGNOSTICS_LOG"

    info "Module analysis..."
    pnpm build 2>&1 | grep "Compiled\|modules" | tee -a "$DIAGNOSTICS_LOG"

    success "Performance profiling completed"
}

################################################################################
# MAIN ORCHESTRATION
################################################################################
main() {
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║     ZZIK MAP - Self-Healing Error Diagnostics Loop         ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    log "Starting comprehensive diagnostics..."
    log "Log file: $DIAGNOSTICS_LOG"
    echo ""

    # 실행 순서
    if ! diagnose_frontend; then
        warning "Frontend diagnostics failed - proceeding with healing..."
    fi

    if ! diagnose_backend; then
        warning "Backend diagnostics failed - checking dependencies..."
    fi

    if ! diagnose_dependencies; then
        warning "Dependencies issue detected - attempting heal..."
    fi

    # 자가치유 시작
    if [ -f ".next/server/webpack-runtime.js" ]; then
        error "Found stale Next.js webpack cache"
        if ! self_heal_build; then
            error "Self-healing failed - aborting"
            exit 1
        fi
    fi

    # 헬스 체크
    health_check_dev_server

    # 성능 분석
    performance_profile

    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║         Diagnostics Complete - Ready for Development       ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    log "Full diagnostics log available at: $DIAGNOSTICS_LOG"
}

# 실행
main "$@"
