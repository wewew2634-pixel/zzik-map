# ZZIK Journey Intelligence Agent V2

You are a specialized agent for developing the Journey Intelligence feature of ZZIK MAP.

---

## Purpose

Build the core recommendation engine that analyzes travel patterns and suggests next destinations based on similar travelers' journeys. This is ZZIK's primary differentiator - "With one photo, know where 847 travelers went next."

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Journey Intelligence Pipeline                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [Photo Upload] → [GPS Extraction] → [Journey Storage] → [Analysis] │
│       ↓                  ↓                  ↓                ↓       │
│   Validation      3-Step Fallback      Supabase        Recommendations│
│   Compression     EXIF→Gemini→Manual   PostgreSQL      Content-Based  │
│   Preview         50-60% success       pgvector        → Hybrid → CF  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Responsibilities

### 1. Photo Upload & Processing

#### File Validation
```typescript
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PHOTOS_PER_JOURNEY = 10;
```

#### Upload Flow
1. Validate file type and size
2. Generate preview URL (blob)
3. Compress if needed (target < 2MB for API)
4. Extract timestamp from EXIF
5. Start GPS extraction pipeline

### 2. GPS Extraction (3-Step Fallback)

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: EXIF Extraction (50-60% success rate)               │
│ - Parse GPS coordinates from image metadata                 │
│ - Check for GPSLatitude, GPSLongitude, GPSAltitude         │
│ - Validate coordinates are within Korea or valid range      │
└───────────────────────────┬─────────────────────────────────┘
                            │ If no EXIF GPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Gemini Vision API (40-85% depending on location)    │
│ - Send image to Gemini 2.0 Flash Vision                     │
│ - Prompt: "Identify location landmarks in Korea"            │
│ - Parse structured response for coordinates                 │
│ - Famous places: 70-85% accuracy                            │
│ - Small/local places: 40-60% accuracy                       │
└───────────────────────────┬─────────────────────────────────┘
                            │ If Gemini fails
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Manual Tagging (User input)                         │
│ - Show map picker UI (Kakao Maps)                           │
│ - Allow text search for location                            │
│ - User confirms pin placement                               │
│ - Store with source: 'manual'                               │
└─────────────────────────────────────────────────────────────┘
```

#### EXIF Extraction Code Pattern
```typescript
import ExifReader from 'exifreader';

async function extractExifGps(file: File): Promise<GeoLocation | null> {
  try {
    const tags = await ExifReader.load(file);

    const lat = tags.GPSLatitude?.description;
    const lng = tags.GPSLongitude?.description;
    const latRef = tags.GPSLatitudeRef?.value?.[0];
    const lngRef = tags.GPSLongitudeRef?.value?.[0];

    if (!lat || !lng) return null;

    // Convert to decimal
    const latitude = parseFloat(lat) * (latRef === 'S' ? -1 : 1);
    const longitude = parseFloat(lng) * (lngRef === 'W' ? -1 : 1);

    // Validate Korean coordinates (rough bounds)
    if (latitude < 33 || latitude > 43 || longitude < 124 || longitude > 132) {
      // Outside Korea, still valid but flag for review
    }

    return {
      lat: latitude,
      lng: longitude,
      accuracy: 10, // EXIF is typically accurate
      source: 'exif',
    };
  } catch (error) {
    console.error('EXIF extraction failed:', error);
    return null;
  }
}
```

#### Gemini Vision API Pattern
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function analyzeWithGemini(imageBase64: string): Promise<GeoLocation | null> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Analyze this image and identify the location in South Korea.

  Return a JSON response with:
  {
    "identified": true/false,
    "placeName": "place name in English",
    "placeNameKo": "한글 장소명",
    "latitude": number,
    "longitude": number,
    "confidence": 0-100,
    "landmarks": ["identifiable landmarks"]
  }

  If you cannot identify the location, return { "identified": false }`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
  ]);

  const response = JSON.parse(result.response.text());

  if (!response.identified || response.confidence < 40) {
    return null;
  }

  return {
    lat: response.latitude,
    lng: response.longitude,
    accuracy: response.confidence,
    source: 'gemini',
  };
}
```

### 3. Recommendation Algorithm

#### Phase 1: Content-Based Filtering (M1-M6)

```typescript
interface UserProfile {
  nationality: string;
  tripDuration: number; // days
  travelStyle: 'backpacker' | 'standard' | 'luxury';
  interests: string[];
  language: string;
}

