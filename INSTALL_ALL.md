# ZZIK MAP 전체 설치 가이드
## 한번에 모든 의존성 + MCP 설치

---

## 1. NPM 패키지 (pnpm add)

### Production Dependencies
```bash
# Core
@google/generative-ai    # Gemini AI SDK
@supabase/ssr           # Supabase SSR 지원
@supabase/auth-helpers-nextjs  # Supabase Auth

# Image Processing
exifr                   # EXIF GPS 추출
sharp                   # 이미지 리사이즈/압축
browser-image-compression  # 클라이언트 이미지 압축

# State & Data
zustand                 # 상태 관리
swr                     # 데이터 페칭/캐싱
zod                     # 스키마 검증

# UI Components
react-dropzone          # 파일 드래그앤드롭
framer-motion           # 애니메이션
@headlessui/react       # Headless UI
@heroicons/react        # 아이콘
clsx                    # 클래스 조합
tailwind-merge          # Tailwind 클래스 병합
class-variance-authority  # 컴포넌트 variants

# Maps
react-kakao-maps-sdk    # 카카오맵 React SDK

# Date & Utils
date-fns                # 날짜 처리
nanoid                  # 고유 ID 생성
```

### Development Dependencies
```bash
# Testing
vitest                  # 단위 테스트
@testing-library/react  # React 테스트
@testing-library/jest-dom  # DOM 매처
@playwright/test        # E2E 테스트
msw                     # API 모킹

# Types
@types/sharp            # Sharp 타입

# Code Quality
prettier                # 코드 포맷터
prettier-plugin-tailwindcss  # Tailwind 정렬
@typescript-eslint/eslint-plugin  # TS ESLint
@typescript-eslint/parser  # TS 파서

# Supabase
supabase                # Supabase CLI (로컬 개발)
```

---

## 2. 한번에 설치 명령어

```bash
cd /home/ubuntu/zzik-map/app

# ===== Production Dependencies =====
pnpm add \
  @google/generative-ai \
  @supabase/ssr \
  @supabase/auth-helpers-nextjs \
  exifr \
  sharp \
  browser-image-compression \
  zustand \
  swr \
  zod \
  react-dropzone \
  framer-motion \
  @headlessui/react \
  @heroicons/react \
  clsx \
  tailwind-merge \
  class-variance-authority \
  react-kakao-maps-sdk \
  date-fns \
  nanoid

# ===== Development Dependencies =====
pnpm add -D \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  @playwright/test \
  msw \
  @types/sharp \
  prettier \
  prettier-plugin-tailwindcss \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  supabase
```

---

## 3. MCP 서버 설치

```bash
# Supabase MCP (DB 관리)
claude mcp add supabase -- npx -y @supabase/mcp-server-supabase@latest

# (선택) Google Maps MCP
claude mcp add google-maps -- npx -y @anthropic/mcp-server-google-maps@latest
```

---

## 4. 환경 변수 설정

```bash
cd /home/ubuntu/zzik-map/app
cp .env.example .env.local
```

`.env.local` 내용:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Kakao Maps
NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 5. Supabase 로컬 설정

```bash
cd /home/ubuntu/zzik-map/app

# Supabase 초기화
pnpm supabase init

# 로컬 Supabase 시작 (Docker 필요)
pnpm supabase start

# pgvector 활성화 (Dashboard 또는 SQL)
# CREATE EXTENSION IF NOT EXISTS vector;
```

---

## 6. package.json 스크립트 추가

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "format": "prettier --write .",
    "db:migrate": "supabase db push",
    "db:reset": "supabase db reset",
    "db:seed": "tsx scripts/seed.ts"
  }
}
```

---

## 7. 전체 설치 스크립트 (복사용)

아래 전체를 복사해서 한번에 실행:

```bash
#!/bin/bash

cd /home/ubuntu/zzik-map/app

echo "===== Installing Production Dependencies ====="
pnpm add \
  @google/generative-ai \
  @supabase/ssr \
  @supabase/auth-helpers-nextjs \
  exifr \
  sharp \
  browser-image-compression \
  zustand \
  swr \
  zod \
  react-dropzone \
  framer-motion \
  @headlessui/react \
  @heroicons/react \
  clsx \
  tailwind-merge \
  class-variance-authority \
  react-kakao-maps-sdk \
  date-fns \
  nanoid

echo "===== Installing Dev Dependencies ====="
pnpm add -D \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  @playwright/test \
  msw \
  @types/sharp \
  prettier \
  prettier-plugin-tailwindcss \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  supabase \
  tsx

echo "===== Done! ====="
pnpm list
```

---

## 8. 설치 후 확인

```bash
# 의존성 확인
pnpm list

# 개발 서버 테스트
pnpm dev

# TypeScript 확인
pnpm type-check

# 테스트 실행
pnpm test
```

---

## 9. 필요한 외부 계정/API 키

| 서비스 | URL | 용도 | 비용 |
|--------|-----|------|------|
| **Supabase** | https://supabase.com | DB + Auth | 무료 |
| **Google AI Studio** | https://aistudio.google.com | Gemini API | 무료 1K/day |
| **Kakao Developers** | https://developers.kakao.com | 지도 API | 무료 |
| **Vercel** | https://vercel.com | 배포 | 무료 |

---

*ZZIK MAP 설치 가이드*
*2025-11-26*
