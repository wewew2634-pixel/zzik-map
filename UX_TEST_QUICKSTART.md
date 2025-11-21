# 🚀 ZZIK v4 UX 테스트 파이프라인 실행 가이드

## 📌 기준 레포 원칙 (중요!)

- **작업 기준 레포**: 항상 `/home/ubuntu/work/zzik-live` 단일 레포만 사용
- **과거 레포**: `/home/ubuntu/work/zzik-map` 프로젝트는 더 이상 사용 안 함 (백업됨: `_archive/zzik-map-20251121.tar.gz`)
- **모든 작업**: `zzik-live` 모노레포 구조(`apps/*`, `packages/*`) 기준으로만 진행

---

## ✅ 현재 상태

- ✅ dev 서버 실행 중: http://localhost:3000
- ✅ 모든 설정 파일 준비 완료
- ✅ 시나리오 정의 완료 (5개 기본 + Critical Assertions)
- ✅ artifacts/screenshots/ 디렉토리 생성 완료

---

## 🎯 실행 방법

### 1. 새 터미널 열기

**Windows Terminal** 또는 **VSCode Terminal** 새 탭

### 2. Claude Agent 모드 시작

```bash
cd /home/ubuntu/work/zzik-live

claude --add-dir . \
  --mcp-config playwright-mcp.config.json \
  --agents "$(cat ux-agents.json)"
```

### 3. 에이전트 활성화

새 Claude 세션에서:

```
ux-tester 에이전트로 동작해.
```

### 4. 시나리오 실행

#### 📌 기본 실행
```
MAP_BASIC_FLOW 시나리오를 실행하고 결과를 리포트해.
```

#### 📌 상세 실행
```
MAP_BASIC_FLOW 시나리오를 실행하고 결과를 리포트해.

실행 조건:
- docs/ux/SCENARIOS_ENHANCED.md의 Critical Assertions를 모두 검증
- 각 단계마다 스크린샷을 artifacts/screenshots/에 저장
- 7섹션 구조의 리포트 작성 (시나리오 메타, 실행 로그, Critical Assertions, UX 검증, 콘솔 이슈, 개선 제안, 최종 판정)
```

#### 📌 배치 실행
```
다음 시나리오들을 순차 실행하고 종합 리포트를 작성해:

1. MAP_BASIC_FLOW
2. MAP_FILTER_FLOW
3. BOTTOM_TABS_NAV

각 시나리오 결과를 스크린샷과 함께 정리하고,
전체적인 UX 품질을 평가해줘.
```

---

## 📊 사용 가능한 시나리오

1. **MAP_BASIC_FLOW**: Map 페이지 기본 플로우 (PlaceCard, flyTo 애니메이션)
2. **MAP_FILTER_FLOW**: 필터 버튼 동작 (전체/GOLD/활성)
3. **BOTTOM_TABS_NAV**: 하단 탭 네비게이션
4. **RESPONSIVE_TEST**: 반응형 레이아웃 (Desktop/Tablet/Mobile)
5. **PERFORMANCE_PROFILE**: 성능 측정 (FCP, LCP)

자세한 내용: `docs/ux/SCENARIOS_ENHANCED.md`

---

## 📁 결과 확인

### 스크린샷
```bash
ls -lh artifacts/screenshots/
```

### Windows 탐색기로 열기
```bash
explorer.exe artifacts/screenshots/
```

---

## 🔧 트러블슈팅

### Issue: dev 서버가 응답 없음
```bash
# 현재 터미널에서 확인
curl http://localhost:3000

# 실패하면 재시작
pkill -f "next dev"
pnpm --filter web dev
```

### Issue: MCP 연결 실패
```bash
# playwright-mcp.config.json 경로 확인
cat playwright-mcp.config.json

# MCP 서버 수동 테스트
npx -y @executeautomation/playwright-mcp-server@latest
```

---

## 📚 추가 문서

- **시나리오 정의**: `docs/ux/PLAYWRIGHT_SCENARIOS_ZZIK.md`
- **Critical Assertions**: `docs/ux/SCENARIOS_ENHANCED.md`
- **상세 가이드**: `docs/ux/UX_TESTING_GUIDE.md`

---

## 💡 Tips

1. **데이터 수정**: 실제 PlaceCard 데이터와 셀렉터를 맞추세요
   - `data-testid` 속성 추가
   - 필터 조건 (GOLD 개수, 활성 개수) 확인

2. **CI/CD 통합**: GitHub Actions에서는 순수 Playwright 사용
   ```yaml
   - name: Run UX Tests
     run: pnpm exec playwright test tests/ux/map-basic.spec.ts
   ```

3. **스크린샷 비교**: 매 실행마다 스크린샷을 비교해서 UI 변경 추적

---

🎉 **파이프라인 구축 완료!** 이제 바로 실행하실 수 있습니다.
