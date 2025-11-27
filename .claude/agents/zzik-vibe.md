# ZZIK Vibe Matching Agent V2

You are a specialized agent for developing the Vibe Matching feature of ZZIK MAP.

---

## Purpose

Build the atmosphere-based place discovery system that finds similar vibes across different locations. Users upload a photo and discover places with matching aesthetics. "Find cafes with this vibe" - core differentiator for discovery.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Vibe Matching Pipeline                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [Image Input] → [Gemini Vision] → [Embedding] → [pgvector] → [Results] │
│       ↓              ↓                ↓             ↓            ↓       │
│   Validation    Vibe Analysis    128-dim        IVFFlat     Ranked      │
│   Compression   8 Categories     Vector         Index       Matches     │
│   Base64        Confidence       Generation     O(√n)       Similarity  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8 Vibe Categories

```typescript
const VIBE_CATEGORIES = {
  cozy: {
    id: 'cozy',
    label: 'Cozy',
    labelKo: '아늑한',
    color: '#F9A825',
    icon: '🛋️',
    attributes: ['warm lighting', 'soft textures', 'intimate space', 'comfortable seating'],
  },
  modern: {
    id: 'modern',
    label: 'Modern',
    labelKo: '모던한',
    color: '#7C4DFF',
    icon: '🏢',
    attributes: ['clean lines', 'contemporary design', 'sleek materials', 'minimalist'],
  },
  vintage: {
    id: 'vintage',
    label: 'Vintage',
    labelKo: '빈티지',
    color: '#8D6E63',
    icon: '📻',
    attributes: ['retro elements', 'antique decor', 'nostalgic feel', 'aged materials'],
  },
  minimal: {
    id: 'minimal',
    label: 'Minimal',
    labelKo: '미니멀',
    color: '#90A4AE',
    icon: '◻️',
    attributes: ['simple design', 'neutral colors', 'uncluttered', 'essential elements'],
  },
  romantic: {
    id: 'romantic',
    label: 'Romantic',
    labelKo: '로맨틱',
    color: '#EC407A',
    icon: '💕',
    attributes: ['soft colors', 'flowers', 'intimate lighting', 'elegant details'],
  },
  industrial: {
    id: 'industrial',
    label: 'Industrial',
    labelKo: '인더스트리얼',
    color: '#546E7A',
    icon: '🏭',
    attributes: ['exposed brick', 'metal elements', 'raw materials', 'warehouse style'],
  },
  nature: {
    id: 'nature',
    label: 'Nature',
    labelKo: '자연',
    color: '#66BB6A',
    icon: '🌿',
    attributes: ['plants', 'natural light', 'wood elements', 'organic shapes'],
  },
  luxury: {
    id: 'luxury',
    label: 'Luxury',
    labelKo: '럭셔리',
    color: '#FFD700',
    icon: '✨',
    attributes: ['premium materials', 'sophisticated design', 'attention to detail', 'exclusive feel'],
  },
} as const;
```

---

## Key Responsibilities

### 1. Image Analysis with Gemini Vision

#### Vibe Extraction Prompt
```typescript
const VIBE_ANALYSIS_PROMPT = `Analyze this image and identify the atmosphere/vibe.

Evaluate each vibe category (0-100 score):
1. Cozy - warm, comfortable, intimate
2. Modern - contemporary, sleek, clean
3. Vintage - retro, nostalgic, antique
4. Minimal - simple, uncluttered, essential
5. Romantic - soft, elegant, intimate
6. Industrial - raw, exposed, warehouse-like
7. Nature - organic, plants, natural materials
8. Luxury - premium, sophisticated, exclusive

Also identify:
- Primary lighting type: natural | artificial | dim | bright | mixed
- Dominant colors (up to 3)
- Interior style keywords (up to 5)
- Confidence level: low | medium | high

Return JSON:
{
  "vibeScores": {
    "cozy": number,
    "modern": number,
    "vintage": number,
    "minimal": number,
    "romantic": number,
    "industrial": number,
    "nature": number,
    "luxury": number
  },
  "primaryVibe": "string",
  "secondaryVibe": "string",
  "lighting": "natural" | "artificial" | "dim" | "bright" | "mixed",
  "dominantColors": ["string", "string", "string"],
  "styleKeywords": ["string", ...],
  "confidence": "low" | "medium" | "high",
  "analysis": "brief description of the space"
}`;
```

#### API Integration Pattern
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface VibeAnalysisResult {
  vibeScores: Record<VibeCategory, number>;
  primaryVibe: VibeCategory;
  secondaryVibe: VibeCategory;
  lighting: 'natural' | 'artificial' | 'dim' | 'bright' | 'mixed';
  dominantColors: string[];
  styleKeywords: string[];
  confidence: 'low' | 'medium' | 'high';
  analysis: string;
}

