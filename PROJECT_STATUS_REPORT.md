# ZZIK LIVE v4 - 프로젝트 작업 현황 리포트

**작성 일시**: 2025-11-21
**프로젝트**: ZZIK LIVE v4 (Map-first Mission Platform)

---

## 📌 기준 레포 원칙

**이 리포트는 `/home/ubuntu/work/zzik-live` 프로젝트 기준입니다.**

- ✅ **작업 레포**: `/home/ubuntu/work/zzik-live` (v4 모노레포)
- 🗄️ **과거 레포**: `/home/ubuntu/work/zzik-map` (백업됨: `_archive/zzik-map-20251121.tar.gz`)
- 📁 **구조**: `apps/web` (Next.js) + `packages/ui` (공유 컴포넌트)

---

## 📊 전체 개요

**현재 단계**: 프론트엔드 MVP 구현 완료, 백엔드 미구현 (Mock 데이터 사용)

**기술 스택**:
- **프론트엔드**: Next.js 16.0.3 (App Router) + React 19.2.0 + Tailwind v4
- **지도**: Mapbox GL JS v3.16.0
- **백엔드**: 없음 (아직 구현 안됨)
- **데이터**: Mock 데이터 (apps/web/src/app/(tabs)/map/page.tsx)

---

## 🎨 프론트엔드 작업 현황

### ✅ 완료된 기능

#### 1. 레이아웃 & UI 컴포넌트 (100% 완료)

**위치**: `packages/ui/src/`

##### **MapShell** (`layout/map-shell.tsx`)
- ✅ Full-screen Map 레이아웃
- ✅ 반응형 Overlay (모바일: 하단 시트, 데스크톱: 우측 패널)
- ✅ Drag Handle (모바일 전용)
- ✅ 디자인 토큰 준수 (zinc 팔레트, rounded-xl/full)

##### **PlaceCard** (`domain/place-card.tsx`)
- ✅ Map variant (Mapbox 통합용)
  - Traffic Signal dots (green/yellow/red)
  - GOLD 뱃지 (amber-500)
  - 미션 메트릭스 (missions, successRate, likes)
  - Benefit 라벨/값
  - 거리 표시 (km)
- ✅ Feed variant (기존 유지)
- ✅ 2026 디자인 원칙 준수 (모노톤, 채도 낮춤)

##### **BottomTabs** (`layout/bottom-tabs.tsx`)
- ✅ 하단 탭 네비게이션 컨테이너
- ✅ BottomTabItem 컴포넌트
- ✅ Active/Inactive 스타일 (text-white / text-zinc-400)

##### **Card, Button** (`primitives/`)
- ✅ 기본 UI 프리미티브 컴포넌트

---

#### 2. Map 페이지 (90% 완료)

**위치**: `apps/web/src/app/(tabs)/map/page.tsx`

##### ✅ 구현된 기능
1. **필터링**
   - 전체 / GOLD / 활성 필터 버튼
   - 실시간 필터링 로직
   - 필터 변경 시 선택된 장소 자동 조정

2. **장소 선택 & 지도 연동**
   - PlaceCard 클릭 → selectedPlaceId 업데이트
   - selectedPlaceId → Mapbox flyTo 애니메이션 (1000ms)
   - ring 스타일로 선택 상태 시각화

3. **Geolocation**
   - 현재 위치 자동 감지
   - 실패 시 기본 좌표 (강남) 사용
   - Analytics 이벤트 추적

4. **Mock 데이터**
   - 4개 장소:
     1. ZZIK LAB COFFEE (GOLD, green, 0.2km)
     2. 언더그라운드 이자카야 (yellow, 0.4km)
     3. 성수 베이글 팩토리 (GOLD, green, 0.5km)
     4. 서울숲 공원 산책로 (red, 1.9km)

##### ⚠️ 임시 구현 (추후 백엔드 연동 필요)
- 필터 로직 하드코딩:
  ```typescript
  // 'active' 필터: successRate >= 80 OR missions >= 10
  // 실제 비즈니스 로직으로 교체 필요
  ```
- Mock 데이터 사용 (API 호출 없음)

---

#### 3. Mapbox 통합 (95% 완료)

**위치**: `apps/web/src/components/zzik-map/MapboxCanvas.tsx`

##### ✅ 구현된 기능
1. **지도 렌더링**
   - Mapbox Dark Theme (dark-v11)
   - GeoJSON 기반 마커 표시
   - 클러스터링 (40px radius, maxZoom 14)

