# ZZIK Map
## 외국인 관광객 특화 위치기반 스테이블코인 결제 플랫폼

> **"Google Maps for Korea, but with Web3 payments"**

[![Status](https://img.shields.io/badge/Status-Ready%20for%20Development-green)]()
[![License](https://img.shields.io/badge/License-Proprietary-red)]()
[![Strategy](https://img.shields.io/badge/Strategy-Scenario%205%20(Dual%20Entity)-blue)]()

---

## 🎯 Vision

외국인 관광객을 위한 한국 특화 위치기반 플랫폼 + 스테이블코인 결제 인프라

### 핵심 차별점

1. **구글맵 문제 해결**: 한국 내비게이션 제한, 로컬 정보 부족 해결
2. **Web3 결제**: USDT/USDC 스테이블코인으로 환전 없이 결제
3. **이중 법인 구조**: 한국 법령 준수 + AIFC 라이선스 (글로벌 확장)
4. **LLM 슈퍼앱 연동**: ChatGPT, HyperCLOVA X 파트너십

---

## 📊 Market Opportunity

- **TAM**: $1,000B (글로벌 스테이블코인 시장, 2035년)
- **SAM**: $50B (아시아 관광객 결제 시장)
- **SOM**: ₩150B/년 (ZZIK 목표, 2028년)

**Target**: 연간 2,000만 외국인 관광객 (2024년 기준)

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14.2 (App Router)
- **UI**: React 19, Tailwind CSS
- **PWA**: Progressive Web App

### Backend
- **Runtime**: Node.js
- **Database**: PostgreSQL 17 + Prisma 7
- **Cache**: Redis (Upstash)

### Blockchain
- **Library**: ethers.js
- **Network**: Polygon (USDT/USDC)
- **Wallet**: MetaMask (Phase 1) → Self-wallet (Phase 2)
- **FDS**: Chainalysis API (자금세탁방지)

### AI
- **LLM**: OpenAI GPT-4 (Agentic Commerce)
- **Translation**: Google Translate API (42 languages)
- **Partner**: Naver HyperCLOVA X (제휴 예정)

### Maps
- **API**: Google Maps SDK (외국인 특화)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 17+
- Redis (optional, for caching)
- pnpm 9+

### Installation

```bash
# Clone repository
cd /home/ubuntu/work/zzik-map

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Run development server
pnpm dev
```

### Development URLs

- **Web App**: http://localhost:3000
- **API**: http://localhost:3000/api

---

## 📁 Project Structure

```
zzik-map/
├── apps/
│   └── web/                  # Next.js 웹 애플리케이션 (MVP)
│       ├── src/
│       │   ├── app/          # App Router pages & API routes
│       │   ├── core/         # Business logic
│       │   │   ├── gps/      # GPS anti-spoofing
│       │   │   ├── qr/       # QR code verification
│       │   │   └── web3/     # Web3 wallet integration (Phase 2)
│       │   └── lib/          # Utilities
│       └── public/           # Static assets
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Migration history
├── .claude/
│   ├── agents/               # Custom agents (3)
│   ├── skills/               # Custom skills (6)
│   └── commands/             # Slash commands (5)
├── scripts/                  # Utility scripts
└── tests/                    # Backend tests
```

---

## 🎯 Development Roadmap

### Phase 0: MVP (Day 1-7) - 현재 단계

- [ ] GPS 체크인 기능
- [ ] QR 코드 생성/검증
- [ ] 기본 포인트 시스템
- [ ] 성수동 10곳 파일럿

### Phase 1: 한국 확장 (Month 2-3)

- [ ] 서울 100곳 매장
- [ ] 의료관광 병원 10곳 제휴
- [ ] 인천공항 마케팅

### Phase 2: AIFC 라이선스 (Month 4-6)

- [ ] AIFC LAB 신청 완료
- [ ] 이중 법인 구조 구현 (apps/zzik-korea + apps/zzik-global)
- [ ] VASP 라이선스 취득

### Phase 3: 스테이블코인 결제 (Month 7-9)

- [ ] MetaMask 연동
- [ ] USDT/USDC 결제 (Polygon)
- [ ] Chainalysis FDS 연동

### Phase 4: LLM 슈퍼앱 (2027년)

- [ ] ChatGPT Agentic Commerce
- [ ] Naver HyperCLOVA X 제휴
- [ ] 자체 지갑 개발

---

## 🤖 Claude Code Integration

### Activate All Agents & Skills

```bash
/zzik-start
```

### Available Agents (3)

1. **zzik-aifc-legal**: AIFC 라이선스 신청, 법적 준수
2. **zzik-web3-payment**: 스테이블코인 결제 통합
3. **zzik-global-expansion**: LLM 파트너십, 다국어 지원

### Available Skills (6)

1. **zzik-dual-entity-strategy**: 이중 법인 법적 분리 패턴
2. **zzik-stablecoin-integration**: USDT/USDC 결제 통합
3. **zzik-government-grants**: 정부지원사업 자동화
4. **zzik-prisma-patterns**: DB 베스트 프랙티스
5. **zzik-verification-patterns**: GPS/QR 검증
6. **zzik-react-query-patterns**: 프론트엔드 상태 관리

### Usage Examples

```bash
# GPS 체크인 구현
"zzik-gps-verify"
"GPS 체크인 기능 구현해줘"

# MetaMask 연동
"zzik-web3-payment"
"MetaMask 연동 어떻게 해?"

# 정부지원사업 신청서 작성
"zzik-k-startup"
"K-Startup 예비창업패키지 신청서 작성해줘"
```

---

## 📚 Documentation

### Business Plans

Located in `/home/ubuntu/`:

1. **ZZIK_정부지원사업용_사업계획서_2026.md** - 정부/공기관 지원사업용
2. **ZZIK_투자유치용_Pitch_Deck_2026.md** - 민간 투자자용
3. **ZZIK_AIFC_개발문서_v5_FINAL.md** - 기술 로드맵
4. **OpenAI_Stripe_Agentic_Commerce_레퍼런스.md** - LLM 연동 가이드

### Technical Guides

Located in `.claude/`:

- **README.md**: Agent/Skills 가이드
- **skills/**: 6개 커스텀 스킬 (코드 패턴, 템플릿)
- **agents/**: 3개 전문 에이전트

---

## 🧪 Testing

```bash
# Run all tests
pnpm test:backend

# Run specific tests
pnpm test:backend:gps     # GPS anti-spoofing tests
pnpm test:backend:qr      # QR verification tests
```

---

## 🔐 Security

### 7-Layer GPS Anti-Spoofing

1. 속도 추적 (velocity check)
2. IP 위치 교차 검증
3. Device fingerprinting
4. 시간 패턴 분석
5. QR 코드 이중 검증
6. Chainalysis FDS (Phase 3)
7. 수동 리뷰 (의심 거래)

### Web3 Security (Phase 3)

- Chainalysis KYT (Know Your Transaction)
- AML/KYC 정책 (AIFC 준수)
- 트랜잭션 검증 (백엔드)

---

## 🌍 Legal Structure (Dual Entity)

### ZZIK Korea Inc. (한국 법인)

- **타겟**: 한국 거주자만
- **결제**: KRW (토스페이먼츠, 카카오페이)
- **규제**: 한국 법령 100% 준수

### ZZIK Global Ltd. (AIFC 법인)

- **타겟**: 외국인만 (한국 거주자 제외)
- **결제**: USDT/USDC (스테이블코인)
- **규제**: AIFC VASP 라이선스

**중요**: 완전 분리로 규제 리스크 제거

---

## 💰 Funding Status

### Target

- **Seed**: ₩500M (2026 Q1)
- **Series A**: ₩3B (2027 Q1)

### Government Grants

- K-Startup: ₩100M (신청 예정)
- TIPS: ₩500M (신청 예정)
- 관광벤처 육성사업: ₩150M (신청 예정)

---

## 📞 Contact

**Team**: 1인 창업자 (CEO + CTO + Designer)
**Email**: contact@zzik.global (예정)
**Website**: https://zzik.global (예정)

---

## 📄 License

Proprietary - All rights reserved

---

## 🙏 Acknowledgments

- **Claude Code** (Anthropic): 개발 자동화
- **AIFC**: Regulatory sandbox support (예정)
- **Naver Labs**: HyperCLOVA X partnership (제휴 예정)

---

**"구글맵을 넘어, Web3 시대 결제 인프라를 만듭니다."** 🚀
