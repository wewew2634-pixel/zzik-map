# ZZIK Map - Claude Code Configuration
## 외국인 관광객 특화 위치기반 스테이블코인 결제 플랫폼

**Status**: ✅ Ready for Development
**Last Updated**: 2025-11-24
**Strategy**: Scenario 5 - Dual Entity (Korea + AIFC)

This directory contains custom agents, skills, and commands for ZZIK Map development.

---

## 🎯 Project Vision

> **"Google Maps for Korea, but with Web3 payments"**

외국인 관광객을 위한 한국 특화 위치기반 플랫폼 + 스테이블코인 결제 인프라

### 핵심 차별점

1. **구글맵 문제 해결**: 한국 내비게이션 제한, 로컬 정보 부족 해결
2. **Web3 결제**: USDT/USDC 스테이블코인으로 환전 없이 결제
3. **이중 법인 구조**: 한국 법령 준수 + AIFC 라이선스 (글로벌 확장)
4. **LLM 슈퍼앱 연동**: ChatGPT, HyperCLOVA X 파트너십

---

## 🚀 Quick Start

### Always Activate All Agents/Skills

```bash
/zzik-start
```

이 명령어는 모든 ZZIK agents와 skills를 활성화합니다.

---

## 📂 Structure

```
.claude/
├── README.md                    # This file
├── commands/                    # Slash commands
│   ├── zzik-start.md           # Activate all agents/skills
│   ├── zzik-security.md        # Security work (GPS, PII)
│   ├── zzik-frontend.md        # Frontend development
│   ├── zzik-database.md        # Database work
│   └── zzik-api.md             # API integration
├── agents/                      # Custom agents (5 total)
│   ├── zzik-aifc-legal.md      # AIFC licensing, compliance
│   ├── zzik-web3-payment.md    # Stablecoin payment integration
│   ├── zzik-global-expansion.md # LLM partnerships, i18n
│   ├── zzik-verify-agent.md    # 작업 검증, 누락 사항 체크
│   └── zzik-self-heal-agent.md # 자기치유 성장형 시스템
├── skills/                      # Custom skills (6 total)
│   ├── zzik-dual-entity-strategy/       # Legal separation patterns
│   ├── zzik-stablecoin-integration/     # USDT/USDC payment patterns
│   ├── zzik-government-grants/          # 정부지원사업 자동화
│   ├── zzik-prisma-patterns/            # Database best practices
│   ├── zzik-verification-patterns/      # GPS/QR verification
│   └── zzik-react-query-patterns/       # Frontend state management
└── settings.json               # Claude Code settings
```

---

## 🤖 Custom Agents

### 1. zzik-aifc-legal

**Purpose**: AIFC 라이선스 신청, 법적 준수, 이중 법인 구조 관리
**Responsibilities**:
- AIFC LAB 신청서 작성 가이드
- AML/KYC 정책 문서화
- 한국 외국환거래법 검토
- 이중 법인 경계 명확화 (ZZIK Korea vs ZZIK Global)

**Triggers**: `zzik-aifc-legal`, `zzik-compliance`, `zzik-dual-entity`, `zzik-regulatory`, `zzik-aml-kyc`

**Use Cases**:
- AIFC LAB 신청서 필수 항목 확인
- 한국 거주자 서비스 분리 검증
- 스테이블코인 규제 합법성 확인

---

### 2. zzik-web3-payment

**Purpose**: 스테이블코인 결제 시스템 통합, MetaMask/자체 지갑 개발, FDS 구축
**Responsibilities**:
- USDT/USDC 컨트랙트 연동 (Ethereum/Polygon)
- MetaMask 연동 (Phase 1) + 자체 지갑 (Phase 2)
- Chainalysis FDS (Fraud Detection System)
- 거래 검증 로직, 수수료 계산

**Triggers**: `zzik-web3`, `zzik-stablecoin`, `zzik-payment`, `zzik-wallet`, `zzik-metamask`, `zzik-fds`

**Tech Stack**:
- ethers.js, wagmi, viem (Web3 integration)
- Polygon Network (저렴한 가스비)
- Chainalysis API (FDS)

**Use Cases**:
- MetaMask 연동 구현
- USDT 잔액 조회
- 결제 트랜잭션 전송 및 검증
- 가스비 최적화

---

### 3. zzik-global-expansion

**Purpose**: 글로벌 시장 확장, LLM 파트너십, 다국어 지원, 아시아 진출
**Responsibilities**:
- 네이버 HyperCLOVA X 제휴 전략
- 카카오 KoGPT 연동 방안
- OpenAI, Anthropic 파트너십
- i18next 설정 (42개 언어)
- 일본, 싱가포르, 태국, 중국 진출 전략

