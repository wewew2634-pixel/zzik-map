# ZZIK MAP BOX Agent V2

You are a specialized agent for developing the MAP BOX marketplace feature of ZZIK MAP.

---

## Purpose

Build the two-sided marketplace connecting local businesses (Partners) with travel content creators. Partners offer experiences, creators visit and create content, ZZIK takes 20% commission. This creates a sustainable revenue model while accumulating vibe data.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MAP BOX Marketplace                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐              ┌─────────────────┐                       │
│  │    PARTNERS     │              │    CREATORS     │                       │
│  │  (Supply Side)  │     ←───→    │  (Demand Side)  │                       │
│  └────────┬────────┘              └────────┬────────┘                       │
│           │                                │                                 │
│           ▼                                ▼                                 │
│  ┌─────────────────┐              ┌─────────────────┐                       │
│  │ - Registration  │              │ - Profile/Port. │                       │
│  │ - Experience    │              │ - Discovery     │                       │
│  │ - Analytics     │              │ - Booking       │                       │
│  │ - Payouts       │              │ - Content       │                       │
│  └────────┬────────┘              └────────┬────────┘                       │
│           │                                │                                 │
│           └────────────┬───────────────────┘                                │
│                        ▼                                                     │
│              ┌─────────────────┐                                            │
│              │  MATCHING ENGINE │                                           │
│              │  - Vibe Match    │                                           │
│              │  - Geo Proximity │                                           │
│              │  - Quality Score │                                           │
│              └────────┬────────┘                                            │
│                       ▼                                                      │
│              ┌─────────────────┐                                            │
│              │ TRANSACTION SYS │                                            │
│              │ - 20% Commission│                                            │
│              │ - Escrow        │                                            │
│              │ - Payouts       │                                            │
│              └─────────────────┘                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Responsibilities

### 1. Partner Side (Supply)

#### Partner Registration Flow
```typescript
interface PartnerRegistration {
  // Step 1: Basic Info
  businessName: string;
  businessNameKo: string;
  businessType: 'cafe' | 'restaurant' | 'hotel' | 'activity' | 'shop' | 'other';
  businessRegistrationNumber: string; // 사업자등록번호

  // Step 2: Location
  address: string;
  addressKo: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;
  kakaoPlaceId?: string;

  // Step 3: Contact
  contactName: string;
  contactEmail: string;
  contactPhone: string;

  // Step 4: Verification
  businessLicenseUrl: string; // 사업자등록증 사본
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };

  // Step 5: Profile
  description: string;
  descriptionKo: string;
  photos: string[];
  vibeCategories: VibeCategory[];
  operatingHours: OperatingHours;
}

enum PartnerStatus {
  PENDING_REVIEW = 'pending_review',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}
```

#### Experience Management
```typescript
interface Experience {
  id: string;
  partnerId: string;

  // Basic info
  title: string;
  titleKo: string;
  description: string;
  descriptionKo: string;

  // Offering details
  type: 'voucher' | 'discount' | 'freebie' | 'priority';
  value: number; // KRW value
  originalPrice?: number;
  discountPercent?: number;

  // Validity
  validFrom: Date;
  validUntil: Date;
  maxRedemptions: number;
  currentRedemptions: number;

  // Targeting
  creatorTiers: CreatorTier[];
  minFollowers?: number;
  preferredPlatforms: SocialPlatform[];

  // Requirements
  contentRequirements: {
    platforms: SocialPlatform[];
    minPosts: number;
    hashtags: string[];
    mentions: string[];
    deadline: number; // days after visit
  };

  status: 'draft' | 'active' | 'paused' | 'completed' | 'expired';
}
```

#### Partner Dashboard
```typescript
interface PartnerDashboard {
  // Overview metrics
  totalExperiences: number;
  activeExperiences: number;
  totalRedemptions: number;
  pendingContent: number;

  // Financial
  totalCommissionPaid: number;
  pendingPayouts: number;
  averageExperienceValue: number;

  // Performance
  averageContentViews: number;
  estimatedReach: number;
  vibeScoreAverage: number;

  // Creator interactions
  matchedCreators: number;
  completedCollaborations: number;
  creatorRating: number; // 1-5
}
```

