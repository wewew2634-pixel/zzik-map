# ZZIK MAP - Browser Automation Setup Guide

## 📺 브라우저 자동화 설정 가이드

**Version**: 1.0
**Date**: 2025-11-27
**Technology**: Playwright (크롬 기반)
**Status**: ✅ 설정 완료

---

## 🚀 빠른 시작 (Quick Start)

### 자동화 실행
```bash
# 전체 자동화 (스크린샷 + A11y 감사)
pnpm browser:automation

# 스크린샷만 캡처
pnpm browser:screenshot

# E2E 테스트 실행
pnpm browser:test
```

---

## 📋 설치된 도구

### Playwright
- **상태**: ✅ 이미 설치됨
- **위치**: devDependencies
- **버전**: @playwright/test 1.57.0
- **브라우저**: Chromium (자동 다운로드)

### Puppeteer
- **상태**: ⚠️ 선택 사항
- **문제**: 일부 환경에서 호환성 문제
- **대체**: Playwright 사용 권장

---

## 🎯 사용 가능한 명령어

### Browser Automation Scripts
```json
{
  "browser:automation": "Playwright로 자동 테스트 실행",
  "browser:screenshot": "모든 페이지 스크린샷 캡처",
  "browser:test": "E2E 테스트 실행"
}
```

### 실행 방법
```bash
# 터미널에서
pnpm browser:automation

# 또는
npm run browser:automation

# 또는
yarn browser:automation
```

---

## 📸 자동화 기능

### 1. 페이지 테스트
테스트하는 페이지:
- `/` (홈페이지)
- `/explore` (탐색)
- `/journey` (여행 정보)

### 2. Viewport 테스트
3가지 화면 크기로 테스트:
- **Mobile**: 375px × 812px
- **Tablet**: 768px × 1024px
- **Desktop**: 1920px × 1080px

### 3. 접근성 감사 (Accessibility Audit)
자동으로 확인하는 항목:
- ✓ 이미지 alt 텍스트
- ✓ 버튼 라벨
- ✓ 폼 필드 레이블
- ✓ 링크 텍스트
- ✓ ARIA 속성

### 4. 성능 메트릭
수집하는 메트릭:
- DOM Content Loaded
- Load Event Duration
- Total Navigation Time

### 5. 스크린샷 캡처
저장 위치: `.test/screenshots/`

---

## 📊 출력 예시

```
🌐 Starting Browser Automation with Playwright...

📱 Launching Chromium...

📄 Testing: /
   ✓ mobile
     - Title: ZZIK MAP
     - URL: http://localhost:3000/
     - Elements: 12 links, 8 buttons, 5 images
     ✓ No a11y issues detected
     📸 Screenshot: .test/screenshots/home-mobile-1732705251000.png

   ✓ tablet
     - Title: ZZIK MAP
     - URL: http://localhost:3000/
     - Elements: 12 links, 8 buttons, 5 images
     ✓ No a11y issues detected
     📸 Screenshot: .test/screenshots/home-tablet-1732705251500.png

   ✓ desktop
     - Title: ZZIK MAP
     - URL: http://localhost:3000/
     - Elements: 12 links, 8 buttons, 5 images
     ✓ No a11y issues detected
     📸 Screenshot: .test/screenshots/home-desktop-1732705252000.png

⚡ Performance Metrics:
   - DOM Content Loaded: 145ms
   - Load Event: 89ms
   - Total Duration: 1234ms

✅ Browser automation completed!

📸 Screenshots saved to: .test/screenshots/
```

---

## 🔧 설정 파일

### .claude/mcp-config.json
```json
{
  "mcpServers": {
    "puppeteer": { ... },
    "filesystem": { ... },
    "bash": { ... }
  }
}
```

### scripts/browser-automation.ts
- Playwright 기반 자동화 스크립트
- 모든 페이지와 viewport 테스트
- 접근성 감사 포함
- 스크린샷 자동 저장

---

## 📁 생성되는 파일

### 스크린샷 저장 구조
```
.test/
└── screenshots/
    ├── home-mobile-1732705251000.png
    ├── home-tablet-1732705251500.png
    ├── home-desktop-1732705252000.png
    ├── explore-mobile-1732705253000.png
    ├── explore-tablet-1732705253500.png
    ├── explore-desktop-1732705254000.png
    ├── journey-mobile-1732705255000.png
    ├── journey-tablet-1732705255500.png
    └── journey-desktop-1732705256000.png
```

---

## ⚡ 성능 최적화

### 빠른 실행 (Fast Mode)
특정 페이지만 테스트:
```bash
# 스크립트 수정 후
PAGES='[{path: "/", name: "home"}]'
pnpm browser:automation
```

### 병렬 실행
여러 브라우저 인스턴스:
```typescript
// 스크립트에서 수정
const PARALLEL_PAGES = 3; // 동시에 3개 페이지 처리
```

### CI/CD 통합
```yaml
# GitHub Actions 예시
- name: Browser Automation
  run: pnpm browser:automation
  timeout-minutes: 5

- name: Upload Screenshots
  uses: actions/upload-artifact@v3
  with:
    name: screenshots
    path: .test/screenshots/
```

---

## 🐛 문제 해결

### 문제: "Chromium이 없습니다" (Chromium not found)
```bash
# 해결: 브라우저 설치
npx playwright install chromium
```