interface JourneyPattern {
  userId: string;
  locations: GeoLocation[];
  timestamps: Date[];
  profile: UserProfile;
}

async function getContentBasedRecommendations(
  currentLocation: GeoLocation,
  userProfile: UserProfile,
  limit: number = 5
): Promise<Recommendation[]> {
  // 1. Find similar user profiles
  const similarProfiles = await supabase
    .from('journeys')
    .select('*')
    .eq('nationality', userProfile.nationality)
    .gte('trip_duration', userProfile.tripDuration - 2)
    .lte('trip_duration', userProfile.tripDuration + 2)
    .limit(100);

  // 2. Find next destinations from those profiles
  const nextDestinations = await findNextDestinations(
    similarProfiles.data,
    currentLocation
  );

  // 3. Rank by frequency and recency
  return rankDestinations(nextDestinations, limit);
}
```

#### Phase 2: Hybrid Filtering (M6-M12)

```typescript
async function getHybridRecommendations(
  currentLocation: GeoLocation,
  userProfile: UserProfile,
  limit: number = 5
): Promise<Recommendation[]> {
  // Content-based component (60% weight)
  const contentRecs = await getContentBasedRecommendations(
    currentLocation,
    userProfile,
    limit * 2
  );

  // Popularity component (40% weight)
  const popularRecs = await getPopularDestinations(
    currentLocation,
    limit * 2,
    { timeWindow: '30d' }
  );

  // Merge and re-rank
  return mergeRecommendations(contentRecs, popularRecs, {
    contentWeight: 0.6,
    popularityWeight: 0.4,
  });
}
```

#### Phase 3: Collaborative Filtering (M12+)

```typescript
// Requires 5,000+ journeys for statistical significance
async function getCollaborativeRecommendations(
  userId: string,
  currentLocation: GeoLocation,
  limit: number = 5
): Promise<Recommendation[]> {
  // 1. Build user-location matrix
  const userLocationMatrix = await buildUserLocationMatrix();

  // 2. Find similar users (not just profile, but behavior)
  const similarUsers = await findSimilarUsers(userId, userLocationMatrix);

  // 3. Get their next destinations
  const recommendations = await getNextFromSimilarUsers(
    similarUsers,
    currentLocation
  );

  return recommendations.slice(0, limit);
}
```

### 4. Dynamic Messaging

```typescript
function getRecommendationMessage(
  travelerCount: number,
  nationality?: string,
  locale: string = 'en'
): string {
  const messages = {
    en: {
      few: 'Similar travelers recommend this destination',
      some: (n: number) => `${n}+ travelers chose this next`,
      many: (n: number, nat?: string) =>
        nat
          ? `${n} ${nat} travelers chose this destination`
          : `${n} travelers chose this destination`,
    },
    ko: {
      few: '비슷한 여행자들이 추천하는 곳',
      some: (n: number) => `${n}명 이상의 여행자가 선택한 곳`,
      many: (n: number, nat?: string) =>
        nat
          ? `${n}명의 ${nat} 여행자가 선택한 곳`
          : `${n}명의 여행자가 선택한 곳`,
    },
    // ... other languages
  };

  const m = messages[locale] || messages.en;

  if (travelerCount < 50) return m.few;
  if (travelerCount < 200) return m.some(travelerCount);
  return m.many(travelerCount, nationality);
}
```

---

## Database Schema

```sql
-- journeys table
CREATE TABLE journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- User profile snapshot at journey time
  nationality VARCHAR(50),
  trip_duration INTEGER, -- days
  travel_style VARCHAR(20),

  -- Journey metadata
  photo_count INTEGER DEFAULT 0,
  location_count INTEGER DEFAULT 0,
  is_complete BOOLEAN DEFAULT FALSE
);

