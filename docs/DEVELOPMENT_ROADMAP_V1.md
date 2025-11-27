# ZZIK MAP 개발 로드맵 V1
## 8주 MVP 개발 계획 (솔로 파운더 현실화)

---

**작성일**: 2025-11-26
**목표**: M2 MVP 출시 (Journey Intelligence 100%)
**방식**: Agents + Skills 풀가동

---

## 현재 상태 분석

### 완료된 것 (90%)
```
✅ Design System V3 (Catalyst UI Kit 27개 + ZZIK 11개)
✅ 디자인 토큰 시스템 (4층 아키텍처)
✅ Custom Hooks 구조 (useTheme, useJourney, useVibe)
✅ 스타일 시스템 (themes, tokens, patterns)
✅ Agents 7개, Skills 3개, Commands 7개
✅ Business Plan V6, IR Deck V6 (A등급)
```

### 부족한 것 (0%)
```
❌ Supabase 스키마 + pgvector
❌ Gemini API 연동
❌ 실제 페이지/라우팅
❌ 인증 시스템
❌ 사진 업로드 → 추천 플로우
❌ i18n 번역 파일
```

---

## 8주 개발 로드맵

```
Week 1     Week 2     Week 3     Week 4     Week 5     Week 6     Week 7     Week 8
──────────────────────────────────────────────────────────────────────────────────────
[Phase 0 ][    Phase 1    ][      Phase 2      ][      Phase 3      ][  Phase 4  ]
환경설정    POC 검증         핵심 인프라          Journey MVP          베타 준비
──────────────────────────────────────────────────────────────────────────────────────
```

---

## Phase 0: 개발 환경 설정 (Week 1, Day 1-2)

### 목표
- 개발 환경 완벽 구동
- 외부 서비스 API 키 확보
- 기본 프로젝트 구조 검증

### 작업 목록

#### 0-1. 환경 변수 설정
```bash
# 필요한 API 키 목록
├── Supabase (무료)
│   ├── NEXT_PUBLIC_SUPABASE_URL
│   ├── NEXT_PUBLIC_SUPABASE_ANON_KEY
│   └── SUPABASE_SERVICE_ROLE_KEY
│
├── Gemini API (무료 1,000 req/day)
│   └── GEMINI_API_KEY
│
├── Kakao Maps (무료)
│   └── NEXT_PUBLIC_KAKAO_MAP_KEY
│
└── (선택) Firebase Auth
    └── FIREBASE_* 환경변수들
```

#### 0-2. 의존성 설치
```bash
cd /home/ubuntu/zzik-map/app
pnpm install

# 추가 필요 패키지
pnpm add @google/generative-ai    # Gemini SDK
pnpm add exifr                     # EXIF GPS 추출
pnpm add sharp                     # 이미지 처리
pnpm add zustand                   # 상태 관리
pnpm add react-dropzone            # 파일 업로드
pnpm add framer-motion             # 애니메이션
```

#### 0-3. 개발 서버 확인
```bash
pnpm dev
# http://localhost:3000 접속 확인
```

### 담당 Agent
- **zzik-frontend**: 프로젝트 구조 검증
- **zzik-database**: Supabase 연결 테스트

### 산출물
- [ ] `.env.local` 설정 완료
- [ ] `pnpm dev` 정상 구동
- [ ] Supabase 대시보드 접근 확인
- [ ] Gemini API 키 발급 확인

---

## Phase 1: POC 코드 검증 (Week 1-2, Day 3-10)

### 목표
- IR Deck에 쓴 POC 수치 실제 검증
- GPS 추출 57%, Gemini Vision 80%, pgvector 2.4ms

### 작업 목록

#### 1-1. GPS 추출 POC (Day 3-4)
```
목표: EXIF GPS 추출률 57% 검증

작업:
├── exifr 라이브러리로 GPS 추출 함수 구현
├── 테스트 이미지 100장 수집 (개인 사진 + Unsplash)
├── 추출 성공률 측정 및 리포트
└── 3단계 Fallback 로직 설계

파일:
├── /src/lib/photo/exif-extractor.ts
├── /src/lib/photo/gps-utils.ts
└── /scripts/poc-gps-test.ts
```

**사용 Skill**: `photo-processing`

#### 1-2. Gemini Vision POC (Day 5-6)
```
목표: 랜드마크 인식 정확도 80% 검증

작업:
├── Gemini 2.0 Flash Vision API 연동
├── 프롬프트 최적화 (장소명 + 좌표 추출)
├── 유명 장소 20장 테스트
├── 응답 속도 측정 (목표 < 2초)
└── Rate Limiting + Retry 로직

파일:
├── /src/lib/ai/gemini-client.ts
├── /src/lib/ai/location-recognizer.ts
└── /scripts/poc-gemini-test.ts
```

