# ZZIK MAP - Claude Code Project Guide
## V7 Final: AI-Powered K-Travel Discovery Platform

> **최종 업데이트**: 2025-11-27 | **버전**: v7.0

---

## 프로젝트 개요

**ZZIK MAP**은 외국인 관광객이 사진을 업로드하면 군중 지혜(Crowd Wisdom) 기반으로 다음 여행지를 추천받는 K-여행 발견 플랫폼입니다.

### 원라이너
> "사진 한 장으로 847명의 여행자가 다음에 어디로 갔는지 알 수 있다"

### 브랜드
- **의미**: ZZIK = 찍다(Capture) + 찍다(Pin) + 고르다(Pick)
- **슬로건**: "Discover Real Korea Through Photos"
- **타겟**: 외국인 관광객 (연 1,637만명) + 한국 MZ세대

---

## 핵심 기능 (V6)

### 1. Journey Intelligence (Phase 1) - **M6 완성 목표**
```
사용자: 여행 사진 업로드
ZZIK: "847명의 유사 여행자가 다음으로 성수동에 갔습니다 (78%)"
```

### 2. Vibe Matching (Phase 2) - **M9 완성 목표**
```
사용자: "이 분위기의 카페 찾아줘" + 사진
ZZIK: "어니언 성수 (89% 매칭)"
```

### 3. MAP BOX (Phase 3) - **M12 완성 목표**
```
비즈니스: 체험 등록 → 크리에이터: 방문/콘텐츠 제작
ZZIK: 20% 수수료 + Vibe 데이터 축적
```

---

## 기술 스택

```yaml
Frontend: Next.js 15.5, TypeScript 5.6, Tailwind CSS 3.4, Catalyst UI Kit
Backend:  Supabase (PostgreSQL + pgvector), Supabase Auth
AI:       Gemini 2.0 Flash (Vision), pgvector 0.7+
Maps:     Kakao Maps (Korea)
i18n:     6개 언어 (ko, en, ja, zh-CN, zh-TW, th)
Testing:  Vitest, Playwright, MSW
```

---

## 디자인 시스템: Catalyst UI Kit

ZZIK MAP은 **Tailwind Plus Catalyst UI Kit** (27개 프로덕션급 컴포넌트)를 사용합니다.

### 컴포넌트 카테고리
```
Layout (5):     sidebar-layout, sidebar, navbar, stacked-layout, auth-layout
Form (10):      button, input, textarea, select, checkbox, radio, switch, fieldset, combobox, listbox
Display (7):    avatar, badge, table, description-list, text, heading, divider
Overlay (3):    dialog, dropdown, alert
Navigation (2): link, pagination
```

### 사용법
```tsx
import { Button, Input, Avatar, Dialog } from '@/components/catalyst'
```

### 참조
- **Design System V3**: `/docs/DESIGN_SYSTEM_V3.md`
- **Frontend Agent**: `/.claude/agents/zzik-frontend.md`

---

## 프로젝트 구조

```
/home/ubuntu/zzik-map/
├── CLAUDE.md              # 이 파일 (프로젝트 가이드)
├── README.md              # 프로젝트 README
├── .gitignore             # Git ignore 규칙
├── /.claude               # Claude Code 설정
│   ├── /agents            # 전문 에이전트 (11개)
│   ├── /commands          # 슬래시 명령어 (7개)
│   ├── /skills            # 개발 스킬 (14개)
│   ├── /scripts           # 자동화 스크립트
│   └── claude.json        # 메인 MCP 설정
├── /docs                  # 전략/기술 문서
│   ├── BUSINESS_PLAN_V6_FINAL.md  # 최신 비즈니스 플랜
│   ├── ZZIK_IR_DECK_V6_FINAL.md   # 최신 IR 덱
│   ├── DESIGN_SYSTEM_V3.md        # 디자인 시스템
│   └── /archive                   # 구버전 문서
└── /app                   # Next.js 애플리케이션
    ├── /src
    │   ├── /app           # App Router 페이지
    │   ├── /components    # React 컴포넌트
    │   ├── /hooks         # 커스텀 훅
    │   ├── /lib           # 유틸리티
    │   ├── /types         # TypeScript 타입
    │   ├── /stores        # Zustand 상태관리
    │   └── /i18n          # 다국어 지원
    ├── /public            # 정적 자산
    └── /supabase          # DB 마이그레이션
```

---

## 사용 가능한 에이전트

### 전략 & 분석 (상위 레벨)
| Agent | 버전 | 설명 |
|-------|------|------|
| `uxui-mastery-v7` | V7 | 행동심리학 & 인지심리학 기반 UX/UI 마스터리 |
| `cognitive-principles-v7` | V7 | 행동심리학 & 의사결정 프레임워크 |
| `uxui-audit-v4` | V4 | 16차원 체계적 UX/UI 감사 |

### 기능 개발 (중간 레벨)
| Agent | 버전 | 설명 |
|-------|------|------|
| `zzik-frontend` | V3 | Catalyst UI Kit 기반 프론트엔드 개발 |
| `zzik-journey` | V2 | Journey Intelligence 개발 |
| `zzik-vibe` | V2 | Vibe Matching 개발 |
| `zzik-mapbox` | V2 | MAP BOX 마켓플레이스 개발 |
| `nano-uxui` | V3 | 원자 수준 QA & 자동 수정 |