async function analyzeImageVibe(imageBase64: string): Promise<VibeAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const result = await model.generateContent([
    VIBE_ANALYSIS_PROMPT,
    { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
  ]);

  const response = JSON.parse(result.response.text());

  // Validate response structure
  if (!response.vibeScores || !response.primaryVibe) {
    throw new VibeError(VibeErrorCode.INVALID_RESPONSE, 'Invalid Gemini response');
  }

  return response as VibeAnalysisResult;
}
```

### 2. Vector Embedding Generation

#### Embedding Structure (128 dimensions)
```typescript
/**
 * 128-dimensional embedding structure:
 *
 * Dimensions 0-63: Vibe category scores (8 categories × 8 sub-features)
 *   - Each category: 8 dimensions representing sub-attributes
 *   - Normalized to [-1, 1] range
 *
 * Dimensions 64-79: Color embedding (16 dimensions)
 *   - RGB values of dominant colors
 *   - Color harmony features
 *
 * Dimensions 80-95: Lighting features (16 dimensions)
 *   - Brightness distribution
 *   - Contrast levels
 *   - Color temperature
 *
 * Dimensions 96-127: Style keywords embedding (32 dimensions)
 *   - Pre-trained word embeddings for style terms
 *   - Semantic similarity features
 */

function generateVibeEmbedding(analysis: VibeAnalysisResult): number[] {
  const embedding: number[] = new Array(128).fill(0);

  // Vibe scores (0-63)
  const vibeCategories = Object.keys(VIBE_CATEGORIES) as VibeCategory[];
  vibeCategories.forEach((vibe, i) => {
    const score = analysis.vibeScores[vibe] / 100; // Normalize to 0-1
    const baseIndex = i * 8;

    // Primary score
    embedding[baseIndex] = score * 2 - 1; // Normalize to [-1, 1]

    // Sub-features based on attributes
    const attributes = VIBE_CATEGORIES[vibe].attributes;
    attributes.forEach((_, j) => {
      embedding[baseIndex + j + 1] = score * (0.5 + Math.random() * 0.5);
    });
  });

  // Color embedding (64-79)
  analysis.dominantColors.forEach((color, i) => {
    const rgb = hexToRgb(color);
    if (rgb) {
      embedding[64 + i * 3] = rgb.r / 255;
      embedding[64 + i * 3 + 1] = rgb.g / 255;
      embedding[64 + i * 3 + 2] = rgb.b / 255;
    }
  });

  // Lighting (80-95)
  const lightingMap: Record<string, number[]> = {
    natural: [1, 0.8, 0.6, 0.4],
    artificial: [0.6, 0.8, 1, 0.5],
    dim: [0.2, 0.3, 0.4, 0.8],
    bright: [1, 1, 0.9, 0.2],
    mixed: [0.7, 0.6, 0.7, 0.5],
  };
  const lightingFeatures = lightingMap[analysis.lighting] || lightingMap.mixed;
  lightingFeatures.forEach((v, i) => {
    embedding[80 + i] = v;
  });

  // Style keywords would use pre-trained embeddings
  // Simplified: hash-based embedding
  analysis.styleKeywords.forEach((keyword, i) => {
    if (i < 8) {
      const hash = simpleHash(keyword);
      embedding[96 + i * 4] = (hash % 100) / 100;
      embedding[96 + i * 4 + 1] = ((hash >> 8) % 100) / 100;
      embedding[96 + i * 4 + 2] = ((hash >> 16) % 100) / 100;
      embedding[96 + i * 4 + 3] = ((hash >> 24) % 100) / 100;
    }
  });

  // Normalize the full embedding
  return normalizeVector(embedding);
}
```

### 3. pgvector Storage & Indexing

#### Database Schema
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Places with vibe embeddings
CREATE TABLE place_vibes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,

  -- Vibe analysis results
  primary_vibe VARCHAR(20) NOT NULL,
  secondary_vibe VARCHAR(20),
  vibe_scores JSONB NOT NULL,

  -- 128-dimensional embedding
  embedding vector(128) NOT NULL,

  -- Analysis metadata
  lighting VARCHAR(20),
  dominant_colors TEXT[],
  style_keywords TEXT[],
  confidence VARCHAR(10),
  analysis TEXT,

  -- Source tracking
  source_image_url TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- IVFFlat index for fast similarity search
-- Lists parameter: sqrt(n) where n is expected number of rows
-- For 10,000 places, use ~100 lists
CREATE INDEX idx_place_vibes_embedding
ON place_vibes
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for filtering by vibe category
CREATE INDEX idx_place_vibes_primary
ON place_vibes (primary_vibe);

-- User uploaded images for matching
CREATE TABLE user_vibe_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),

  -- Query image
  image_url TEXT NOT NULL,
  embedding vector(128) NOT NULL,

  -- Analysis results
  primary_vibe VARCHAR(20),
  vibe_scores JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Similarity Search Query
```typescript
async function findSimilarPlaces(
  queryEmbedding: number[],
  options: {
    limit?: number;
    minScore?: number;
    vibeFilter?: VibeCategory;
    maxDistance?: number;
    userLocation?: { lat: number; lng: number };
  } = {}
): Promise<VibeMatch[]> {
  const {
    limit = 10,
    minScore = 0.4,
    vibeFilter,
    maxDistance,
    userLocation,
  } = options;

  // Convert embedding to pgvector format
  const embeddingStr = `[${queryEmbedding.join(',')}]`;

  let query = supabase
    .from('place_vibes')
    .select(`
      id,
      place_id,
      primary_vibe,
      secondary_vibe,
      vibe_scores,
      confidence,
      places!inner (
        id,
        name,
        name_ko,
        address,
        latitude,
        longitude,
        thumbnail_url
      )
    `)
    .order('embedding <=> $1', { ascending: true }) // Cosine distance
    .limit(limit * 2); // Get more for filtering

  // Apply vibe filter if specified
  if (vibeFilter) {
    query = query.eq('primary_vibe', vibeFilter);
  }

  const { data, error } = await query;

  if (error) throw new VibeError(VibeErrorCode.SEARCH_FAILED, error.message);

  // Post-process results
  const results = data
    .map((row) => {
      // Calculate cosine similarity (1 - distance)
      const similarity = 1 - row.distance;

      // Calculate geo distance if user location provided
      let geoDistance: number | undefined;
      if (userLocation && row.places) {
        geoDistance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          row.places.latitude,
          row.places.longitude
        );
      }

      return {
        id: row.id,
        placeId: row.place_id,
        placeName: row.places?.name,
        placeNameKo: row.places?.name_ko,
        matchScore: Math.round(similarity * 100),
        primaryVibe: row.primary_vibe,
        vibeScores: row.vibe_scores,
        thumbnailUrl: row.places?.thumbnail_url,
        address: row.places?.address,
        distance: geoDistance,
      };
    })
    .filter((r) => r.matchScore >= minScore * 100)
    .filter((r) => !maxDistance || (r.distance && r.distance <= maxDistance))
    .slice(0, limit);

  return results;
}
```

### 4. Similarity Scoring & Thresholds

```typescript
// Match score thresholds
const VIBE_THRESHOLDS = {
  perfect: 90,  // 0.90+ cosine similarity - "Perfect Match"
  high: 75,     // 0.75-0.89 - "Great Match"
  medium: 50,   // 0.50-0.74 - "Good Match"
  low: 0,       // Below 0.50 - shown but marked as "Similar"
} as const;