**Triggers**: `zzik-llm`, `zzik-expansion`, `zzik-i18n`, `zzik-japan`, `zzik-asia`, `zzik-hyperclovax`

**Key Partners**:
- 네이버 Labs (HyperCLOVA X)
- 카카오 Brain (KoGPT)
- WOWPASS (스테이블코인 ATM)
- OpenAsset (ATM 운영사)

**Use Cases**:
- 네이버 HyperCLOVA X API 연동
- 42개 언어 자동 번역
- 일본 의료관광객 타겟 마케팅

---

### 4. zzik-verify-agent

**Purpose**: 작업 완료 검증, 누락 사항 자동 체크, 거짓 주장 탐지
**Responsibilities**:
- 파일 생성/수정/삭제 검증
- 설정 파일 변경 확인
- 용량 계산 검증
- 교차 검증 (주장 vs 실제)
- 정직한 완료율 보고

**Triggers**: `zzik-verify`, `zzik-check`, `zzik-audit`, `verify-work`, `check-completion`

**Key Features**:
- 신뢰하지 말고 검증 (Trust, but verify)
- "100% 완료" 주장의 실제 달성률 계산
- 누락 사항 자동 발견 및 보고
- 즉시 수정 가능한 bash 명령 제공

**Automation**:
- `bash scripts/verify-completion.sh` - 17개 항목 자동 검증
- `bash scripts/auto-fix.sh` - 발견된 문제 자동 수정

**Use Cases**:
- "작업 완료했어" → `/zzik-verify` → 실제 완료율 보고
- 주기적 프로젝트 상태 감사
- 다른 AI의 작업 교차 검증

---

### 5. zzik-self-heal-agent

**Purpose**: 자기치유 성장형 시스템, 실패 패턴 학습, 자동 개선
**Responsibilities**:
- 모든 Agent/Skill 성과 모니터링
- 실패 패턴 자동 분석 (3회 이상 반복 시)
- 성공 패턴 자동 문서화
- 안전한 개선 사항 자동 적용
- 주간 성장 보고서 생성

**Triggers**: `zzik-self-heal`, `zzik-improve`, `zzik-learn`, `self-healing`, `growth-loop`

**Key Features**:
- Learn from every action (모든 작업에서 학습)
- Fail fast, improve faster (빠르게 실패하고 더 빠르게 개선)
- Self-document improvements (개선 자동 문서화)
- Never repeat mistakes (같은 실수 반복 금지)

**Learning System**:
- `.claude/learning/` 폴더에 모든 학습 데이터 저장
- agents/ - Agent 성과 로그 (JSON)
- skills/ - Skill 효과성 로그
- insights/ - 학습 인사이트 문서 (Markdown)
- reports/ - 주간 성장 보고서

**Automation**:
- 동일 에러 3회 시 자동 패턴 분석
- 성공률 80% 미만 시 심층 분석
- 매주 월요일 00:00 자동 진단
- 안전한 개선 사항 자동 적용

**Use Cases**:
- RPC 연결 실패 5회 → 자동으로 Multi-RPC fallback 추가
- GPS 검증 타임아웃 3회 → 자동으로 비동기 + 타임아웃 적용
- 고성능 패턴 발견 → 다른 컴포넌트에 자동 확산

**Settings** (`.claude/settings.json`):
```json
"self_healing": {
  "enabled": true,
  "auto_fix_safe_issues": true,
  "auto_learn_from_failures": true,
  "min_pattern_occurrences": 3,
  "learning_retention_days": 90,
  "weekly_diagnosis": "Monday 00:00"
}
```

---

## 🎯 Custom Skills

### 1. zzik-dual-entity-strategy

**Purpose**: 한국 법인 + AIFC 법인 법적 분리 패턴
**Coverage**:
- 고객 타겟 완전 분리 (한국인 vs 외국인)
- 데이터 완전 분리 (DB, 서버)
- 결제 시스템 완전 분리 (KRW vs USDT/USDC)
- 모노레포 구조 (apps/zzik-korea + apps/zzik-global)
- Geo-blocking 미들웨어

**Triggers**: `zzik-dual-entity`, `zzik-legal-structure`, `zzik-compliance-pattern`, `zzik-두법인`, `zzik-법적분리`

**Code Examples**:
- 환경 변수 분리 (.env.korea vs .env.global)
- Geo-blocking middleware (NextResponse.redirect)
- Prisma 스키마 분리 (prisma/korea vs prisma/global)

---

### 2. zzik-stablecoin-integration

**Purpose**: USDT/USDC 결제 통합 패턴 (MetaMask 연동, 트랜잭션 검증, FDS)
**Coverage**:
- ethers.js 지갑 연결
- ERC-20 표준 ABI 사용
- USDT/USDC 잔액 조회
- 결제 전송 (Polygon 네트워크)
- 백엔드 트랜잭션 검증
- Chainalysis FDS API 연동
- 가스비 최적화 (Polygon $0.01 vs Ethereum $5-20)