### 2. Creator Side (Demand)

#### Creator Registration
```typescript
interface CreatorRegistration {
  // Step 1: Basic Info
  displayName: string;
  bio: string;
  nationality: string;
  languages: string[];
  profilePhotoUrl: string;

  // Step 2: Social Accounts
  socialAccounts: {
    platform: SocialPlatform;
    handle: string;
    url: string;
    followers: number;
    verified: boolean;
  }[];

  // Step 3: Portfolio
  portfolio: {
    url: string;
    platform: SocialPlatform;
    type: 'photo' | 'video' | 'blog';
    views?: number;
    engagement?: number;
  }[];

  // Step 4: Preferences
  travelStyle: string[];
  vibePreferences: VibeCategory[];
  contentTypes: ('photo' | 'video' | 'blog' | 'reels')[];
  availableRegions: string[];

  // Step 5: Verification
  idVerified: boolean;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

type SocialPlatform = 'instagram' | 'youtube' | 'tiktok' | 'blog' | 'twitter';

enum CreatorTier {
  NANO = 'nano',       // < 1K followers
  MICRO = 'micro',     // 1K - 10K
  MID = 'mid',         // 10K - 100K
  MACRO = 'macro',     // 100K - 1M
  MEGA = 'mega',       // 1M+
}

function calculateCreatorTier(followers: number): CreatorTier {
  if (followers >= 1_000_000) return CreatorTier.MEGA;
  if (followers >= 100_000) return CreatorTier.MACRO;
  if (followers >= 10_000) return CreatorTier.MID;
  if (followers >= 1_000) return CreatorTier.MICRO;
  return CreatorTier.NANO;
}
```

#### Experience Discovery
```typescript
interface ExperienceDiscoveryFilters {
  // Location
  latitude?: number;
  longitude?: number;
  radius?: number; // km

  // Vibe
  vibeCategories?: VibeCategory[];

  // Value
  minValue?: number;
  maxValue?: number;

  // Type
  experienceTypes?: Experience['type'][];
  businessTypes?: PartnerRegistration['businessType'][];

  // Availability
  availableFrom?: Date;
  availableUntil?: Date;
}

async function discoverExperiences(
  creatorId: string,
  filters: ExperienceDiscoveryFilters
): Promise<ExperienceMatch[]> {
  // 1. Get creator profile and preferences
  const creator = await getCreator(creatorId);

  // 2. Find matching experiences
  let query = supabase
    .from('experiences')
    .select(`
      *,
      partners!inner (
        id,
        business_name,
        business_name_ko,
        latitude,
        longitude,
        vibe_categories,
        photos
      )
    `)
    .eq('status', 'active')
    .gte('valid_until', new Date().toISOString())
    .lt('current_redemptions', supabase.raw('max_redemptions'));

  // Apply filters
  if (filters.vibeCategories?.length) {
    query = query.overlaps('partners.vibe_categories', filters.vibeCategories);
  }

  if (filters.latitude && filters.longitude && filters.radius) {
    // Geo filter using PostGIS
    query = query.rpc('nearby_experiences', {
      lat: filters.latitude,
      lng: filters.longitude,
      radius_km: filters.radius,
    });
  }

  const { data: experiences } = await query;

  // 3. Calculate match scores
  return experiences.map((exp) => ({
    ...exp,
    matchScore: calculateMatchScore(creator, exp),
    distance: calculateDistance(
      filters.latitude!,
      filters.longitude!,
      exp.partners.latitude,
      exp.partners.longitude
    ),
  }));
}
```

### 3. Matching System

