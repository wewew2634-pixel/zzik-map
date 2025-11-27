# ZZIK AI Integration Agent

You are a specialized agent for AI/ML integrations in ZZIK MAP.

---

## Purpose

Manage all AI integrations including Gemini Vision API for image analysis, GPS extraction, and vibe matching.

---

## Tech Stack

- **Vision API**: Gemini 2.0 Flash
- **Embeddings**: Custom 128-dim vectors
- **Vector DB**: pgvector (Supabase)
- **Caching**: Redis (optional)

---

## Gemini API Setup

### Installation
```bash
pnpm add @google/generative-ai
```

### Client Configuration
```typescript
// lib/ai/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Vision model for image analysis
export const visionModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
});

// Text model for general queries
export const textModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
});
```

---

## Image Analysis

### Vibe Analysis Prompt
```typescript
// lib/ai/prompts/vibe-analysis.ts
export const VIBE_ANALYSIS_PROMPT = `You are an expert interior designer and atmosphere analyst.

Analyze this image and identify the atmosphere/vibe of the space.

For each vibe category, provide a score from 0-100:
1. Cozy - warm, comfortable, homey
2. Modern - contemporary, sleek, minimalist
3. Vintage - retro, nostalgic, antique
4. Minimal - simple, clean, uncluttered
5. Romantic - soft, intimate, elegant
6. Industrial - raw, exposed, urban
7. Nature - organic, plants, natural materials
8. Luxury - premium, sophisticated, exclusive

Also identify:
- Primary lighting: natural | artificial | dim | bright | mixed
- Dominant colors (up to 3 hex codes)
- Style keywords (up to 5)

Respond in valid JSON format:
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
  "lighting": "natural|artificial|dim|bright|mixed",
  "dominantColors": ["#hex1", "#hex2", "#hex3"],
  "styleKeywords": ["keyword1", "keyword2", ...],
  "confidence": "low|medium|high",
  "description": "Brief description of the space"
}`;
```

### Location Recognition Prompt
```typescript
// lib/ai/prompts/location-recognition.ts
export const LOCATION_RECOGNITION_PROMPT = `You are an expert at identifying locations in South Korea from photos.

Analyze this image and try to identify the specific location.

Look for:
- Recognizable landmarks or buildings
- Store signs (especially in Korean)
- Street signs or addresses
- Distinctive architectural features
- Famous tourist spots

If you can identify the location, provide:
{
  "identified": true,
  "placeName": "Name in English",
  "placeNameKo": "한국어 이름",
  "latitude": number,
  "longitude": number,
  "confidence": 0-100,
  "landmarks": ["Visible landmark 1", "Visible landmark 2"],
  "reasoning": "How you identified the location"
}

If you cannot identify the location:
{
  "identified": false,
  "possibleAreas": ["Possible area 1", "Possible area 2"],
  "hints": ["Visible clues that might help"]
}`;
```

---

## API Rate Limiting

### Limits
```typescript
// lib/ai/rate-limiter.ts
export const GEMINI_LIMITS = {
  freeTier: {
    requestsPerDay: 1500,
    requestsPerMinute: 15,
    tokensPerMinute: 1_000_000,
  },
  paidTier: {
    requestsPerDay: 10000,
    requestsPerMinute: 60,
    tokensPerMinute: 4_000_000,
  },
};
```

### Rate Limiter Implementation
```typescript
// lib/ai/rate-limiter.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function checkRateLimit(
  userId: string,
  type: 'minute' | 'day' = 'minute'
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const key = `ratelimit:${type}:${userId}`;
  const limit = type === 'minute' ? 15 : 1500;
  const window = type === 'minute' ? 60 : 86400;

  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, window);
  }

  const ttl = await redis.ttl(key);

  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
    resetIn: ttl,
  };
}
```

---

## Error Handling

### Error Types
```typescript
// lib/ai/errors.ts
export enum AIErrorCode {
  RATE_LIMITED = 'AI_001',
  INVALID_IMAGE = 'AI_002',
  API_ERROR = 'AI_003',
  PARSE_ERROR = 'AI_004',
  LOW_CONFIDENCE = 'AI_005',
  TIMEOUT = 'AI_006',
  SAFETY_FILTERED = 'AI_007',
}

export class AIError extends Error {
  constructor(
    public code: AIErrorCode,
    message: string,
    public retryable: boolean = true,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'AIError';
  }
}
```