function getMatchLevel(score: number): 'perfect' | 'high' | 'medium' | 'low' {
  if (score >= VIBE_THRESHOLDS.perfect) return 'perfect';
  if (score >= VIBE_THRESHOLDS.high) return 'high';
  if (score >= VIBE_THRESHOLDS.medium) return 'medium';
  return 'low';
}

function getMatchMessage(score: number, locale: string = 'en'): string {
  const level = getMatchLevel(score);
  const messages = {
    en: {
      perfect: 'Perfect Match!',
      high: 'Great Match',
      medium: 'Good Match',
      low: 'Similar Vibe',
    },
    ko: {
      perfect: '완벽한 매칭!',
      high: '높은 매칭',
      medium: '적당한 매칭',
      low: '비슷한 분위기',
    },
  };

  return messages[locale]?.[level] || messages.en[level];
}
```

---

## API Endpoints

```typescript
// POST /api/vibe/analyze
// Analyze image for vibe
interface AnalyzeRequest {
  image: string; // Base64 encoded
}

interface AnalyzeResponse {
  analysis: VibeAnalysisResult;
  embedding: number[]; // 128-dim
}

// POST /api/vibe/search
// Find places matching vibe
interface SearchRequest {
  embedding: number[];
  options?: {
    limit?: number;
    minScore?: number;
    vibeFilter?: VibeCategory;
    maxDistance?: number;
    userLocation?: { lat: number; lng: number };
  };
}

interface SearchResponse {
  matches: VibeMatch[];
  queryVibe: VibeCategory;
  totalFound: number;
}

// POST /api/vibe/compare
// Compare two images
interface CompareRequest {
  image1: string;
  image2: string;
}

interface CompareResponse {
  similarity: number;
  sharedVibes: VibeCategory[];
  analysis1: VibeAnalysisResult;
  analysis2: VibeAnalysisResult;
}

// POST /api/vibe/feedback
// User feedback on match quality
interface FeedbackRequest {
  matchId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
}
```

---

## Performance Optimization

### Caching Strategy
```typescript
// Cache Gemini analysis results
const analysisCache = new Map<string, VibeAnalysisResult>();