2. **마커 스타일링**
   - Traffic Signal 색상 (emerald/amber/rose)
   - GOLD stroke (amber-400)
   - 일반 stroke (zinc-800)
   - 라벨: ★ (GOLD) / ₩ (일반)

3. **인터랙션**
   - Cluster 클릭 → easeTo 애니메이션 (800ms)
   - Unclustered 클릭 → onPlaceClick 콜백
   - selectedPlaceId 변경 → flyTo (1000ms, zoom 15)
   - 마우스 커서 변경 (hover)

4. **Analytics 통합**
   - MAP_VIEWED
   - CLUSTER_CLICKED
   - MARKER_CLICKED
   - GEOLOCATION_SUCCESS/ERROR
   - FILTER_CHANGED
   - CARD_CLICKED

##### ⚠️ 미완성 기능
- 선택된 마커 시각적 강조 (stroke 두껍게)
  - 현재: 전역 circle-stroke-width 사용
  - 필요: data-driven styling으로 개선

---

#### 4. 타입 정의 (100% 완료)

**위치**: `apps/web/src/types/place.ts`

```typescript
export type TrafficSignal = 'green' | 'yellow' | 'red';

export type PlaceMetrics = {
  missions: number;
  successRate: number; // 0~100 (%)
  likes: number;
};

export type PlaceSummary = {
  id: string;
  name: string;
  category: string;
  lng: number;
  lat: number;
  distanceMeters: number;
  trafficSignal: TrafficSignal;
  isGold: boolean;
  benefitLabel?: string;
  benefitValue?: string;
  metrics?: PlaceMetrics;
};
```

---

#### 5. Analytics (100% 완료)

**위치**: `apps/web/src/lib/analytics/map-events.ts`

##### ✅ 추적 이벤트
- MAP_VIEWED
- FILTER_CHANGED
- CARD_CLICKED
- MARKER_CLICKED
- CLUSTER_CLICKED
- GEOLOCATION_SUCCESS
- GEOLOCATION_ERROR

---

### ❌ 미구현 프론트엔드 기능

1. **페이지 라우팅**
   - Search 페이지 (`/search`)
   - Saved 페이지 (`/saved`)
   - Profile 페이지 (`/profile`)
   - 현재: BottomTabs만 UI 존재, 실제 라우팅 없음

2. **미션 상세 페이지**
   - PlaceCard 클릭 시 미션 상세 모달/페이지
   - "GPS 찍고 시작하기" CTA
   - 미션 정보 상세 표시

3. **Error State & Loading**
   - API 실패 시 에러 UI
   - Skeleton Loading
   - Retry 버튼

4. **인증/로그인**
   - 없음 (백엔드 의존)

5. **실시간 데이터**
   - Traffic Signal 실시간 업데이트
   - 미션 참여자 수 실시간 카운트

---

## 🔧 백엔드 작업 현황

### ❌ 완전히 미구현 (0%)

**현재 상태**: 백엔드 서버 없음, API 없음, 데이터베이스 없음

#### 필요한 백엔드 기능 목록

##### 1. API 엔드포인트 (우선순위 순)

**P1 (High Priority)**:
```
GET  /api/places              # 주변 장소 목록 (필터링 포함)
GET  /api/places/:id          # 장소 상세 정보
POST /api/missions/:id/start  # 미션 시작 (GPS 인증)
GET  /api/user/profile        # 사용자 프로필
POST /api/auth/login          # 로그인
```

**P2 (Medium Priority)**:
```
GET  /api/missions            # 내 미션 목록
POST /api/places/:id/like     # 좋아요
GET  /api/places/saved        # 저장된 장소
POST /api/places/:id/save     # 장소 저장
```

**P3 (Low Priority)**:
```
GET  /api/analytics/map       # Map 이벤트 수집
POST /api/feedback            # 피드백 제출
GET  /api/notifications       # 알림
```

##### 2. 데이터베이스 스키마 (예상)