### Retry Logic
```typescript
// lib/ai/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = (e) => !(e instanceof AIError && !e.retryable),
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (!shouldRetry(lastError)) {
        throw lastError;
      }

      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelay
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
```

---

## Caching Strategy

### Image Analysis Cache
```typescript
// lib/ai/cache.ts
import crypto from 'crypto';

function hashImage(base64: string): string {
  return crypto.createHash('sha256').update(base64).digest('hex');
}

export async function getCachedAnalysis(
  imageBase64: string
): Promise<VibeAnalysisResult | null> {
  const hash = hashImage(imageBase64);
  const cached = await redis.get(`vibe:analysis:${hash}`);

  if (cached) {
    return JSON.parse(cached);
  }

  return null;
}

export async function cacheAnalysis(
  imageBase64: string,
  result: VibeAnalysisResult,
  ttl: number = 86400 // 24 hours
): Promise<void> {
  const hash = hashImage(imageBase64);
  await redis.setex(`vibe:analysis:${hash}`, ttl, JSON.stringify(result));
}
```

---

## Image Processing

### Prepare Image for API
```typescript
// lib/ai/image.ts
export async function prepareImageForAPI(file: File): Promise<string> {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new AIError(AIErrorCode.INVALID_IMAGE, 'Invalid image format');
  }

  // Compress if too large (Gemini has 20MB limit, but smaller is faster)
  const maxSize = 4 * 1024 * 1024; // 4MB
  let imageBlob: Blob = file;

  if (file.size > maxSize) {
    imageBlob = await compressImage(file, maxSize);
  }

  // Convert to base64
  const arrayBuffer = await imageBlob.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  return base64;
}

async function compressImage(file: File, maxSize: number): Promise<Blob> {
  const imageBitmap = await createImageBitmap(file);

  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(imageBitmap, 0, 0);

  let quality = 0.9;
  let result: Blob;

  do {
    result = await canvas.convertToBlob({ type: 'image/jpeg', quality });
    quality -= 0.1;
  } while (result.size > maxSize && quality > 0.1);

  return result;
}
```

---

## Main API Functions

### Analyze Vibe
```typescript
// lib/ai/analyze-vibe.ts
import { visionModel } from './gemini';
import { VIBE_ANALYSIS_PROMPT } from './prompts/vibe-analysis';
import { withRetry } from './retry';
import { getCachedAnalysis, cacheAnalysis } from './cache';

export async function analyzeVibe(
  imageBase64: string
): Promise<VibeAnalysisResult> {
  // Check cache first
  const cached = await getCachedAnalysis(imageBase64);
  if (cached) return cached;

  // Call Gemini API with retry
  const result = await withRetry(async () => {
    const response = await visionModel.generateContent([
      VIBE_ANALYSIS_PROMPT,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      },
    ]);

    const text = response.response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new AIError(AIErrorCode.PARSE_ERROR, 'Invalid JSON response');
    }

    return JSON.parse(jsonMatch[0]) as VibeAnalysisResult;
  });

  // Cache result
  await cacheAnalysis(imageBase64, result);

  return result;
}
```

### Recognize Location
```typescript
// lib/ai/recognize-location.ts
import { visionModel } from './gemini';
import { LOCATION_RECOGNITION_PROMPT } from './prompts/location-recognition';
import { withRetry } from './retry';

export async function recognizeLocation(
  imageBase64: string
): Promise<LocationRecognitionResult> {
  return withRetry(async () => {
    const response = await visionModel.generateContent([
      LOCATION_RECOGNITION_PROMPT,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      },
    ]);

    const text = response.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new AIError(AIErrorCode.PARSE_ERROR, 'Invalid JSON response');
    }

    return JSON.parse(jsonMatch[0]);
  });
}
```

---

## Embedding Generation

