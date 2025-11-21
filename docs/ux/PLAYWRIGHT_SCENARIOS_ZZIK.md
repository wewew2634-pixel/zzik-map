# ZZIK LIVE v4 – Playwright UX Scenarios (Basic)

단일 진실 공급원(Single Source of Truth)으로 사용하는 기본 UX 시나리오 정의입니다.
각 시나리오는 고유 ID를 가지며, Claude Agent와 Playwright 테스트 모두 이 문서를 참조합니다.

---

## Scenario A: MAP_BASIC_FLOW

- ID: `MAP_BASIC_FLOW`
- 목표:
  Map 페이지 로드 → PlaceCard 리스트 확인 → 첫 카드 클릭 → 맵 flyTo 애니메이션 확인

### 주요 단계

1. `/map` 페이지 접속 (`http://localhost:3000/map`)
2. `MapShell` 레이아웃 존재 여부 확인
   - `.relative.flex.h-screen` 컨테이너
3. 초기 PlaceCard 개수 확인
   - 예상: 4개
4. 첫 번째 카드(예: `ZZIK LAB COFFEE`) 클릭
5. Mapbox `flyTo` 애니메이션 실행 확인
   - center 좌표 변경
   - duration ≈ 1000ms
6. GOLD 뱃지 스타일 확인
   - 텍스트 색: `text-amber-500`
   - 테두리: `border-amber-500/80`

---

## Scenario B: MAP_FILTER_FLOW

- ID: `MAP_FILTER_FLOW`
- 목표:
  필터 버튼(`전체`, `GOLD`, `활성`) 클릭 시 PlaceCard 목록 필터링 동작 확인

### 주요 단계

1. 초기 상태:
   - 활성 필터: `전체`
   - 카드: 4개
2. `GOLD` 버튼 클릭
   - 카드: 2개
   - 예: `ZZIK LAB COFFEE`, `성수 베이글 팩토리`
3. `활성` 버튼 클릭
   - 카드: 3개
   - 조건: `successRate >= 80` 또는 `missions >= 10`
4. 버튼 스타일 상태
   - 활성: `bg-zinc-50 text-zinc-900`
   - 비활성: `bg-zinc-800 text-zinc-300`

---

## Scenario C: BOTTOM_TABS_NAV

- ID: `BOTTOM_TABS_NAV`
- 목표:
  하단 탭 Map → Search → Saved → Profile 전환 시 라우팅 및 active 상태 확인

### 주요 단계

1. 초기: Map 탭 활성 (`/map`, 텍스트 색 `text-white` 등)
2. Search 탭 클릭 → URL `/search` 변경, Search 탭 활성
3. Saved 탭 클릭 → URL `/saved` 변경, Saved 탭 활성
4. Profile 탭 클릭 → URL `/profile` 변경, Profile 탭 활성

---

## Scenario D: RESPONSIVE_TEST

- ID: `RESPONSIVE_TEST`
- 목표:
  Desktop / Tablet / Mobile 뷰포트에서 레이아웃 변화 확인

### 뷰포트

- Desktop: 1920×1080
- Tablet: 768×1024
- Mobile: 430×932 (iPhone 14 Pro Max)

### 검증 포인트

- 드래그 핸들: 모바일에서만 표시 (`.md:hidden`)
- Overlay 위치: Desktop → 좌측, Mobile → 하단
- 터치 타깃: 모바일에서 최소 44×44px 확보

---

## Scenario E: PERFORMANCE_PROFILE

- ID: `PERFORMANCE_PROFILE`
- 목표:
  초기 렌더링 성능 및 주요 UX 요소의 시간 측정

### 측정 항목 (대략적 목표 값)

- FCP (First Contentful Paint) < 1.8초
- LCP (Largest Contentful Paint) < 2.5초
- PlaceCard 렌더링 시간 < 500ms
- Mapbox 로드 시간 < 1.5초