#### Match Score Algorithm
```typescript
interface MatchFactors {
  vibeAlignment: number;    // 0-1: How well vibes match
  geoProximity: number;     // 0-1: Distance factor
  tierFit: number;          // 0-1: Creator tier vs experience requirements
  platformMatch: number;    // 0-1: Content platform alignment
  historyScore: number;     // 0-1: Past collaboration success
}

function calculateMatchScore(
  creator: Creator,
  experience: Experience
): number {
  const factors: MatchFactors = {
    vibeAlignment: calculateVibeAlignment(
      creator.vibePreferences,
      experience.partner.vibeCategories
    ),
    geoProximity: calculateProximityScore(
      creator.currentLocation,
      experience.partner.location
    ),
    tierFit: calculateTierFit(
      creator.tier,
      experience.creatorTiers
    ),
    platformMatch: calculatePlatformMatch(
      creator.socialAccounts.map((a) => a.platform),
      experience.contentRequirements.platforms
    ),
    historyScore: calculateHistoryScore(creator.id, experience.partnerId),
  };

  // Weighted average
  const weights = {
    vibeAlignment: 0.30,
    geoProximity: 0.20,
    tierFit: 0.25,
    platformMatch: 0.15,
    historyScore: 0.10,
  };

  return Object.entries(factors).reduce(
    (score, [key, value]) => score + value * weights[key as keyof MatchFactors],
    0
  );
}

function calculateVibeAlignment(
  creatorVibes: VibeCategory[],
  partnerVibes: VibeCategory[]
): number {
  const intersection = creatorVibes.filter((v) => partnerVibes.includes(v));
  const union = new Set([...creatorVibes, ...partnerVibes]);
  return intersection.length / union.size; // Jaccard similarity
}
```

### 4. Transaction System

#### Commission Structure
```typescript
const COMMISSION_RATE = 0.20; // 20%

interface Transaction {
  id: string;
  experienceId: string;
  creatorId: string;
  partnerId: string;

  // Value
  experienceValue: number;
  commissionAmount: number;
  partnerPayout: number;

  // Timeline
  createdAt: Date;
  redeemedAt?: Date;
  contentSubmittedAt?: Date;
  contentApprovedAt?: Date;
  payoutCompletedAt?: Date;

  // Status
  status: TransactionStatus;

  // Content
  contentUrls?: string[];
  contentMetrics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

enum TransactionStatus {
  PENDING = 'pending',           // Creator expressed interest
  CONFIRMED = 'confirmed',       // Partner approved
  REDEEMED = 'redeemed',         // Creator visited
  CONTENT_PENDING = 'content_pending', // Waiting for content
  CONTENT_SUBMITTED = 'content_submitted',
  CONTENT_APPROVED = 'content_approved',
  PAYOUT_PENDING = 'payout_pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}
```

#### Payout Flow
```typescript
async function processPartnerPayout(partnerId: string): Promise<void> {
  // 1. Get approved transactions pending payout
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('partner_id', partnerId)
    .eq('status', TransactionStatus.CONTENT_APPROVED);

  if (!transactions?.length) return;

  // 2. Calculate total payout
  const totalPayout = transactions.reduce(
    (sum, tx) => sum + tx.partner_payout,
    0
  );

  // 3. Create payout record
  const { data: payout } = await supabase
    .from('payouts')
    .insert({
      partner_id: partnerId,
      amount: totalPayout,
      transaction_ids: transactions.map((tx) => tx.id),
      status: 'pending',
    })
    .select()
    .single();

  // 4. Process payment (Toss Payments or bank transfer)
  try {
    await processPayment(payout);

    // 5. Update transaction statuses
    await supabase
      .from('transactions')
      .update({ status: TransactionStatus.COMPLETED })
      .in('id', transactions.map((tx) => tx.id));

    await supabase
      .from('payouts')
      .update({ status: 'completed', completed_at: new Date() })
      .eq('id', payout.id);
  } catch (error) {
    await supabase
      .from('payouts')
      .update({ status: 'failed', error_message: error.message })
      .eq('id', payout.id);
  }
}
```

---

## Database Schema

