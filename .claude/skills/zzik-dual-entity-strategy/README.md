---
name: zzik-dual-entity-strategy
description: ZZIK 이중 법인 전략 패턴 - 한국 법인 + AIFC 법인 분리 운영
triggers:
  - zzik-dual-entity
  - zzik-legal-structure
  - zzik-compliance-pattern
  - zzik-두법인
  - zzik-법적분리
---

# ZZIK Dual Entity Strategy Pattern

## 개요
한국 법인과 AIFC 법인을 법적으로 완전히 분리하여 규제 리스크를 제거하는 전략 패턴

## 핵심 원칙

### 1. 고객 타겟 완전 분리
```
ZZIK Korea → 한국 거주자만
ZZIK Global → 외국인만 (한국 거주자 제외)
```

### 2. 데이터 완전 분리
```
ZZIK Korea → 한국 서버 (AWS Seoul)
ZZIK Global → AIFC 서버 (Astana 또는 AWS Singapore)
```

### 3. 결제 시스템 완전 분리
```
ZZIK Korea → KRW (토스페이먼츠, 카카오페이)
ZZIK Global → USDT/USDC (스테이블코인)
```

## 법적 구조

```
[ZZIK Holdings] (지주회사, 한국)
      │
      ├─ [ZZIK Korea Inc.] (한국 법인)
      │   ├─ 설립: 서울 강남구
      │   ├─ 사업자등록: 한국
      │   ├─ 타겟: 한국 거주자
      │   ├─ DB: PostgreSQL (AWS Seoul)
      │   └─ 규제: 한국 법령
      │
      └─ [ZZIK Global Ltd.] (AIFC 법인)
          ├─ 등록: AIFC, Astana
          ├─ 타겟: 외국인 (한국 거주자 제외)
          ├─ DB: PostgreSQL (AWS Singapore)
          └─ 규제: AIFC 법령 (영국법 기반)
```

## 공유 가능한 것 vs 분리해야 하는 것

### ✅ 공유 가능
- 코드베이스 (모노레포)
- 기술 스택
- 매장 리스트 (메타데이터)
- UI/UX 디자인

### ❌ 반드시 분리
- 사용자 데이터 (개인정보)
- 결제 정보
- 거래 내역
- 서버 위치
- 도메인 (zzik.kr vs zzik.global)

## 구현 패턴

### 1. 모노레포 구조
```
zzik-map/
├── apps/
│   ├── zzik-korea/     # 한국 법인 앱
│   └── zzik-global/    # AIFC 법인 앱
├── packages/
│   ├── ui/             # 공유 UI 컴포넌트
│   ├── utils/          # 공유 유틸리티
│   └── types/          # 공유 타입 정의
└── prisma/
    ├── korea/          # 한국 스키마 (별도 DB)
    └── global/         # 글로벌 스키마 (별도 DB)
```

### 2. 환경 변수 분리
```bash
# .env.korea
DATABASE_URL="postgresql://korea-db..."
NEXT_PUBLIC_TARGET="KR_RESIDENTS"
PAYMENT_PROVIDER="TOSSPAYMENTS"

# .env.global
DATABASE_URL="postgresql://global-db..."
NEXT_PUBLIC_TARGET="FOREIGNERS_ONLY"
PAYMENT_PROVIDER="WEB3_STABLECOIN"
```

### 3. 사용자 식별 로직
```typescript
// apps/zzik-korea/src/middleware.ts
export function middleware(req: Request) {
  const country = req.geo?.country

  // 한국 거주자만 허용
  if (country !== 'KR') {
    return Response.redirect('https://zzik.global')
  }

  return NextResponse.next()
}

// apps/zzik-global/src/middleware.ts
export function middleware(req: Request) {
  const country = req.geo?.country

  // 한국 거주자 차단
  if (country === 'KR') {
    return Response.redirect('https://zzik.kr')
  }

  return NextResponse.next()
}
```

## 규제 대응

### 한국 금융위원회 질문 대응
```
금감원: "AIFC로 한국인에게 서비스하나요?"
답변: "아니요. AIFC는 외국인만 서비스합니다.
      한국인은 한국 법인(ZZIK Korea Inc.)으로 별도 서비스합니다.
      데이터도 완전히 분리되어 있습니다."
```

### AIFC 규제당국 질문 대응
```
AFSA: "한국 거주자도 서비스하나요?"
답변: "아니요. ZZIK Global은 외국인만 타겟합니다.
      한국 거주자는 별도 법인(ZZIK Korea)이 서비스합니다."
```

## 투자자 피칭

### 장점 강조
```
투자자: "규제 리스크는?"
답변: "이중 법인 구조로 규제 리스크를 제거했습니다.
      - 한국: 한국 법령 준수
      - 글로벌: AIFC 법령 준수
      - 규제 회피 아님, 규제 준수 전략입니다."
```

### 확장성 강조
```
투자자: "일본 진출 계획은?"
답변: "ZZIK Global (AIFC)로 바로 진출 가능합니다.
      AIFC VASP 라이선스는 글로벌 서비스 가능하므로,
      일본 별도 법인 없이 진출할 수 있습니다."
```

## 주의사항

### ⚠️ 절대 하지 말아야 할 것
1. **크로스 서비스**
   - ❌ AIFC 법인으로 한국인 서비스
   - ❌ 한국 법인으로 외국인에게 스테이블코인 제공

2. **데이터 혼합**
   - ❌ 한국인 + 외국인 데이터를 같은 DB에 저장
   - ❌ 서버간 개인정보 전송

3. **법인 혼동**
   - ❌ "ZZIK"이라는 단일 법인처럼 홍보
   - ✅ "ZZIK Holdings의 자회사들"로 명확히 표현

## 체크리스트

### 법적 분리 확인
- [ ] 별도 사업자등록증
- [ ] 별도 은행 계좌
- [ ] 별도 서버
- [ ] 별도 DB
- [ ] 별도 도메인
- [ ] 타겟 고객 명확히 분리

### 기술적 분리 확인
- [ ] 환경 변수 분리
- [ ] 사용자 데이터 분리
- [ ] 결제 시스템 분리
- [ ] Geo-blocking 설정
- [ ] 에러 추적 분리 (Sentry)

## 참고 자료
- /home/ubuntu/ZZIK_AIFC_사업계획서_v5_FINAL.md
- 외국환거래법
- AIFC Financial Services Framework Regulations