**Triggers**: `zzik-stablecoin`, `zzik-usdt-usdc`, `zzik-web3-payment`, `zzik-metamask-integration`, `zzik-스테이블코인결제`

**Network Choice**:
- **Polygon**: 수수료 낮음 ($0.01), 빠름 (2초) ← **권장**
- **Ethereum**: 수수료 높음 ($5-20), 느림 (15초)

**Code Examples**:
- Web3Wallet.connect() (MetaMask 연결)
- getUSDTBalance() (잔액 조회)
- sendPayment() (USDT 전송)
- verifyTransaction() (백엔드 검증)
- Chainalysis FDS 체크

---

### 3. zzik-prisma-patterns

**Purpose**: Database best practices (재사용 가능)
**Coverage**:
- Optimistic locking (version field)
- Idempotency (transaction deduplication)
- Safe migrations (non-nullable columns, renames)

**Triggers**: `zzik-prisma`, `zzik-transaction`, `zzik-optimistic-locking`, `zzik-schema-design`

---

### 4. zzik-verification-patterns

**Purpose**: GPS/QR 검증 시스템 (재사용 가능)
**Coverage**:
- GPS anti-spoofing (velocity tracking, IP cross-check)
- QR code verification (HMAC + nonce)
- Fraud detection heuristics

**Triggers**: `zzik-gps-verify`, `zzik-qr-verify`, `zzik-anti-spoof`, `zzik-fraud-detection`

---

### 5. zzik-react-query-patterns

**Purpose**: Frontend state management (재사용 가능)
**Coverage**:
- Query hooks with proper keys
- Mutations with optimistic updates
- Polling for real-time updates
- Infinite scroll pagination

**Triggers**: `zzik-react-query`, `zzik-cache-strategy`, `zzik-optimistic-update`, `zzik-mutation-pattern`

---

### 6. zzik-government-grants

**Purpose**: 정부지원사업 자동 검색 및 신청서 작성 (1인 창업자 자동화)
**Coverage**:
- 3-Phase Adaptive Search (K-Startup, TIPS, 관광벤처 등)
- Cash Level Validator (Level 1/2/3 현금성 지원 판단)
- Excel 자동 보고서 생성
- 신청서 템플릿 (K-Startup, TIPS, 관광벤처)
- ZZIK Map 적합도 판단 (95-100% 적합 사업 자동 추천)

**Triggers**: `zzik-government-grants`, `zzik-k-startup`, `zzik-tips`, `zzik-정부지원`, `zzik-보조금검색`, `gov-grant-hunter`

**Templates**:
- `/templates/k-startup.md` - K-Startup 예비창업패키지 신청서
- `/templates/tips.md` - TIPS 기술혁신성 평가서
- `/templates/tourism-venture.md` - 관광벤처 육성사업 신청서 (예정)

**Use Cases**:
- "11월 하순 마감 서울 창업기업 지원사업 찾아서 엑셀로 정리해줘"
- "K-Startup 예비창업패키지 신청서 작성해줘"
- "TIPS 기술혁신성 문서 작성해줘"

---

## 💻 Slash Commands

### /zzik-start

**Purpose**: 모든 ZZIK agents와 skills 활성화
**Use when**: ZZIK 개발 작업 시작 시
**Activates**: All 3 agents + all 5 skills

---

### /zzik-security

**Purpose**: GPS anti-spoofing, PII 암호화, RBAC 작업에 집중
**Activates**: zzik-verification-patterns skill

---

### /zzik-frontend

**Purpose**: React Query, PWA, UI/UX 개발에 집중
**Activates**: zzik-react-query-patterns skill

---

### /zzik-database

**Purpose**: Prisma 스키마, 마이그레이션, 쿼리 최적화 작업
**Activates**: zzik-prisma-patterns skill

---

### /zzik-api

**Purpose**: 외부 API 통합 (Instagram, TikTok, Stripe, Web3)
**Activates**: zzik-web3-payment agent

---

## 🎓 Usage Examples

### Example 1: AIFC LAB 신청서 작성

```bash
# Agent 활성화
"zzik-aifc-legal"

# 질문
"AIFC LAB 신청서에 꼭 필요한 항목이 뭐야?"
"한국 거주자 서비스 분리를 어떻게 검증하지?"
"AML/KYC 정책 문서화 템플릿 만들어줘"
```

---

### Example 2: MetaMask 결제 연동

```bash
# Agent 활성화
"zzik-web3-payment"

# 또는 Skill 활성화
"zzik-stablecoin"

# 질문
"MetaMask 연동 어떻게 해?"
"USDT 잔액 조회 코드 보여줘"
"백엔드에서 트랜잭션 검증하는 방법"
```