### 인프라 & 지원 (기반 레벨)
| Agent | 버전 | 설명 |
|-------|------|------|
| `zzik-database` | Core | Supabase & pgvector 관리 |
| `zzik-ai` | Core | Gemini API 통합 |
| `zzik-testing` | Core | Vitest, Playwright, MSW 테스트 |

---

## 사용 가능한 스킬

### 핵심 UX/UI 기초
| Skill | 버전 | 설명 |
|-------|------|------|
| `design-tokens` | V3 | 4계층 토큰 아키텍처 |
| `animation-system` | V3 | 60fps 모션 디자인 |
| `responsive-design` | V3 | 모바일 우선 & 유동 타이포그래피 |
| `zzik-ui-patterns` | V4 | 7가지 ZZIK 핵심 패턴 |

### 세부 상호작용 & 전략
| Skill | 버전 | 설명 |
|-------|------|------|
| `microinteractions-v4` | V4 | 10가지 마이크로인터랙션 |
| `motion-economics-v7` | V7 | 애니메이션 ROI 분석 |
| `data-driven-design-v7` | V7 | 메트릭 & 데이터 기반 설계 |
| `state-machines-v7` | V7 | 완전한 상태 전이도 |

### 기술 지원
| Skill | 버전 | 설명 |
|-------|------|------|
| `photo-processing` | Core | EXIF 추출, 압축, 검증 |
| `pgvector-optimization` | Core | 벡터 검색 최적화 |
| `i18n-implementation` | Core | next-intl 설정 & 번역 패턴 |
| `browser-automation` | V2 | Playwright 시각적 QA |
| `accessibility-audit` | V2 | WCAG 2.1 AA 준수 |
| `performance-optimization` | V2 | Core Web Vitals 최적화 |

---

## 사용 가능한 명령어

| 명령어 | 설명 |
|--------|------|
| `/zzik-dev` | 개발 환경 시작 |
| `/zzik-status` | 프로젝트 상태 확인 |
| `/zzik-build` | 프로덕션 빌드 |
| `/zzik-test` | 테스트 실행 (단위, E2E, 커버리지) |
| `/zzik-db` | 데이터베이스 작업 (마이그레이션, 시드, 백업) |
| `/zzik-deploy` | 배포 (스테이징, 프로덕션, 롤백) |
| `/zzik-i18n` | 번역 관리 (6개 언어) |

---

## 빠른 시작

```bash
# 1. 프로젝트로 이동
cd /home/ubuntu/zzik-map/app

# 2. 의존성 설치
pnpm install

# 3. 환경 설정
cp .env.example .env.local
# .env.local 편집

# 4. 개발 서버 시작
pnpm dev

# 5. 타입 검사
pnpm type-check

# 6. 린트 검사
pnpm lint

# 7. Browser MCP 테스트
pnpm browser:mcp:test
```

---

## 브랜드 컬러

```css
--zzik-coral: #FF5A5F;      /* Primary */
--deep-space: #0A1628;      /* Background */
--electric-cyan: #00D9FF;   /* Accent */
```

---

## 개발 로드맵 (V6 기준)

| Phase | 기간 | 목표 | KPI |
|-------|------|------|-----|
| 1 | M1-M6 | Journey Intelligence 100% | MAU 1,000명, 월 50만원 |
| 2 | M7-M9 | Vibe Matching | 500 임베딩 |
| 3 | M10-M12 | MAP BOX | 파트너 15곳, 크리에이터 60명 |

---

## 핵심 기술 사양 (V6)

| 기술 | 사양 | 비고 |
|------|------|------|
| GPS 추출 | 50-60% EXIF + 40-85% AI | 3단계 폴백 |
| 추천 | Content-Based → Hybrid → Collaborative (M12+) | 단계적 진화 |
| Vibe 임베딩 | 128-dim pgvector | IVFFlat O(sqrt(n)) |
| API | Gemini 2.0 Flash Vision | M4 유료 티어 |
| 인프라 비용 | 110만원/년 | V5 대비 93% 절감 |

---

## 참조 문서

### 최신 문서 (V6 기준)
- **비즈니스 플랜**: `/docs/BUSINESS_PLAN_V6_FINAL.md`
- **IR 덱**: `/docs/ZZIK_IR_DECK_V6_FINAL.md`
- **디자인 시스템**: `/docs/DESIGN_SYSTEM_V3.md`

### V7 프레임워크 문서
- **V7 요약**: `/.claude/V7_FRAMEWORK_SUMMARY.md`
- **V7 빠른 참조**: `/.claude/V7_QUICK_REFERENCE.md`

### 구버전 (아카이브)
- `/docs/archive/` - V5 문서 보관

---

## 핵심 메시지

```
"사진 한 장으로 다음 여행지를 알 수 있다"
"AI가 분위기를, 군중이 발견을 담당한다"
"데이터가 쌓이면 누구도 따라올 수 없다"
```

---

*Version: v7.0 | Updated: 2025-11-27*
*V7 Complete: UX/UI Mastery Framework with behavioral psychology, cognitive principles, motion economics, data-driven design, and state machines*
*Agents: 11개 (uxui-mastery-v7, cognitive-principles-v7, uxui-audit-v4, zzik-frontend, zzik-journey, zzik-vibe, zzik-mapbox, zzik-database, zzik-ai, zzik-testing, nano-uxui)*
*Skills: 14개 (design-tokens, animation-system, responsive-design, zzik-ui-patterns, microinteractions-v4, motion-economics-v7, data-driven-design-v7, state-machines-v7, photo-processing, pgvector-optimization, i18n-implementation, browser-automation, accessibility-audit, performance-optimization)*
