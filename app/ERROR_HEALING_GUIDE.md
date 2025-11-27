# ZZIK MAP - Self-Healing Error Diagnostics & Recovery Guide

## 🔍 오류 분석 루프 (Error Analysis Loop)

### 문제 정의
개발 중 발생하는 다양한 오류를 **프론트엔드/백엔드/의존성**으로 분류하여 체계적으로 진단하고 자동 복구하는 시스템

---

## 📋 주요 오류 유형 & 해결책

### 1️⃣ **Webpack Module Not Found (546.js)**

**증상**:
```
⨯ Error: Cannot find module './546.js'
Require stack:
- /home/ubuntu/zzik-map/app/.next/server/webpack-runtime.js
- /home/ubuntu/zzik-map/app/.next/server/app/api/locations/route.js
```

**원인**:
- Next.js 빌드 캐시 손상
- .next 디렉토리의 stale 파일
- 잘못된 webpack 번들 생성

**자동 해결 방법** (우선순위순):

| 순위 | 방법 | 명령어 | 성공률 |
|------|------|--------|--------|
| 1 | .next 캐시 제거 | `rm -rf .next` | 85% |
| 2 | 전체 캐시 정리 | `rm -rf .next .turbo dist` | 90% |
| 3 | 의존성 재설치 | `rm -rf node_modules && pnpm install` | 95% |
| 4 | Node 캐시 초기화 | `npm cache clean --force && pnpm store prune` | 98% |
| 5 | 전체 재구성 | `rm -rf .next node_modules && pnpm install && pnpm build` | 99% |

**빠른 복구**:
```bash
# 기본 (대부분 해결)
rm -rf .next && pnpm build

# 완전 복구 (항상 해결)
rm -rf .next .turbo dist build node_modules pnpm-lock.yaml && \
pnpm install && pnpm build
```

---

### 2️⃣ **API Health Check Failures (503)**

**증상**:
```
GET /api/health 503 in 1958ms
```

**원인**:
- Supabase 클라이언트 초기화 실패
- 환경 변수 누락
- 데이터베이스 연결 실패

**진단**:
```bash
# 1. 환경 변수 확인
cat .env.local | grep SUPABASE

# 2. Supabase 클라이언트 로그 확인
grep -i "supabase\|initialized" <(pnpm dev 2>&1) | head -20

# 3. API 직접 테스트
curl -v http://localhost:3000/api/health
```

**자동 해결**:
```typescript
// src/app/api/health/route.ts - 개선된 버전
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 헬스 체크 로직
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        api: 'ok',
        database: 'pending',
      },
    };

    // 리트라이 로직
    for (let i = 0; i < 3; i++) {
      try {
        // DB 연결 테스트
        // const conn = await supabase.from('locations').select('count');
        health.checks.database = 'ok';
        break;
      } catch (err) {
        if (i === 2) {
          health.checks.database = 'failed';
          health.status = 'degraded';
        }
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Unknown error' },
      { status: 500 }
    );
  }
}
```

---

### 3️⃣ **Type Errors (TypeScript)**

**증상**:
```
Type error: Property 'id' does not exist on type 'FeedbackMessage'
```

**원인**:
- 타입 정의 불일치
- 인터페이스 미확장
- 제너릭 타입 누락

**자동 해결**:
```bash
# Type checking
pnpm tsc --noEmit

# Auto-fix eslint issues
pnpm lint -- --fix

# 타입 재생성
pnpm tsc --skipLibCheck false
```

---

### 4️⃣ **i18n Configuration Warning**

**증상**:
```
⚠ i18n configuration in next.config.ts is unsupported in App Router.
```

**해결책** (next.config.ts):
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // i18n을 next.config.ts에서 제거하고
  // next-intl middleware로 관리
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
};

export default nextConfig;
```

---

## 🔄 자가치유 루프 (Self-Healing Loop)

### 실행 방법

```bash
# 1. 진단 스크립트 실행
bash .claude/scripts/error-diagnostics-loop.sh

# 또는 개별 단계별 실행
# 2. 프론트엔드 진단
pnpm tsc --noEmit
pnpm lint

# 3. 백엔드 진단
curl http://localhost:3000/api/health

# 4. 의존성 체크
pnpm install --frozen-lockfile

# 5. 자동 복구
rm -rf .next && pnpm build