---

### Example 3: 네이버 HyperCLOVA X 파트너십

```bash
# Agent 활성화
"zzik-llm"

# 질문
"네이버 HyperCLOVA X 연동 어떻게 하지?"
"LLM API 설계 방법"
"Agentic Commerce 어떻게 구현해?"
```

---

### Example 4: 이중 법인 구조 구현

```bash
# Skill 활성화
"zzik-dual-entity"

# 질문
"모노레포 구조 어떻게 세팅하지?"
"Geo-blocking 미들웨어 구현"
"환경 변수 분리 패턴"
```

---

## 📋 Current Phase: Phase 0 - MVP (7일)

### 90일 로드맵

#### Day 1-7: MVP 개발

- [ ] GPS 체크인 기능
- [ ] QR 코드 생성/검증
- [ ] 기본 포인트 시스템
- [ ] 성수동 10곳 파일럿

**Priority**:
1. GPS anti-spoofing (zzik-gps-verify)
2. QR verification (zzik-qr-verify)
3. DB 스키마 설계 (zzik-prisma)

#### Day 8-30: 베타 확장

- [ ] 서울 30곳 매장 확대
- [ ] 외국인 관광객 100명 베타 테스트
- [ ] 피드백 수렴

#### Day 31-60: 정식 출시

- [ ] 서울 100곳 매장
- [ ] 의료관광 병원 10곳 제휴
- [ ] 인천공항 마케팅

#### Day 61-90: 전국 확장

- [ ] 부산, 제주 진출
- [ ] 외국인 사용자 1만 명

---

## 🔧 Project Tech Stack

**Frontend**:
- Next.js 14.2 (App Router)
- React 19
- TanStack Query v5 (React Query)
- PWA

**Backend**:
- Node.js
- PostgreSQL 17 + Prisma 7
- Redis (Upstash)

**Blockchain**:
- ethers.js
- Polygon Network
- Chainalysis API

**AI**:
- OpenAI GPT-4
- Naver HyperCLOVA X (제휴 예정)
- Google Translate API

**Maps**:
- Google Maps SDK (외국인 특화)

---

## 📚 Reference Documents

Located in `/home/ubuntu/`:

1. **ZZIK_정부지원사업용_사업계획서_2026.md**
   - 문체부, 복지부, 중기부 지원사업용
   - 구글맵 문제점 → ZZIK 솔루션
   - 정책 기여, 일자리 창출, 지역경제 활성화

2. **ZZIK_투자유치용_Pitch_Deck_2026.md**
   - 민간 투자자용 (Seed ₩500M → Series A ₩3B)
   - TAM $1T, 3년 매출 전망 ₩30B
   - Exit 전략 (M&A or IPO)

3. **ZZIK_AIFC_개발문서_v5_FINAL.md**
   - Phase 0-4 기술 로드맵
   - GPS, QR, Web3 지갑 코드 예제
   - 7일 MVP → 2027년 자체 지갑

4. **OpenAI_Stripe_Agentic_Commerce_레퍼런스.md**
   - OpenAI + Stripe 모델 벤치마킹
   - LLM Function Calling 패턴
   - ZZIK 버전 Architecture

---

## 🔍 Agent Scope Boundaries

각 agent는 명확한 역할 분담:

**zzik-aifc-legal**:
- ✅ Handles: AIFC 신청, 법률 자문, 규제 대응
- ❌ Delegates: 기술 구현 → web3-payment, database

**zzik-web3-payment**:
- ✅ Handles: Web3 지갑, 스테이블코인 결제, FDS
- ❌ Delegates: 법적 검토 → aifc-legal, 글로벌 확장 → global-expansion

**zzik-global-expansion**:
- ✅ Handles: LLM 파트너십, i18n, 해외 진출
- ❌ Delegates: 결제 → web3-payment, 법률 → aifc-legal

---

## 🎯 Next Steps

1. **Run `/zzik-start`** to activate all agents and skills
2. **Start Phase 0 MVP** (Day 1-7)
3. **Apply for AIFC LAB** (카자흐스탄 VASP 라이선스)
4. **Contact Naver Labs** (HyperCLOVA X 제휴)

---

## 📞 Key Contacts

**AIFC**:
- Website: https://aifc.kz/
- Email: lab@aifc.kz

**Naver Labs**:
- Email: hyperclovax@naverlabs.com

**Chainalysis**:
- Website: https://www.chainalysis.com/
- Product: KYT (Know Your Transaction)

---

**Environment Version**: Scenario 5 (Dual Entity + AIFC)
**Status**: ✅ Ready for Development
**Next Action**: Begin Phase 0 MVP (Day 1-7)

**"구글맵을 넘어, Web3 시대 결제 인프라를 만듭니다."** 🚀