```sql
-- places (장소)
CREATE TABLE places (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  category VARCHAR(100),
  lng DECIMAL(10, 7),
  lat DECIMAL(10, 7),
  traffic_signal VARCHAR(10), -- 'green', 'yellow', 'red'
  is_gold BOOLEAN,
  benefit_label VARCHAR(255),
  benefit_value VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- missions (미션)
CREATE TABLE missions (
  id UUID PRIMARY KEY,
  place_id UUID REFERENCES places(id),
  user_id UUID REFERENCES users(id),
  status VARCHAR(50), -- 'pending', 'in_progress', 'completed', 'failed'
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  gps_verified BOOLEAN,
  created_at TIMESTAMP
);

-- place_metrics (장소 메트릭스)
CREATE TABLE place_metrics (
  id UUID PRIMARY KEY,
  place_id UUID REFERENCES places(id),
  missions_count INTEGER,
  success_rate DECIMAL(5, 2), -- 0~100
  likes_count INTEGER,
  updated_at TIMESTAMP
);

-- users (사용자)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255),
  name VARCHAR(100),
  created_at TIMESTAMP
);
```

##### 3. 기술 스택 추천

**옵션 A: Next.js API Routes** (간단, 빠른 프로토타입)
- Next.js 16 API Routes
- Supabase (PostgreSQL + Auth)
- Prisma ORM

**옵션 B: 독립 백엔드** (확장성, 마이크로서비스)
- Node.js + Express / Fastify
- PostgreSQL + PostGIS (지리 데이터)
- Redis (캐싱, Traffic Signal 실시간 업데이트)
- JWT 인증

**옵션 C: Serverless** (비용 최적화)
- Vercel Functions
- Supabase
- Upstash Redis

##### 4. 즉시 필요한 백엔드 작업

1. **`GET /api/places` 엔드포인트 구현**
   ```typescript
   // Query Parameters:
   // - lat, lng: 사용자 위치
   // - radius: 검색 반경 (meters)
   // - filter: 'all' | 'gold' | 'active'

   // Response:
   PlaceSummary[]
   ```

2. **Mock → API 전환**
   - `apps/web/src/app/(tabs)/map/page.tsx`의 `MOCK_PLACES` 제거
   - `fetch('/api/places')` 호출로 교체
   - Loading/Error 상태 추가

3. **필터 로직 백엔드 이동**
   - 'active' 필터 규칙 정의 (비즈니스 로직)
   - 서버에서 필터링 수행
   - 프론트엔드는 UI만 담당

---

## 📁 프로젝트 구조

```
zzik-live/
├── apps/
│   └── web/                        # Next.js 16 App
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx      # 루트 레이아웃
│       │   │   ├── page.tsx        # 홈 (/)
│       │   │   └── (tabs)/
│       │   │       ├── layout.tsx  # Tabs 레이아웃 (BottomTabs)
│       │   │       └── map/
│       │   │           └── page.tsx # Map 페이지 (메인)
│       │   ├── components/
│       │   │   └── zzik-map/
│       │   │       └── MapboxCanvas.tsx # Mapbox 통합
│       │   ├── lib/
│       │   │   └── analytics/
│       │   │       └── map-events.ts # Analytics
│       │   └── types/
│       │       └── place.ts        # 타입 정의
│       └── package.json
│
├── packages/
│   └── ui/                         # UI 컴포넌트 라이브러리
│       └── src/
│           ├── layout/
│           │   ├── map-shell.tsx   # MapShell, MapOverlay
│           │   └── bottom-tabs.tsx # BottomTabs
│           ├── domain/
│           │   └── place-card.tsx  # PlaceCard
│           ├── primitives/
│           │   ├── card.tsx
│           │   └── button.tsx
│           └── index.ts
│
├── tests/ux/                       # UX 테스트 (방금 구축)
│   └── map-basic.spec.ts
│
├── docs/ux/                        # UX 테스트 문서
│   ├── PLAYWRIGHT_SCENARIOS_ZZIK.md
│   ├── SCENARIOS_ENHANCED.md
│   └── UX_TESTING_GUIDE.md
│
├── scripts/
│   └── run-ux-test.sh
│
├── artifacts/
│   └── screenshots/                # UX 테스트 스크린샷
│
├── playwright-mcp.config.json
├── ux-agents.json
├── playwright.config.ts
└── package.json
```

---

## 🎯 우선순위별 다음 작업

### P0 (Critical - 즉시 필요)

1. **백엔드 기술 스택 결정**
   - Next.js API Routes vs 독립 백엔드 vs Serverless
   - 데이터베이스 선택 (Supabase, PostgreSQL, etc.)

2. **`GET /api/places` 구현**
   - 위치 기반 장소 검색
   - 필터링 로직 (all, gold, active)
   - Mock 데이터 마이그레이션

