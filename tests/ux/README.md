# ZZIK LIVE v4 - Playwright UX Tests

Playwright를 사용한 UX 시나리오 테스트 모음입니다.

## 📁 파일 구조

```
tests/ux/
├── README.md                    # 이 파일
├── map-basic.spec.ts           # 기본 Map UI 테스트
├── map-exploration.spec.ts     # 섹션 A: Map-first 탐색 UX (A1-A4)
└── mission-flow.spec.ts        # 섹션 B: MissionRun 실행 UX (B1-B4)
```

## 🎯 테스트 카테고리

### 기본 테스트 (map-basic.spec.ts)
- Map 페이지 기본 렌더링
- PlaceCard 표시
- 필터 기능
- 반응형 디자인

### 섹션 A: Map-first 탐색 UX (map-exploration.spec.ts)
- **A1**: 첫 진입 UX – 로딩 & 초기 뷰포트
- **A2**: PlaceCard 정보 구조
- **A3**: 필터 UX (전체 / GOLD / 활성)
- **A4**: 맵 ↔ 카드 양방향 인터랙션

### 섹션 B: MissionRun 실행 UX (mission-flow.spec.ts)
- **B1**: 미션 시작 버튼 – MissionRun 생성
- **B2**: MissionRun 상태 표시 – Stepper UI
- **B3**: GPS → QR → Reels → Review → Reward E2E
- **B4**: MissionRun 상태 조회 API와 UI 동기화

## 🚀 실행 방법

### 1. 개발 서버 시작

먼저 개발 서버가 실행 중이어야 합니다:

```bash
pnpm dev
```

### 2. 테스트 실행

#### 전체 테스트 실행
```bash
./scripts/run-ux-test.sh all
```

#### 특정 카테고리 실행
```bash
# Map 탐색 UX 테스트 (A1-A4)
./scripts/run-ux-test.sh map

# Mission Flow UX 테스트 (B1-B4)
./scripts/run-ux-test.sh mission

# 기본 테스트
./scripts/run-ux-test.sh basic
```

#### UI 모드로 실행 (권장)
```bash
./scripts/run-ux-test.sh ui
```

#### 디버그 모드
```bash
./scripts/run-ux-test.sh debug tests/ux/map-exploration.spec.ts
```

#### 테스트 리포트 보기
```bash
./scripts/run-ux-test.sh report
```

### 3. npx 직접 사용

```bash
# 모든 UX 테스트
npx playwright test tests/ux/

# 특정 파일만
npx playwright test tests/ux/map-exploration.spec.ts

# UI 모드
npx playwright test --ui

# 특정 테스트만 (grep)
npx playwright test --grep "UX_MAP_INITIAL_LOAD"
```

## 📊 테스트 결과 확인

테스트 실행 후 다음 위치에 결과가 저장됩니다:

- **HTML 리포트**: `playwright-report/`
- **스크린샷**: `artifacts/ux/`
- **비디오**: `test-results/` (실패 시)

## 📖 시나리오 문서 참조

모든 시나리오는 다음 문서에 상세히 정의되어 있습니다:

- **문서**: `docs/ux/PLAYWRIGHT_SCENARIOS_ZZIK.md`
- **섹션 A**: Map-first 탐색 UX (A1-A4)
- **섹션 B**: MissionRun 실행 UX (B1-B4)

## 🛠️ 테스트 작성 가이드

### data-testid 규칙

테스트에서 사용하는 주요 `data-testid`:

**Place Cards**:
- `place-card` - PlaceCard 컨테이너
- `place-name` - 장소명
- `place-meta` - 카테고리/위치 정보
- `place-reward` - 리워드 금액
- `badge-gold` - GOLD 뱃지
- `traffic-dot-*` - Traffic Signal 점

**Filters**:
- `filter-all` - 전체 필터
- `filter-gold` - GOLD 필터
- `filter-active` - 활성 필터

**Mission Steps**:
- `mission-start-button` - 미션 시작 버튼
- `mission-step-gps` - GPS 스텝
- `mission-step-qr` - QR 스텝
- `mission-step-reels` - Reels 스텝
- `mission-step-review` - Review 스텝
- `mission-step-reward` - Reward 스텝
- `mission-step-*-advance` - 테스트용 진행 버튼

### 스크린샷 저장

```typescript
await page.screenshot({
  path: path.join('artifacts', 'ux', 'test-name.png')
});
```

### API 요청 모니터링

```typescript
page.on('request', (request) => {
  if (request.url().includes('/api/missions')) {
    console.log('Mission API called:', request.url());
  }
});
```

## 🔧 CI/CD 통합

GitHub Actions 또는 Vercel에서 테스트 실행:

```yaml
- name: Run Playwright tests
  run: |
    pnpm install
    pnpm --filter web build
    npx playwright test tests/ux/
```

## ⚠️ 주의사항

1. **Dev 서버 필수**: 테스트 실행 전 `pnpm dev`로 서버 시작 필요
2. **DB Seed**: 테스트는 seed 데이터(4곳)가 있다고 가정
3. **UI 미구현**: 일부 테스트는 UI 구현 후 주석 해제 필요
   - Stepper UI (B2, B3)
   - 미션 시작 버튼 (B1)
   - 상태 배너 (B4)

## 📚 추가 리소스

- [Playwright 공식 문서](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Next.js Testing](https://nextjs.org/docs/testing)