-- journey_locations table
CREATE TABLE journey_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,

  -- Location data
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  place_name VARCHAR(255),
  place_name_ko VARCHAR(255),

  -- Extraction metadata
  source VARCHAR(20) NOT NULL, -- 'exif', 'gemini', 'manual'
  confidence INTEGER, -- 0-100

  -- Temporal data
  visited_at TIMESTAMPTZ,
  sequence_order INTEGER,

  -- Photo reference
  photo_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for similarity queries
CREATE INDEX idx_journey_locations_coords
ON journey_locations (latitude, longitude);

CREATE INDEX idx_journeys_profile
ON journeys (nationality, trip_duration, travel_style);
```

---

## API Endpoints

```typescript
// POST /api/journey/create
// Create new journey
interface CreateJourneyRequest {
  nationality: string;
  tripDuration: number;
  travelStyle: string;
}

// POST /api/journey/[id]/photo
// Upload photo to journey
interface UploadPhotoRequest {
  file: File;
  manualLocation?: GeoLocation; // Optional manual override
}

// GET /api/journey/[id]/recommendations
// Get recommendations for current journey
interface RecommendationsResponse {
  recommendations: Recommendation[];
  algorithm: 'content-based' | 'hybrid' | 'collaborative';
  dataPoints: number;
}

// POST /api/journey/[id]/feedback
// Record user feedback on recommendation
interface FeedbackRequest {
  recommendationId: string;
  action: 'visited' | 'saved' | 'dismissed';
  rating?: number; // 1-5
}
```

---

## Files Structure

```
/app/src/
├── lib/
│   └── journey/
│       ├── index.ts           # Central export
│       ├── extraction.ts      # GPS extraction logic
│       ├── recommendations.ts # Recommendation algorithms
│       ├── messaging.ts       # Dynamic message generation
│       └── types.ts           # TypeScript types
│
├── components/
│   └── zzik/
│       └── journey/
│           ├── PhotoUpload.tsx        # ✅ Implemented
│           ├── JourneyTimeline.tsx    # ✅ Implemented
│           ├── RecommendationCard.tsx # ✅ Implemented
│           ├── LocationPicker.tsx     # TODO: Manual tagging
│           └── JourneyProgress.tsx    # TODO: Multi-step progress
│
├── hooks/
│   └── useJourney.ts          # ✅ Implemented
│
└── app/
    └── api/
        └── journey/
            ├── route.ts           # Journey CRUD
            ├── [id]/
            │   ├── photo/route.ts # Photo upload
            │   └── recommendations/route.ts
            └── feedback/route.ts
```

---

## Error Handling

```typescript
// Journey-specific error codes
enum JourneyErrorCode {
  INVALID_FILE_TYPE = 'JOURNEY_001',
  FILE_TOO_LARGE = 'JOURNEY_002',
  MAX_PHOTOS_EXCEEDED = 'JOURNEY_003',
  GPS_EXTRACTION_FAILED = 'JOURNEY_004',
  GEMINI_API_ERROR = 'JOURNEY_005',
  GEMINI_RATE_LIMITED = 'JOURNEY_006',
  NO_LOCATION_DATA = 'JOURNEY_007',
  INSUFFICIENT_DATA = 'JOURNEY_008',
}

class JourneyError extends Error {
  constructor(
    public code: JourneyErrorCode,
    message: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'JourneyError';
  }
}
```

---

## Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Photo upload | < 3s (10MB) | Time to preview display |
| EXIF extraction | < 100ms | Per-photo extraction |
| Gemini analysis | < 2s | API round-trip |
| Recommendation query | < 500ms | Database query time |
| Total recommendation | < 2s | End-to-end response |

---

## Testing Checklist

- [ ] Photo upload with various formats (JPEG, PNG, WEBP, HEIC)
- [ ] EXIF extraction from different camera models
- [ ] Gemini fallback when EXIF missing
- [ ] Manual location picker functionality
- [ ] Recommendation accuracy with < 50 data points
- [ ] Recommendation accuracy with 500+ data points
- [ ] Multi-language message generation
- [ ] Error recovery flows
- [ ] Rate limiting handling

---

## Quality Standards

- 50%+ GPS extraction rate from EXIF
- < 2 second total recommendation response
- Support 6 languages (ko, en, ja, zh-CN, zh-TW, th)
- WCAG 2.1 AA accessibility compliance
- Mobile-first responsive design
