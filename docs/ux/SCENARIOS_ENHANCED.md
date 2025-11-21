# ZZIK LIVE v4 – Enhanced UX Scenarios (with Critical Assertions)

각 시나리오마다 최소 5개 이상의 Critical Assertions를 정의한다.
하나라도 FAIL이면 시나리오 전체를 FAIL로 판정한다.

---

## MAP_BASIC_FLOW

### 목표

Map 페이지 로드 후 PlaceCard 리스트와 Mapbox flyTo 동작, GOLD 뱃지 스타일을 검증한다.

### Critical Assertions

| # | Assertion                   | 기대값                                    | 판정 기준 (예시)                                                                 |
|---|-----------------------------|-------------------------------------------|----------------------------------------------------------------------------------|
| 1 | PlaceCard 렌더링 개수          | 4개                                       | `document.querySelectorAll('[data-testid="place-card"]').length === 4`        |
| 2 | MapShell 레이아웃 존재        | true                                      | `document.querySelector('.relative.flex.h-screen') !== null`                     |
| 3 | 첫 카드 클릭 후 flyTo 실행     | 1000ms 이내 center 변경                    | Mapbox center 좌표 변경 + `duration ≈ 1000` (Mapbox debug 로그 or state로 확인) |
| 4 | 콘솔 에러                     | 0개                                       | `console.error` 호출 없음                                                       |
| 5 | GOLD 뱃지 스타일              | `text-amber-500` & `border-amber-500/80` | 첫 번째 카드 내 GOLD 뱃지 요소의 클래스/스타일 검사                             |

---

## MAP_FILTER_FLOW

### Critical Assertions (개요)

1. 초기 렌더링: 필터 버튼 3개(`전체`, `GOLD`, `활성`) 모두 존재
2. `전체` 활성 시 카드 4개
3. `GOLD` 클릭 시 GOLD 등급 카드만 2개 노출
4. `활성` 클릭 시 successRate ≥ 80 또는 missions ≥ 10인 카드만 3개
5. 활성/비활성 버튼 스타일이 Tailwind 토큰에 맞게 변경

---

## BOTTOM_TABS_NAV

- Map / Search / Saved / Profile 탭 존재
- 각 탭 클릭 시 URL 및 active 스타일 동기화
- 브라우저 새로고침 후에도 active 탭과 URL이 일관

---

## RESPONSIVE_TEST

- 각 뷰포트별로 Map/Overlay/탭 위치가 명세대로 변하는지
- 모바일에서 드래그 핸들만 나타나는지
- 터치 타깃 최소 크기 충족 여부(44×44px 기준)

---

## PERFORMANCE_PROFILE

- FCP, LCP, Mapbox 로드 시간, PlaceCard 렌더링 시간 측정
- 지정한 임계값 초과 시 FAILURE로 기록