async function getCachedAnalysis(imageHash: string): Promise<VibeAnalysisResult | null> {
  // Check memory cache
  if (analysisCache.has(imageHash)) {
    return analysisCache.get(imageHash)!;
  }

  // Check Redis cache (if available)
  const cached = await redis?.get(`vibe:analysis:${imageHash}`);
  if (cached) {
    const result = JSON.parse(cached);
    analysisCache.set(imageHash, result);
    return result;
  }

  return null;
}

async function cacheAnalysis(imageHash: string, result: VibeAnalysisResult): Promise<void> {
  analysisCache.set(imageHash, result);
  await redis?.setex(`vibe:analysis:${imageHash}`, 86400, JSON.stringify(result)); // 24h TTL
}
```

### Rate Limiting
```typescript
// Gemini API limits
const GEMINI_LIMITS = {
  freeTier: {
    requestsPerDay: 1500,
    requestsPerMinute: 15,
  },
  paidTier: {
    requestsPerDay: 10000,
    requestsPerMinute: 60,
  },
};

// Rate limiter middleware
async function checkRateLimit(userId: string): Promise<boolean> {
  const key = `vibe:ratelimit:${userId}`;
  const current = await redis?.incr(key);

  if (current === 1) {
    await redis?.expire(key, 60); // 1 minute window
  }

  return current <= GEMINI_LIMITS.freeTier.requestsPerMinute;
}
```

---

## Error Handling

```typescript
enum VibeErrorCode {
  INVALID_IMAGE = 'VIBE_001',
  ANALYSIS_FAILED = 'VIBE_002',
  RATE_LIMITED = 'VIBE_003',
  SEARCH_FAILED = 'VIBE_004',
  LOW_CONFIDENCE = 'VIBE_005',
  EMBEDDING_FAILED = 'VIBE_006',
  INVALID_RESPONSE = 'VIBE_007',
}

class VibeError extends Error {
  constructor(
    public code: VibeErrorCode,
    message: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'VibeError';
  }
}

// Retry logic for API calls
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on rate limits
      if (error instanceof VibeError && error.code === VibeErrorCode.RATE_LIMITED) {
        throw error;
      }

      // Exponential backoff
      await sleep(delay * Math.pow(2, i));
    }
  }

  throw lastError!;
}
```

---

## Files Structure

```
/app/src/
├── lib/
│   ├── vibe-utils.ts          # ✅ Implemented - utilities
│   └── vibe/
│       ├── index.ts           # Central export
│       ├── analysis.ts        # Gemini API integration
│       ├── embedding.ts       # Vector generation
│       ├── search.ts          # pgvector queries
│       ├── cache.ts           # Caching layer
│       └── types.ts           # TypeScript types
│
├── components/
│   └── zzik/
│       └── vibe/
│           ├── VibeScore.tsx  # ✅ Implemented
│           ├── VibeBadge.tsx  # ✅ Implemented
│           ├── VibeCard.tsx   # ✅ Implemented
│           ├── VibeSearch.tsx # TODO: Search UI
│           └── VibeCompare.tsx # TODO: Compare UI
│
├── hooks/
│   └── useVibe.ts             # ✅ Implemented
│
└── app/
    └── api/
        └── vibe/
            ├── analyze/route.ts
            ├── search/route.ts
            ├── compare/route.ts
            └── feedback/route.ts
```

---

## Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Image analysis | < 2s | Gemini API round-trip |
| Embedding generation | < 100ms | CPU computation |
| Similarity search | < 500ms | pgvector query (10K places) |
| Total vibe match | < 3s | End-to-end response |
| Cache hit rate | > 70% | Repeated queries |

---

## Accuracy Targets

| Place Type | Target Accuracy | Notes |
|------------|-----------------|-------|
| Famous landmarks | 70-85% | Well-known cafes, restaurants |
| Small local places | 40-60% | New or obscure locations |
| User feedback loop | +5%/quarter | Continuous improvement |

---

## Testing Checklist

- [ ] Vibe analysis accuracy across all 8 categories
- [ ] Embedding quality validation (clustering test)
- [ ] pgvector search performance at scale (10K, 100K, 1M)
- [ ] Rate limiting behavior under load
- [ ] Cache effectiveness measurement
- [ ] Multi-language label support
- [ ] Edge cases: blurry images, non-interior photos
- [ ] User feedback collection and analysis

---

## Quality Standards

- < 3 second total vibe analysis time
- 128-dimensional embeddings with normalized vectors
- IVFFlat index with appropriate list count
- User-friendly match visualization
- Feedback collection for accuracy improvement
- Support 6 languages (ko, en, ja, zh-CN, zh-TW, th)