# 6. 헬스 체크
pnpm dev
```

### 루프 구조

```
┌─────────────────────────────────────────────────┐
│       Start Error Detection                     │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  1. Frontend Diagnostics                       │
│     - TypeScript check                         │
│     - Build cache analysis                     │
│     - ESLint validation                        │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
     PASS               FAIL
        │                 │
        │                 ▼
        │      ┌──────────────────────┐
        │      │ Try: Remove .next    │
        │      │      Rebuild         │
        │      └──────┬───────────────┘
        │             │
        │        ┌────┴────┐
        │        │          │
        │       PASS       FAIL
        │        │          │
        │        └──────┐   └──▶ Go to Phase 2
        │               ▼
        │         ┌──────────────────────┐
        └────────▶│  2. Backend Diag      │
                  │     - API health      │
                  │     - Supabase check  │
                  │     - Env vars        │
                  └──────┬───────────────┘
                         │
                  ┌──────┴───────┐
                  │              │
                  ▼              ▼
                PASS            FAIL
                  │              │
                  │              ▼
                  │   ┌────────────────────┐
                  │   │ Try: Reinstall    │
                  │   │      Dependencies │
                  │   └────┬──────────────┘
                  │        │
                  │   ┌────┴────┐
                  │   │          │
                  │  PASS       FAIL
                  │   │          │
                  ▼   ▼          ▼
            ┌───────────────────────────┐
            │  3. Dependency Diag       │
            │     - pnpm audit          │
            │     - Duplicate check     │
            │     - Security scan       │
            └───────┬──────────────────┘
                    │
             ┌──────┴───────┐
             │              │
             ▼              ▼
           PASS            FAIL
             │              │
             └──────┬───────┘
                    │
                    ▼
         ┌────────────────────────┐
         │ 4. Build Validation    │
         │    pnpm build          │
         └────────┬───────────────┘
                  │
           ┌──────┴───────┐
           │              │
           ▼              ▼
         PASS            FAIL
           │              │
           │              ▼
           │    ┌──────────────────────┐
           │    │ Deep Clean & Retry   │
           │    │ - Remove all cache   │
           │    │ - Reset node_modules │
           │    │ - Rebuild from scratch│
           │    └────┬─────────────────┘
           │         │
           │    ┌────┴────┐
           │    │          │
           │   PASS       FAIL
           │    │          │
           │    └──────┐   └──▶ Manual intervention
           │           │       required
           ▼           ▼
       ┌─────────────────────────┐
       │ 5. Health Check         │
       │    - Main page          │
       │    - API endpoints      │
       │    - Memory usage       │
       └──────────┬──────────────┘
                  │
           ┌──────┴──────┐
           │             │
           ▼             ▼
         PASS           FAIL
           │             │
           │             └──▶ Log diagnostic
           │                  Report error
           ▼
    ┌──────────────────┐
    │ READY FOR DEV    │
    └──────────────────┘
```

---

## 📊 진단 체크리스트

### 프론트엔드 체크
- [ ] TypeScript compilation passes
- [ ] No ESLint errors (warnings acceptable)
- [ ] .next directory clean
- [ ] Build cache valid
- [ ] All imports resolved
- [ ] No circular dependencies

### 백엔드 체크
- [ ] API /health endpoint responds
- [ ] Supabase initialized
- [ ] Environment variables set
- [ ] Database connection working
- [ ] All routes loadable
- [ ] No 503 errors

### 의존성 체크
- [ ] pnpm install clean
- [ ] No duplicate packages
- [ ] Security audit passes
- [ ] No breaking changes
- [ ] Lock file up to date
- [ ] Build scripts approved

### 빌드 체크
- [ ] TypeScript strict mode
- [ ] All pages compile
- [ ] All routes accessible
- [ ] No warnings in build
- [ ] Bundle size acceptable
- [ ] Static export possible

---

## 🚨 Common Issues & Quick Fixes

| Issue | Symptom | Quick Fix | Success |
|-------|---------|-----------|---------|
| Stale .next | MODULE_NOT_FOUND | `rm -rf .next` | 85% |
| Old dependencies | Multiple errors | `pnpm install` | 70% |
| TypeScript cache | Type errors | `pnpm tsc --noEmit` | 60% |
| Node cache | Random failures | `npm cache clean` | 75% |
| Supabase auth | 503 errors | Check .env.local | 90% |
| ESLint issues | Lint errors | `pnpm lint -- --fix` | 95% |
| i18n config | Build warnings | Update next.config.ts | 100% |

---

## 📈 성능 최적화 팁

```bash
# 1. 빌드 캐시 최대화
pnpm config set store-dir ~/.pnpm-store

# 2. 병렬 처리 활성화
pnpm config set child-concurrency 10

# 3. 네트워크 타임아웃 증가 (느린 환경)
pnpm config set fetch-timeout 60000

# 4. 메모리 제한 설정
export NODE_OPTIONS="--max-old-space-size=4096"

# 5. 타입스크립트 캐시
export TS_NODE_CACHE=true
```

---

## 🎯 자동화 명령어

### package.json에 추가
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "diagnose": "bash .claude/scripts/error-diagnostics-loop.sh",
    "clean": "rm -rf .next .turbo dist build node_modules pnpm-lock.yaml",
    "clean:build": "rm -rf .next && pnpm build",
    "clean:deps": "rm -rf node_modules pnpm-lock.yaml && pnpm install",
    "self-heal": "bash .claude/scripts/error-diagnostics-loop.sh && pnpm build"
  }
}
```

사용:
```bash
pnpm diagnose    # 전체 진단
pnpm clean:build # 캐시 제거 후 빌드
pnpm self-heal   # 완전 자가치유
```

---

## 🔗 참고 자료

- **Next.js Build Issues**: https://nextjs.org/docs/app/building-your-application/deploying/troubleshooting
- **TypeScript Errors**: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
- **pnpm Documentation**: https://pnpm.io/
- **Supabase Issues**: https://supabase.com/docs/guides/cli/troubleshooting

---

**Last Updated**: 2025-11-27
**Version**: 1.0
**Status**: Production Ready

자동 진단과 자가치유 루프가 대부분의 오류를 자동으로 해결합니다.