**사용 Agent**: `zzik-ai`

#### 1-3. pgvector POC (Day 7-8)
```
목표: 벡터 검색 응답속도 2.4ms 검증

작업:
├── Supabase에 pgvector extension 활성화
├── 테스트 테이블 생성 (128차원 벡터)
├── 샘플 데이터 50개 삽입
├── 유사도 검색 쿼리 테스트
└── IVFFlat 인덱스 성능 측정

파일:
├── /supabase/migrations/001_enable_pgvector.sql
├── /supabase/migrations/002_create_test_vectors.sql
└── /scripts/poc-pgvector-test.ts
```

**사용 Skill**: `pgvector-optimization`

#### 1-4. POC 통합 테스트 (Day 9-10)
```
목표: 3단계 Fallback 전체 플로우 검증

플로우:
사진 업로드
    ↓
[1단계] EXIF GPS 추출 시도
    ↓ (실패 시)
[2단계] Gemini Vision 랜드마크 인식
    ↓ (실패 시)
[3단계] 사용자 수동 입력 UI

파일:
├── /src/lib/photo/location-resolver.ts (통합)
└── /scripts/poc-integration-test.ts
```

**사용 Agent**: `zzik-journey`

### 담당 Agent/Skill
| 작업 | Agent | Skill |
|------|-------|-------|
| GPS 추출 | zzik-journey | photo-processing |
| Gemini 연동 | zzik-ai | - |
| pgvector | zzik-database | pgvector-optimization |
| 통합 테스트 | zzik-testing | - |

### 산출물
- [ ] POC 결과 리포트 (실제 수치)
- [ ] GPS 추출 함수 (`/src/lib/photo/`)
- [ ] Gemini 클라이언트 (`/src/lib/ai/`)
- [ ] pgvector 마이그레이션 (`/supabase/migrations/`)

---

## Phase 2: 핵심 인프라 구축 (Week 2-3, Day 11-21)

### 목표
- 프로덕션급 데이터베이스 스키마
- 인증 시스템
- 기본 페이지 라우팅

### 작업 목록

#### 2-1. Supabase 스키마 설계 (Day 11-13)
```sql
-- 핵심 테이블 (6개)

-- 1. users (사용자)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  nationality TEXT,        -- 'JP', 'US', 'CN' 등
  preferred_language TEXT DEFAULT 'en',
  travel_style TEXT[],     -- ['backpacker', 'luxury', 'foodie']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. places (장소)
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name JSONB NOT NULL,     -- {"ko": "경복궁", "en": "Gyeongbokgung"}
  category TEXT NOT NULL,  -- 'cafe', 'restaurant', 'attraction'
  address JSONB,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_place_id TEXT,
  kakao_place_id TEXT,
  thumbnail_url TEXT,
  photos TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  source TEXT,             -- 'user', 'crawl', 'partner'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. journeys (여정 = 핵심 데이터)
CREATE TABLE journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  place_from_id UUID REFERENCES places(id),
  place_to_id UUID REFERENCES places(id),
  visited_at TIMESTAMPTZ,
  travel_duration_days INT,  -- 전체 여행 기간
  day_number INT,            -- N일차
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. photos (사진)
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  place_id UUID REFERENCES places(id),
  journey_id UUID REFERENCES journeys(id),
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  original_filename TEXT,
  gps_latitude DECIMAL(10, 8),
  gps_longitude DECIMAL(11, 8),
  gps_source TEXT,          -- 'exif', 'gemini', 'manual'
  taken_at TIMESTAMPTZ,
  exif_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. vibes (분위기 임베딩 - Phase 2용)
CREATE TABLE vibes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES places(id) UNIQUE,
  embedding vector(128),    -- pgvector
  vibe_scores JSONB,        -- {"cozy": 0.8, "modern": 0.6, ...}
  dominant_colors TEXT[],
  style_keywords TEXT[],
  confidence DECIMAL(3, 2),
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. recommendations (추천 로그)
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  from_place_id UUID REFERENCES places(id),
  recommended_place_id UUID REFERENCES places(id),
  algorithm TEXT,           -- 'content_based', 'hybrid', 'collaborative'
  score DECIMAL(5, 4),
  clicked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_journeys_place_from ON journeys(place_from_id);
CREATE INDEX idx_journeys_place_to ON journeys(place_to_id);
CREATE INDEX idx_photos_place ON photos(place_id);
CREATE INDEX idx_vibes_embedding ON vibes USING ivfflat (embedding vector_cosine_ops);
```