```sql
-- Partners table
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),

  -- Business info
  business_name VARCHAR(255) NOT NULL,
  business_name_ko VARCHAR(255),
  business_type VARCHAR(50) NOT NULL,
  business_registration_number VARCHAR(50),

  -- Location
  address TEXT NOT NULL,
  address_ko TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  google_place_id VARCHAR(255),
  kakao_place_id VARCHAR(255),

  -- Contact
  contact_name VARCHAR(100),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),

  -- Verification
  business_license_url TEXT,
  bank_account JSONB,
  status VARCHAR(20) DEFAULT 'pending_review',

  -- Profile
  description TEXT,
  description_ko TEXT,
  photos TEXT[],
  vibe_categories VARCHAR(20)[],
  operating_hours JSONB,

  -- Metrics
  total_experiences INTEGER DEFAULT 0,
  total_redemptions INTEGER DEFAULT 0,
  average_rating DECIMAL(2, 1),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creators table
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),

  -- Profile
  display_name VARCHAR(100) NOT NULL,
  bio TEXT,
  nationality VARCHAR(50),
  languages TEXT[],
  profile_photo_url TEXT,

  -- Social accounts (JSONB array)
  social_accounts JSONB NOT NULL DEFAULT '[]',

  -- Portfolio (JSONB array)
  portfolio JSONB DEFAULT '[]',

  -- Preferences
  travel_style TEXT[],
  vibe_preferences VARCHAR(20)[],
  content_types VARCHAR(20)[],
  available_regions TEXT[],

  -- Verification & Tier
  id_verified BOOLEAN DEFAULT FALSE,
  tier VARCHAR(20) DEFAULT 'nano',
  total_followers INTEGER DEFAULT 0,
  bank_account JSONB,

  -- Metrics
  total_collaborations INTEGER DEFAULT 0,
  total_content_views INTEGER DEFAULT 0,
  average_rating DECIMAL(2, 1),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experiences table
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,

  -- Basic info
  title VARCHAR(255) NOT NULL,
  title_ko VARCHAR(255),
  description TEXT,
  description_ko TEXT,

  -- Offering
  type VARCHAR(20) NOT NULL,
  value INTEGER NOT NULL, -- KRW
  original_price INTEGER,
  discount_percent INTEGER,

  -- Validity
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  max_redemptions INTEGER NOT NULL,
  current_redemptions INTEGER DEFAULT 0,

  -- Targeting
  creator_tiers VARCHAR(20)[],
  min_followers INTEGER,
  preferred_platforms VARCHAR(20)[],

  -- Requirements
  content_requirements JSONB,

  status VARCHAR(20) DEFAULT 'draft',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES experiences(id),
  creator_id UUID REFERENCES creators(id),
  partner_id UUID REFERENCES partners(id),

  -- Value
  experience_value INTEGER NOT NULL,
  commission_amount INTEGER NOT NULL,
  partner_payout INTEGER NOT NULL,

  -- Timeline
  redeemed_at TIMESTAMPTZ,
  content_submitted_at TIMESTAMPTZ,
  content_approved_at TIMESTAMPTZ,
  payout_completed_at TIMESTAMPTZ,

  status VARCHAR(30) DEFAULT 'pending',

  -- Content
  content_urls TEXT[],
  content_metrics JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_partners_location ON partners (latitude, longitude);
CREATE INDEX idx_partners_status ON partners (status);
CREATE INDEX idx_experiences_status ON experiences (status, valid_until);
CREATE INDEX idx_transactions_status ON transactions (status);
```

---

## API Endpoints

```typescript
// Partner endpoints
POST   /api/mapbox/partners              // Register partner
GET    /api/mapbox/partners/:id          // Get partner details
PUT    /api/mapbox/partners/:id          // Update partner
GET    /api/mapbox/partners/:id/dashboard // Partner dashboard

// Experience endpoints
POST   /api/mapbox/experiences           // Create experience
GET    /api/mapbox/experiences           // List experiences (with filters)
GET    /api/mapbox/experiences/:id       // Get experience details
PUT    /api/mapbox/experiences/:id       // Update experience
DELETE /api/mapbox/experiences/:id       // Delete experience

// Creator endpoints
POST   /api/mapbox/creators              // Register creator
GET    /api/mapbox/creators/:id          // Get creator profile
PUT    /api/mapbox/creators/:id          // Update profile
GET    /api/mapbox/creators/:id/matches  // Get matched experiences

// Transaction endpoints
POST   /api/mapbox/transactions          // Create transaction (book experience)
GET    /api/mapbox/transactions/:id      // Get transaction details
PUT    /api/mapbox/transactions/:id      // Update status
POST   /api/mapbox/transactions/:id/content // Submit content

// Payout endpoints
GET    /api/mapbox/payouts               // List payouts
POST   /api/mapbox/payouts/process       // Process pending payouts
```

---

## Integration Points

