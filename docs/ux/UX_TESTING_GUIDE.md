# ZZIK LIVE v4 – UX Testing Guide

이 문서는 ZZIK LIVE v4의 UX 테스트 파이프라인(Claude Agent + Playwright MCP + 순수 Playwright)을 설명한다.

---

## 1. 전체 아키텍처

개발자가 자연어로 UX 시나리오를 지정하면, Claude Code가 Playwright MCP 서버를 통해 로컬 Chrome 브라우저를 조작한다.

```
Developer
│
▼
Claude Code (ux-tester agent)
│  MCP Protocol
▼
Playwright MCP Server
│  Browser Automation
▼
Chrome (http://localhost:3000)
```

또한 CI/CD 환경에서는 순수 Playwright 테스트(`@playwright/test`)로 자동 회귀 테스트를 수행한다.

---

## 2. 시나리오 정의 위치

- 기본 시나리오: `docs/ux/PLAYWRIGHT_SCENARIOS_ZZIK.md`
- Critical Assertions 포함 확장 시나리오: `docs/ux/SCENARIOS_ENHANCED.md`

시나리오를 변경하거나 추가할 때는 **반드시 이 두 파일만 수정**한다.
테스트 코드와 Claude Agent는 이 문서를 참조한다.

---

## 3. 로컬에서 Claude Agent로 실행하기

1) dev 서버 확인 및 준비

```bash
./scripts/run-ux-test.sh
```

* `http://localhost:3000` 응답 체크
* dev 서버 미실행 시 `pnpm --filter web dev` 자동 실행

2. Claude Code 실행

```bash
claude --add-dir . \
  --mcp-config playwright-mcp.config.json \
  --agents "$(cat ux-agents.json)"
```

3. Claude에게 지시

```text
ux-tester 에이전트로 동작해.
```

#### Step 3: 시나리오 실행

##### 예시 1: 단일 시나리오
```
MAP_BASIC_FLOW 시나리오를 실행하고 결과를 리포트해.

실행 단계:
1) dev 서버가 http://localhost:3000에서 실행 중인지 확인
2) /map 페이지 접속
3) PlaceCard 리스트 확인 및 스크롤
4) 첫 번째 카드 클릭
5) 스크린샷 촬영 (artifacts/screenshots/map-basic-flow.png)
6) 콘솔 로그 수집

리포트 형식:
- 발견된 문제 (있다면)
- 레이아웃 검증 결과
- 디자인 베이스라인 준수 여부
- 수정이 필요한 파일 및 제안
```

##### 예시 2: 필터 테스트
```
MAP_FILTER_FLOW 시나리오를 실행해.

검증 포인트:
- 필터 버튼 클릭 시 bg-zinc-50 스타일 변경 확인
- GOLD 필터: 2개 카드 표시 (ZZIK LAB COFFEE, 성수 베이글 팩토리)
- 활성 필터: successRate >= 80 || missions >= 10 조건 확인
- transition-colors 애니메이션 부드러움
```

##### 예시 3: 반응형 테스트
```
RESPONSIVE_TEST 시나리오를 다음 뷰포트로 실행해:
- iPhone 14 Pro Max (430x932)
- iPad Mini (768x1024)
- Desktop (1920x1080)

각 뷰포트에서 스크린샷 촬영하고, 레이아웃 깨짐 여부를 확인해.
```

##### 예시 4: 전체 배치 실행
```
다음 시나리오들을 순차 실행하고 종합 리포트를 작성해:

1. MAP_BASIC_FLOW
2. MAP_FILTER_FLOW
3. BOTTOM_TABS_NAV
4. PERFORMANCE_PROFILE

각 시나리오 결과를 스크린샷과 함께 정리하고,
전체적인 UX 품질 점수를 매겨줘.
```

---

## 4. 순수 Playwright 테스트 실행 (CI/로컬 공통)

```bash
pnpm exec playwright test tests/ux/map-basic.spec.ts
```

* CI에서는 GitHub Actions에서 자동으로 실행
* 실패 시 trace/screenshot/video가 자동 수집된다.

---

## 5. 트러블슈팅

* dev 서버 미실행
  → `pnpm --filter web dev` 수동 실행 후 `http://localhost:3000` 응답 확인
* MCP 연결 실패
  → `playwright-mcp.config.json` 경로/파일명, Claude CLI 인자 확인
* 스크린샷이 생성되지 않음
  → `artifacts/screenshots/` 디렉토리 존재 여부 및 쓰기 권한 확인