**사용 Agent**: `zzik-database`

#### 2-2. RLS (Row Level Security) 설정 (Day 14)
```sql
-- users: 본인만 수정 가능
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- photos: 본인 사진만 관리
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own photos" ON photos
  FOR ALL USING (auth.uid() = user_id);

-- places, vibes: 공개 읽기
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read places" ON places
  FOR SELECT USING (true);
```

#### 2-3. 인증 시스템 (Day 15-16)
```
옵션 A: Supabase Auth (권장 - 이미 연동)
├── Email/Password
├── OAuth (Google, Kakao)
└── Magic Link

옵션 B: Firebase Auth
├── 더 풍부한 OAuth 제공자
└── 추가 설정 필요

선택: Supabase Auth (단순화)

파일:
├── /src/lib/auth/supabase-auth.ts
├── /src/hooks/useAuth.ts
├── /src/components/auth/LoginForm.tsx
├── /src/components/auth/SignupForm.tsx
└── /src/app/(auth)/login/page.tsx
```

**사용 Agent**: `zzik-frontend`

#### 2-4. 기본 페이지 라우팅 (Day 17-19)
```
/app
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (main)/
│   ├── layout.tsx          # SidebarLayout
│   ├── page.tsx            # 홈/대시보드
│   ├── journey/
│   │   ├── page.tsx        # 여정 목록
│   │   ├── new/page.tsx    # 새 여정 (사진 업로드)
│   │   └── [id]/page.tsx   # 여정 상세
│   ├── explore/
│   │   └── page.tsx        # 장소 탐색
│   └── profile/
│       └── page.tsx        # 프로필
└── api/
    ├── auth/[...supabase]/route.ts
    ├── photos/upload/route.ts
    └── recommendations/route.ts
```

#### 2-5. i18n 기초 설정 (Day 20-21)
```
/src/messages/
├── en.json    # 영어 (기본)
├── ko.json    # 한국어
├── ja.json    # 일본어
├── zh-CN.json # 중국어 간체
├── zh-TW.json # 중국어 번체
└── th.json    # 태국어

초기 번역 범위:
├── common (버튼, 에러 메시지)
├── auth (로그인, 회원가입)
├── navigation (메뉴)
└── journey (핵심 기능)
```

**사용 Skill**: `i18n-implementation`

### 담당 Agent/Skill
| 작업 | Agent | Skill |
|------|-------|-------|
| DB 스키마 | zzik-database | pgvector-optimization |
| 인증 | zzik-frontend | - |
| 라우팅 | zzik-frontend | - |
| i18n | zzik-frontend | i18n-implementation |

### 산출물
- [ ] Supabase 마이그레이션 6개
- [ ] RLS 정책 설정
- [ ] 인증 시스템 (로그인/회원가입)
- [ ] 기본 페이지 7개
- [ ] i18n 번역 파일 6개 언어

---

## Phase 3: Journey Intelligence MVP (Week 3-6, Day 22-42)

### 목표
- 핵심 기능 완전 구현
- 사진 업로드 → 다음 장소 추천 전체 플로우

### 작업 목록

#### 3-1. 사진 업로드 기능 (Day 22-25)
```
기능:
├── 드래그 앤 드롭 업로드
├── 다중 파일 선택 (최대 10장)
├── 이미지 검증 (JPEG/PNG/WebP, 10MB)
├── 클라이언트 압축 (2MB 타겟)
├── 프리뷰 표시
├── Supabase Storage 업로드
└── 썸네일 자동 생성

컴포넌트:
├── /src/components/journey/PhotoUploader.tsx (개선)
├── /src/components/journey/PhotoPreview.tsx
├── /src/components/journey/UploadProgress.tsx
└── /src/hooks/usePhotoUpload.ts

API:
└── /src/app/api/photos/upload/route.ts
```

**사용 Skill**: `photo-processing`

#### 3-2. GPS 추출 + 장소 매칭 (Day 26-29)
```
플로우:
사진 업로드
    ↓
[자동] EXIF GPS 추출
    ↓ (성공률 57%)
[자동] Gemini Vision (실패 시)
    ↓ (성공률 80%)
[수동] 지도에서 선택 (실패 시)
    ↓
장소 DB 매칭 또는 신규 생성

컴포넌트:
├── /src/components/journey/LocationResolver.tsx
├── /src/components/journey/ManualLocationPicker.tsx
├── /src/components/map/KakaoMap.tsx
└── /src/hooks/useLocationResolver.ts

서비스:
├── /src/lib/photo/location-resolver.ts
└── /src/lib/places/place-matcher.ts
```