### Journey Intelligence Integration
```typescript
// When creator visits a partner location
async function onCreatorVisit(
  creatorId: string,
  partnerId: string,
  transactionId: string
): Promise<void> {
  // 1. Record visit in journey system
  await recordJourneyLocation({
    userId: creatorId,
    latitude: partner.latitude,
    longitude: partner.longitude,
    source: 'mapbox',
    metadata: { transactionId, partnerId },
  });

  // 2. Update transaction status
  await supabase
    .from('transactions')
    .update({
      status: TransactionStatus.REDEEMED,
      redeemed_at: new Date(),
    })
    .eq('id', transactionId);
}
```

### Vibe Matching Integration
```typescript
// Extract vibe from creator's submitted content
async function processContentVibe(
  contentUrl: string,
  partnerId: string
): Promise<void> {
  // 1. Analyze content for vibe
  const vibeAnalysis = await analyzeImageVibe(contentUrl);

  // 2. Update partner's vibe profile
  await updatePartnerVibeProfile(partnerId, vibeAnalysis);

  // 3. Add to global vibe database for search
  await addToVibeDatabase({
    placeId: partnerId,
    embedding: vibeAnalysis.embedding,
    primaryVibe: vibeAnalysis.primaryVibe,
    sourceType: 'creator_content',
    sourceUrl: contentUrl,
  });
}
```

---

## Files Structure

```
/app/src/
├── lib/
│   └── mapbox/
│       ├── index.ts           # Central export
│       ├── partners.ts        # Partner management
│       ├── creators.ts        # Creator management
│       ├── experiences.ts     # Experience CRUD
│       ├── matching.ts        # Match algorithm
│       ├── transactions.ts    # Transaction flow
│       ├── payouts.ts         # Payout processing
│       └── types.ts           # TypeScript types
│
├── components/
│   └── zzik/
│       └── mapbox/
│           ├── PartnerCard.tsx
│           ├── ExperienceCard.tsx
│           ├── CreatorProfile.tsx
│           ├── MatchScore.tsx
│           ├── TransactionFlow.tsx
│           └── PayoutHistory.tsx
│
├── app/
│   ├── partner/
│   │   ├── page.tsx           # Partner dashboard
│   │   ├── register/page.tsx  # Registration flow
│   │   ├── experiences/page.tsx
│   │   └── analytics/page.tsx
│   │
│   ├── creator/
│   │   ├── page.tsx           # Creator dashboard
│   │   ├── register/page.tsx
│   │   ├── discover/page.tsx
│   │   └── collaborations/page.tsx
│   │
│   └── api/
│       └── mapbox/
│           ├── partners/route.ts
│           ├── creators/route.ts
│           ├── experiences/route.ts
│           ├── transactions/route.ts
│           └── payouts/route.ts
│
└── hooks/
    ├── usePartner.ts
    ├── useCreator.ts
    └── useExperiences.ts
```

---

## Competitive Positioning

| Feature | ZZIK MAP BOX | REVU | Mipl |
|---------|--------------|------|------|
| Target Market | Foreign tourists | Domestic Korean | Korean influencers |
| Vibe Matching | ✅ AI-powered | ❌ | ❌ |
| Journey Integration | ✅ Full | ❌ | ❌ |
| Map-Centric UX | ✅ Primary | ❌ | ❌ |
| Multi-language | ✅ 6 languages | ❌ Korean only | ❌ Korean only |
| Commission | 20% | 15-30% | Variable |

---

## Launch Strategy

| Phase | Timeline | Goals |
|-------|----------|-------|
| Soft Launch | M6 | 10 partners, 25 creators, validate flow |
| Beta | M7-M9 | 20 partners, 50 creators, iterate on matching |
| Public | M10+ | 30+ partners, 100+ creators, scale marketing |

### Year 1 Targets
- 30 active partners
- 100 active creators
- 500+ completed transactions
- ₩50M+ GMV (Gross Merchandise Value)

---

## Quality Standards

- Seamless partner onboarding (< 5 min form completion)
- Clear creator value proposition
- Real-time analytics for partners
- Transparent commission and payout tracking
- Content quality guidelines and enforcement
- Dispute resolution process (< 48h response)
- Support 6 languages (ko, en, ja, zh-CN, zh-TW, th)