3. **프론트엔드 API 통합**
   - `MOCK_PLACES` → `fetch('/api/places')`
   - Loading/Error 상태 UI

### P1 (High Priority)

4. **환경 변수 설정**
   - `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` 설정 필요
   - 현재: 빈 문자열로 fallback

5. **나머지 페이지 라우팅**
   - `/search` 페이지
   - `/saved` 페이지
   - `/profile` 페이지

6. **미션 시작 플로우**
   - PlaceCard → 미션 상세 모달
   - GPS 인증
   - `POST /api/missions/:id/start`

### P2 (Medium Priority)

7. **Error Handling & Loading**
   - API 실패 시 Error Toast
   - Skeleton Loading
   - Retry 버튼

8. **인증/로그인**
   - 로그인 페이지
   - JWT/Session 관리
   - Protected Routes

9. **실시간 업데이트**
   - Traffic Signal WebSocket/Polling
   - 미션 참여자 수 실시간

### P3 (Low Priority)

10. **선택된 마커 강조**
    - data-driven styling
    - 선택 시 stroke 두껍게

11. **Performance 최적화**
    - 첫 로드 시간 개선 (현재 4.5초)
    - Code splitting
    - Image optimization

12. **CI/CD 통합**
    - GitHub Actions에서 Playwright 테스트 자동 실행

---

## 🔑 핵심 지표

### 프론트엔드 완성도
- **UI 컴포넌트**: 90% ✅
- **Map 페이지**: 90% ✅
- **Mapbox 통합**: 95% ✅
- **라우팅**: 25% ⚠️
- **Error Handling**: 10% ⚠️

### 백엔드 완성도
- **API**: 0% ❌
- **데이터베이스**: 0% ❌
- **인증**: 0% ❌

### 전체 프로젝트 완성도
**약 45%** (프론트엔드 MVP 완료, 백엔드 미착수)

---

## 📝 기술 부채

1. **하드코딩된 필터 로직**
   - `apps/web/src/app/(tabs)/map/page.tsx:98`
   - 'active' 필터: `successRate >= 80 || missions >= 10`
   - 백엔드 비즈니스 로직으로 이동 필요

2. **Mock 데이터**
   - 4개 장소만 존재
   - 실제 데이터베이스 연동 필요

3. **환경 변수 미설정**
   - Mapbox 토큰 필요
   - 현재: fallback으로 빈 문자열 사용

4. **선택된 마커 강조 미완성**
   - `MapboxCanvas.tsx:262`
   - data-driven styling 필요

5. **첫 로드 성능**
   - 4.5초 (compile 4.3초)
   - Turbopack 최적화 필요

6. **tailwind.config.ts Warning**
   - `[MODULE_TYPELESS_PACKAGE_JSON]` warning
   - `package.json`에 `"type": "module"` 추가 필요

---

## 💡 추천 다음 단계

### 옵션 A: 백엔드 우선 (권장)
1. Next.js API Routes로 빠른 프로토타입
2. Supabase 연동 (PostgreSQL + Auth)
3. `GET /api/places` 구현
4. 프론트엔드 API 통합

**예상 소요 시간**: 2-3일

### 옵션 B: 프론트엔드 완성 우선
1. 나머지 페이지 라우팅 (/search, /saved, /profile)
2. Error Handling & Loading
3. 미션 상세 페이지 (백엔드 없이 Mock)

**예상 소요 시간**: 1-2일

### 옵션 C: UX 테스트 완전 활성화
1. Playwright MCP 연결
2. MAP_BASIC_FLOW 완전 검증
3. 나머지 시나리오 실행 (FILTER, TABS, RESPONSIVE)

**예상 소요 시간**: 0.5일

---

## 🎉 완료된 작업 요약

✅ **이번 세션 완료**:
- UX 테스트 파이프라인 v1.0 구축 (100%)
- Playwright + MCP + Claude Agent 통합
- 5개 시나리오 정의 + Critical Assertions
- HTML 기반 MAP_BASIC_FLOW 부분 검증 (60%)

✅ **이전 완료**:
- Map 페이지 MVP (Mapbox + PlaceCard + 필터링)
- UI 컴포넌트 라이브러리
- Analytics 통합
- 디자인 시스템 (2026 모노톤)

---

**마지막 업데이트**: 2025-11-21 22:30 UTC
**다음 업데이트 필요 시점**: 백엔드 구현 시작 시