**사용 Agent**: `zzik-journey`, `zzik-ai`

#### 3-3. 추천 알고리즘 구현 (Day 30-35)
```
Phase 1 알고리즘: Content-Based Filtering

입력:
├── 현재 장소 (place_from)
├── 사용자 프로필 (nationality, travel_style)
└── 여행 컨텍스트 (duration, day_number)

로직:
1. 같은 place_from에서 출발한 여정들 조회
2. 유사 사용자 필터링 (nationality, style)
3. place_to 빈도수 집계
4. 상위 5개 추천

출력:
├── 추천 장소 목록
├── "N명의 여행자가 선택" 텍스트
└── 신뢰도 점수

파일:
├── /src/lib/recommendations/content-based.ts
├── /src/lib/recommendations/types.ts
└── /src/app/api/recommendations/route.ts
```

**사용 Agent**: `zzik-journey`

#### 3-4. 추천 결과 UI (Day 36-38)
```
컴포넌트:
├── /src/components/journey/RecommendationList.tsx
├── /src/components/journey/RecommendationCard.tsx (개선)
├── /src/components/journey/TravelerCount.tsx
└── /src/components/journey/ConfidenceBadge.tsx

페이지:
└── /src/app/(main)/journey/new/page.tsx
    ├── Step 1: 사진 업로드
    ├── Step 2: 위치 확인/수정
    ├── Step 3: 추천 결과 표시
    └── Step 4: 선택 및 저장
```

**사용 Agent**: `zzik-frontend`

#### 3-5. 여정 저장 및 히스토리 (Day 39-42)
```
기능:
├── 추천 선택 → 여정 저장
├── 내 여정 목록 조회
├── 여정 타임라인 표시
├── 여정 공유 (선택)
└── 데이터 기여 인센티브 UI

컴포넌트:
├── /src/components/journey/JourneyList.tsx
├── /src/components/journey/JourneyTimeline.tsx (개선)
├── /src/components/journey/JourneyDetail.tsx
└── /src/components/journey/ShareJourney.tsx

페이지:
├── /src/app/(main)/journey/page.tsx (목록)
└── /src/app/(main)/journey/[id]/page.tsx (상세)
```

### 담당 Agent/Skill
| 작업 | Agent | Skill |
|------|-------|-------|
| 사진 업로드 | zzik-frontend | photo-processing |
| GPS/장소 매칭 | zzik-journey, zzik-ai | photo-processing |
| 추천 알고리즘 | zzik-journey | - |
| UI 구현 | zzik-frontend | - |
| 테스트 | zzik-testing | - |

### 산출물
- [ ] 사진 업로드 전체 플로우
- [ ] 3단계 GPS Fallback 구현
- [ ] Content-Based 추천 알고리즘
- [ ] 추천 결과 UI
- [ ] 여정 관리 기능

---

## Phase 4: 베타 준비 및 출시 (Week 7-8, Day 43-56)

### 목표
- 베타 50명 테스트 준비
- 버그 수정 및 안정화
- 시드 데이터 구축

### 작업 목록

#### 4-1. 시드 데이터 구축 (Day 43-46)
```
목표: 500-1,000 여정 데이터

소스:
├── 한국관광공사 OpenAPI (공식)
├── 개인 여행 사진 (동의 기반)
├── Flickr/Unsplash CC 라이선스
└── 크리에이터 30명 모집

스크립트:
├── /scripts/seed/import-kto-places.ts
├── /scripts/seed/import-sample-journeys.ts
└── /scripts/seed/generate-fake-users.ts
```

#### 4-2. 랜딩 페이지 (Day 47-49)
```
섹션:
├── Hero: "사진 한 장으로 다음 장소를 안다"
├── How it works: 3단계 설명
├── Features: Journey / Vibe / MAP BOX
├── Social proof: "N명의 여행자가 사용 중"
├── CTA: 베타 신청
└── Footer: 6개 언어 전환

파일:
└── /src/app/page.tsx (메인 랜딩)
```

**사용 Agent**: `zzik-frontend`

#### 4-3. 버그 수정 및 최적화 (Day 50-52)
```
체크리스트:
├── [ ] 모든 페이지 반응형 확인
├── [ ] 다크/라이트 테마 검증
├── [ ] 6개 언어 번역 완성도
├── [ ] 이미지 로딩 최적화
├── [ ] API 에러 핸들링
├── [ ] 인증 플로우 테스트
└── [ ] Lighthouse 성능 90+ 목표
```