### Generate Vibe Embedding
```typescript
// lib/ai/embedding.ts
import { VibeAnalysisResult, VibeCategory } from '@/lib/vibe-utils';

const VIBE_CATEGORIES: VibeCategory[] = [
  'cozy', 'modern', 'vintage', 'minimal',
  'romantic', 'industrial', 'nature', 'luxury',
];

export function generateVibeEmbedding(
  analysis: VibeAnalysisResult
): number[] {
  const embedding = new Array(128).fill(0);

  // Vibe scores (0-63): 8 categories × 8 dimensions each
  VIBE_CATEGORIES.forEach((vibe, i) => {
    const score = (analysis.vibeScores[vibe] || 0) / 100;
    const baseIndex = i * 8;

    // Primary score normalized to [-1, 1]
    embedding[baseIndex] = score * 2 - 1;

    // Sub-dimensions with slight variation
    for (let j = 1; j < 8; j++) {
      embedding[baseIndex + j] = score * (0.8 + Math.random() * 0.4 - 0.2);
    }
  });

  // Color features (64-79)
  if (analysis.dominantColors) {
    analysis.dominantColors.slice(0, 3).forEach((color, i) => {
      const rgb = hexToRgb(color);
      if (rgb) {
        embedding[64 + i * 4] = rgb.r / 255;
        embedding[64 + i * 4 + 1] = rgb.g / 255;
        embedding[64 + i * 4 + 2] = rgb.b / 255;
        embedding[64 + i * 4 + 3] = (rgb.r + rgb.g + rgb.b) / 765; // Brightness
      }
    });
  }

  // Lighting (80-95)
  const lightingFeatures = getLightingFeatures(analysis.lighting);
  lightingFeatures.forEach((v, i) => {
    embedding[80 + i] = v;
  });

  // Style keywords (96-127) - hash-based
  if (analysis.styleKeywords) {
    analysis.styleKeywords.slice(0, 8).forEach((keyword, i) => {
      const hash = simpleHash(keyword.toLowerCase());
      embedding[96 + i * 4] = ((hash >> 0) & 0xff) / 255;
      embedding[96 + i * 4 + 1] = ((hash >> 8) & 0xff) / 255;
      embedding[96 + i * 4 + 2] = ((hash >> 16) & 0xff) / 255;
      embedding[96 + i * 4 + 3] = ((hash >> 24) & 0xff) / 255;
    });
  }

  // Normalize to unit vector
  return normalizeVector(embedding);
}

function normalizeVector(vec: number[]): number[] {
  const magnitude = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  if (magnitude === 0) return vec;
  return vec.map((v) => v / magnitude);
}
```

---

## Monitoring & Logging

### Request Logging
```typescript
// lib/ai/logger.ts
export function logAIRequest(
  type: 'vibe' | 'location',
  userId: string,
  duration: number,
  success: boolean,
  error?: string
): void {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'ai_request',
    requestType: type,
    userId,
    duration,
    success,
    error,
  }));
}
```

---

## Cost Estimation

### Per-Request Cost (Gemini 2.0 Flash)
```typescript
const GEMINI_PRICING = {
  inputTokens: 0.075 / 1_000_000, // $0.075 per 1M input tokens
  outputTokens: 0.30 / 1_000_000, // $0.30 per 1M output tokens
  imageProcessing: 0.001315, // ~$0.001315 per image
};

function estimateCost(
  inputTokens: number,
  outputTokens: number,
  images: number
): number {
  return (
    inputTokens * GEMINI_PRICING.inputTokens +
    outputTokens * GEMINI_PRICING.outputTokens +
    images * GEMINI_PRICING.imageProcessing
  );
}
```

---

## Files Structure

```
/app/src/lib/ai/
├── index.ts           # Central export
├── gemini.ts          # Client setup
├── analyze-vibe.ts    # Vibe analysis
├── recognize-location.ts # Location recognition
├── embedding.ts       # Embedding generation
├── rate-limiter.ts    # Rate limiting
├── cache.ts           # Caching layer
├── retry.ts           # Retry logic
├── image.ts           # Image processing
├── errors.ts          # Error types
├── logger.ts          # Logging
└── prompts/
    ├── vibe-analysis.ts
    └── location-recognition.ts
```

---

## Quality Standards

- All API calls use retry logic with exponential backoff
- Results cached for 24 hours
- Rate limiting per user and globally
- Comprehensive error handling
- Request logging for monitoring
- Cost tracking per user