### 문제: 타임아웃 (Timeout)
```bash
# 해결: 타임아웃 증가
# scripts/browser-automation.ts에서:
await newPage.goto(url, {
  waitUntil: 'networkidle',
  timeout: 60000  // 60초로 증가
});
```

### 문제: 메모리 부족 (Out of Memory)
```bash
# 해결: 메모리 할당 증가
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm browser:automation
```

### 문제: 개발 서버 연결 안 됨 (Dev server not connecting)
```bash
# 해결: 개발 서버 먼저 시작
pnpm dev  # 다른 터미널에서
pnpm browser:automation  # 이 터미널에서
```

---

## 📖 사용 사례

### 1. 자동 회귀 테스트 (Regression Testing)
```bash
# 스크린샷 캡처
pnpm browser:screenshot

# 변경 후 비교
pnpm browser:screenshot

# 이전과 현재 비교
diff .test/screenshots/home-desktop-*.png
```

### 2. 성능 모니터링
```bash
# 시간 경과에 따른 성능 추적
for i in {1..5}; do
  pnpm browser:automation
  sleep 60
done
```

### 3. CI/CD 파이프라인 통합
```yaml
# 자동 배포 전 테스트
- name: Run Browser Automation
  run: pnpm browser:automation

- name: Check Results
  run: |
    if [ -d ".test/screenshots" ]; then
      echo "✓ Automation passed"
    else
      echo "✗ Automation failed"
      exit 1
    fi
```

### 4. 접근성 모니터링
```bash
# 자동으로 a11y 문제 감지
pnpm browser:automation | grep "A11y Issues"
```

---

## 🎯 확장 기능

### 1. Visual Regression Testing
```typescript
// 이전 스크린샷과 비교
import { comparePNGs } from 'pixelmatch';
const diff = comparePNGs(previousImg, currentImg);
```

### 2. Custom Metrics
```typescript
// 사용자 정의 메트릭 수집
const metrics = await page.evaluate(() => ({
  customMetric: window.performance.now(),
}));
```

### 3. API Testing
```typescript
// 브라우저 테스트 중 API 호출 확인
await page.on('response', (response) => {
  console.log(`${response.request().method()} ${response.url()}`);
});
```

### 4. Form Testing
```typescript
// 폼 자동 채우기 및 제출
await page.fill('input[name="email"]', 'test@example.com');
await page.click('button[type="submit"]');
```

---

## 📚 참고 자료

### Playwright 문서
- [Playwright 공식 문서](https://playwright.dev)
- [API Reference](https://playwright.dev/docs/api/class-page)
- [Best Practices](https://playwright.dev/docs/best-practices)

### ZZIK MAP 문서
- [SELF_HEALING_WORKFLOW.md](./app/SELF_HEALING_WORKFLOW.md)
- [ERROR_HEALING_GUIDE.md](./app/ERROR_HEALING_GUIDE.md)
- [PHASE_7_FINAL_SUMMARY.md](./app/PHASE_7_FINAL_SUMMARY.md)

---

## 🔄 워크플로우 통합

### 개발 중 (During Development)
```bash
# 1. 개발 서버 시작
pnpm dev

# 2. 다른 터미널에서 자동화
pnpm browser:automation

# 3. 스크린샷 검토
open .test/screenshots/
```

### 커밋 전 (Before Commit)
```bash
# 1. 자동화 실행
pnpm browser:automation

# 2. 스크린샷 변경사항 확인
git diff .test/screenshots/

# 3. 문제 없으면 커밋
git add .test/screenshots/
git commit -m "Update screenshots"
```

### 배포 전 (Before Deployment)
```bash
# 1. 전체 테스트
pnpm diagnose
pnpm test
pnpm browser:automation

# 2. 빌드 확인
pnpm build

# 3. 배포
pnpm deploy
```

---

## 💡 팁과 트릭

### 빠른 테스트
```bash
# 모바일만 테스트
# scripts/browser-automation.ts에서:
const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 }
];
```

### 특정 페이지만
```bash
# 홈페이지만 테스트
// scripts/browser-automation.ts에서:
const PAGES = [{ path: '/', name: 'home' }];
```

### 스크린샷 자동 업로드
```bash
# AWS S3에 업로드
aws s3 cp .test/screenshots/ s3://my-bucket/screenshots/ --recursive
```

---

## ✅ 체크리스트

### 첫 설정 시
- [ ] Playwright 설치 완료
- [ ] 개발 서버 실행 중
- [ ] `pnpm browser:automation` 성공
- [ ] 스크린샷 생성 확인
- [ ] 접근성 문제 없음

### 정기 확인
- [ ] 새 페이지는 자동화에 포함
- [ ] 모든 viewport 테스트
- [ ] 성능 메트릭 확인
- [ ] 접근성 문제 모니터링

---

## 🚀 다음 단계

### Phase 8+ Roadmap
- Visual regression testing 자동화
- 성능 벤치마킹
- API 모니터링
- 실시간 알림 시스템

---

**상태**: ✅ **설정 완료 및 준비됨**

브라우저 자동화가 완전히 설정되었으며 즉시 사용 가능합니다.

---

생성 일시: 2025-11-27
마지막 업데이트: 2025-11-27
상태: 생산 준비 완료