**사용 Agent**: `zzik-testing`

#### 4-4. 배포 및 모니터링 (Day 53-56)
```
배포:
├── Vercel 프로덕션 배포
├── 커스텀 도메인 연결 (선택)
├── Supabase 프로덕션 설정
└── 환경변수 프로덕션 값 설정

모니터링:
├── Vercel Analytics (무료)
├── Supabase 대시보드
└── 에러 로깅 (선택: Sentry)

베타 준비:
├── 베타 신청 폼 (Google Forms)
├── 피드백 수집 시스템
└── NPS 측정 준비
```

### 담당 Agent/Skill
| 작업 | Agent | Skill |
|------|-------|-------|
| 시드 데이터 | zzik-database | - |
| 랜딩 페이지 | zzik-frontend | - |
| 테스트 | zzik-testing | - |
| 배포 | - | - |

### 산출물
- [ ] 시드 데이터 500+ 여정
- [ ] 랜딩 페이지
- [ ] 베타 배포 완료
- [ ] 모니터링 설정

---

## Agent 활용 매트릭스

| Phase | zzik-frontend | zzik-journey | zzik-vibe | zzik-database | zzik-ai | zzik-testing |
|-------|---------------|--------------|-----------|---------------|---------|--------------|
| 0. 환경설정 | ● | - | - | ● | - | - |
| 1. POC | ○ | ● | - | ● | ● | ● |
| 2. 인프라 | ● | - | - | ● | - | ○ |
| 3. MVP | ● | ● | - | ○ | ● | ● |
| 4. 베타 | ● | ○ | - | ● | - | ● |

● 주요 담당 / ○ 부분 참여 / - 미참여

---

## Skill 활용 매트릭스

| Phase | photo-processing | pgvector-optimization | i18n-implementation |
|-------|------------------|----------------------|---------------------|
| 0. 환경설정 | - | - | - |
| 1. POC | ● | ● | - |
| 2. 인프라 | - | ● | ● |
| 3. MVP | ● | ○ | ○ |
| 4. 베타 | ○ | - | ● |

---

## 주간 체크포인트

### Week 1 완료 기준
- [ ] 개발 환경 100% 구동
- [ ] Supabase 연결 성공
- [ ] Gemini API 테스트 성공
- [ ] GPS 추출 POC 57% 달성

### Week 2 완료 기준
- [ ] POC 3개 모두 검증 완료
- [ ] pgvector 인덱스 생성
- [ ] 통합 테스트 통과
- [ ] DB 스키마 v1 완성

### Week 3 완료 기준
- [ ] 인증 시스템 완료
- [ ] 기본 페이지 라우팅 완료
- [ ] i18n 기초 설정 완료

### Week 4 완료 기준
- [ ] 사진 업로드 전체 플로우
- [ ] 3단계 Fallback GPS 구현
- [ ] Kakao Maps 연동

### Week 5 완료 기준
- [ ] Content-Based 추천 알고리즘
- [ ] 추천 결과 UI 완성

### Week 6 완료 기준
- [ ] 여정 저장/조회 기능
- [ ] Journey Intelligence 100%

### Week 7 완료 기준
- [ ] 시드 데이터 500+ 여정
- [ ] 랜딩 페이지 완성
- [ ] 버그 수정 80%

### Week 8 완료 기준
- [ ] 베타 배포 완료
- [ ] 모니터링 설정
- [ ] 베타 50명 모집 시작

---

## 리스크 및 대응

| 리스크 | 확률 | 영향 | 대응 |
|--------|------|------|------|
| Gemini API 제한 | 중 | 높 | 캐싱 강화, 백업 API |
| GPS 추출률 저조 | 중 | 중 | 수동 입력 UX 개선 |
| 시드 데이터 부족 | 높 | 높 | 크리에이터 인센티브 |
| 1인 개발 병목 | 높 | 중 | 범위 축소, 우선순위 |

---

## 다음 단계 (M3-M6)

Phase 3 완료 후:
1. **M3**: 공개 베타, 파트타임 개발자 채용
2. **M4**: Vibe Matching 기초 개발
3. **M5**: MAU 600 달성, 파트너 12곳
4. **M6**: TIPS 신청, MAU 1,000

---

*ZZIK MAP 개발 로드맵 V1*
*작성: 2025-11-26*
*목표: 8주 내 Journey Intelligence MVP*
