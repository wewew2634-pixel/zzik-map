/**
 * ZZIK MAP - pgvector Similarity Search POC
 *
 * Vector similarity search for:
 * 1. Journey recommendations (where did similar travelers go next?)
 * 2. Vibe matching (find places with similar atmosphere)
 *
 * Usage: pnpm tsx scripts/poc/pgvector-similarity.ts
 */

// Note: This POC simulates pgvector operations
// In production, use actual Supabase connection

interface DemoLocation {
  id: string;
  name: string;
  nameKo: string;
  category: string;
  latitude: number;
  longitude: number;
}

interface VibeVector {
  locationId: string;
  vector: number[];
  dimensions: number;
}

interface JourneyPattern {
  fromLocationId: string;
  toLocationId: string;
  count: number;
  avgTimeBetween: number; // hours
}

interface SimilarityResult {
  locationId: string;
  location: DemoLocation;
  similarity: number;
  journeyCount?: number;
}

// Demo data: Famous Korean locations
const DEMO_LOCATIONS: DemoLocation[] = [
  { id: 'loc-001', name: 'Gyeongbokgung Palace', nameKo: '경복궁', category: 'landmark', latitude: 37.5796, longitude: 126.9770 },
  { id: 'loc-002', name: 'Bukchon Hanok Village', nameKo: '북촌한옥마을', category: 'landmark', latitude: 37.5824, longitude: 126.9850 },
  { id: 'loc-003', name: 'Insadong', nameKo: '인사동', category: 'shopping', latitude: 37.5739, longitude: 126.9858 },
  { id: 'loc-004', name: 'Myeongdong', nameKo: '명동', category: 'shopping', latitude: 37.5636, longitude: 126.9869 },
  { id: 'loc-005', name: 'N Seoul Tower', nameKo: '남산타워', category: 'landmark', latitude: 37.5512, longitude: 126.9882 },
  { id: 'loc-006', name: 'Hongdae', nameKo: '홍대', category: 'entertainment', latitude: 37.5563, longitude: 126.9226 },
  { id: 'loc-007', name: 'Gangnam Station', nameKo: '강남역', category: 'entertainment', latitude: 37.4979, longitude: 127.0276 },
  { id: 'loc-008', name: 'Itaewon', nameKo: '이태원', category: 'entertainment', latitude: 37.5345, longitude: 126.9946 },
  { id: 'loc-009', name: 'Seongsu-dong', nameKo: '성수동', category: 'cafe', latitude: 37.5447, longitude: 127.0558 },
  { id: 'loc-010', name: 'Hangang Park', nameKo: '한강공원', category: 'nature', latitude: 37.5170, longitude: 126.9371 },
];

// Demo vibe vectors (128 dimensions, normalized)
// In production, these would come from Gemini Vision analysis
function generateDemoVibeVector(location: DemoLocation): number[] {
  const vector: number[] = [];
  const seed = location.id.charCodeAt(4);

  // Generate pseudo-random but deterministic vector
  for (let i = 0; i < 128; i++) {
    const base = Math.sin(seed * (i + 1) * 0.1);
    const categoryBoost = location.category === 'landmark' ? 0.3 :
                          location.category === 'cafe' ? 0.2 :
                          location.category === 'nature' ? 0.4 : 0.1;
    vector.push(Math.max(0, base * 0.5 + 0.5 + categoryBoost * Math.cos(i * 0.2)));
  }

  // Normalize
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return vector.map(v => v / magnitude);
}

// Demo journey patterns (who went where after visiting where)
const DEMO_JOURNEY_PATTERNS: JourneyPattern[] = [
  // From Gyeongbokgung
  { fromLocationId: 'loc-001', toLocationId: 'loc-002', count: 847, avgTimeBetween: 1.5 },
  { fromLocationId: 'loc-001', toLocationId: 'loc-003', count: 623, avgTimeBetween: 2.0 },
  { fromLocationId: 'loc-001', toLocationId: 'loc-005', count: 412, avgTimeBetween: 3.5 },
  // From Bukchon
  { fromLocationId: 'loc-002', toLocationId: 'loc-001', count: 534, avgTimeBetween: 1.2 },
  { fromLocationId: 'loc-002', toLocationId: 'loc-003', count: 756, avgTimeBetween: 1.0 },
  { fromLocationId: 'loc-002', toLocationId: 'loc-009', count: 234, avgTimeBetween: 4.0 },
  // From Hongdae
  { fromLocationId: 'loc-006', toLocationId: 'loc-009', count: 445, avgTimeBetween: 2.5 },
  { fromLocationId: 'loc-006', toLocationId: 'loc-007', count: 389, avgTimeBetween: 3.0 },
  { fromLocationId: 'loc-006', toLocationId: 'loc-008', count: 312, avgTimeBetween: 2.0 },
  // From Myeongdong
  { fromLocationId: 'loc-004', toLocationId: 'loc-005', count: 678, avgTimeBetween: 2.5 },
  { fromLocationId: 'loc-004', toLocationId: 'loc-003', count: 523, avgTimeBetween: 1.5 },
  { fromLocationId: 'loc-004', toLocationId: 'loc-007', count: 412, avgTimeBetween: 4.0 },
];

/**
 * Cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude > 0 ? dotProduct / magnitude : 0;
}

/**
 * Simulate pgvector similarity search
 * In production: SELECT * FROM locations ORDER BY embedding <=> query_vector LIMIT k
 */
function findSimilarByVibe(
  queryVector: number[],
  vibeVectors: Map<string, VibeVector>,
  locations: Map<string, DemoLocation>,
  limit: number = 5
): SimilarityResult[] {
  const results: SimilarityResult[] = [];

  for (const [locationId, vibeVector] of vibeVectors) {
    const similarity = cosineSimilarity(queryVector, vibeVector.vector);
    const location = locations.get(locationId);

    if (location) {
      results.push({
        locationId,
        location,
        similarity
      });
    }
  }

  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

/**
 * Find next destinations based on journey patterns
 */
function findNextDestinations(
  fromLocationId: string,
  journeyPatterns: JourneyPattern[],
  locations: Map<string, DemoLocation>,
  limit: number = 5
): SimilarityResult[] {
  const patterns = journeyPatterns
    .filter(p => p.fromLocationId === fromLocationId)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return patterns.map(pattern => {
    const location = locations.get(pattern.toLocationId)!;
    return {
      locationId: pattern.toLocationId,
      location,
      similarity: pattern.count / patterns[0].count, // Normalize to top result
      journeyCount: pattern.count
    };
  });
}

/**
 * Hybrid recommendation: Combine vibe similarity + journey patterns
 */
function hybridRecommendation(
  fromLocationId: string,
  queryVector: number[],
  vibeVectors: Map<string, VibeVector>,
  journeyPatterns: JourneyPattern[],
  locations: Map<string, DemoLocation>,
  vibeWeight: number = 0.4,
  journeyWeight: number = 0.6
): SimilarityResult[] {
  // Get vibe-based recommendations
  const vibeResults = findSimilarByVibe(queryVector, vibeVectors, locations, 10);
  const vibeScores = new Map(vibeResults.map(r => [r.locationId, r.similarity]));

  // Get journey-based recommendations
  const journeyResults = findNextDestinations(fromLocationId, journeyPatterns, locations, 10);
  const journeyScores = new Map(journeyResults.map(r => [r.locationId, r.similarity]));
  const journeyCounts = new Map(journeyResults.map(r => [r.locationId, r.journeyCount || 0]));

  // Combine scores
  const allLocationIds = new Set([...vibeScores.keys(), ...journeyScores.keys()]);
  const hybridResults: SimilarityResult[] = [];

  for (const locationId of allLocationIds) {
    if (locationId === fromLocationId) continue; // Exclude current location

    const vibeScore = vibeScores.get(locationId) || 0;
    const journeyScore = journeyScores.get(locationId) || 0;
    const hybridScore = vibeWeight * vibeScore + journeyWeight * journeyScore;

    const location = locations.get(locationId);
    if (location) {
      hybridResults.push({
        locationId,
        location,
        similarity: hybridScore,
        journeyCount: journeyCounts.get(locationId)
      });
    }
  }

  return hybridResults
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
}

/**
 * Demo: Show pgvector similarity search capabilities
 */
async function runDemo() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║     ZZIK MAP - pgvector Similarity POC Demo       ║');
  console.log('║     Vector Search & Journey Recommendations       ║');
  console.log('╚═══════════════════════════════════════════════════╝');

  // Setup demo data
  console.log('\n🔧 Setting up demo data...');
  const locations = new Map(DEMO_LOCATIONS.map(l => [l.id, l]));
  const vibeVectors = new Map<string, VibeVector>();

  for (const location of DEMO_LOCATIONS) {
    vibeVectors.set(location.id, {
      locationId: location.id,
      vector: generateDemoVibeVector(location),
      dimensions: 128
    });
  }

  console.log(`   ✓ ${DEMO_LOCATIONS.length} locations loaded`);
  console.log(`   ✓ ${vibeVectors.size} vibe vectors generated (128-dim)`);
  console.log(`   ✓ ${DEMO_JOURNEY_PATTERNS.length} journey patterns loaded`);

  // Demo 1: Journey Intelligence
  console.log('\n');
  console.log('═'.repeat(50));
  console.log('📍 Demo 1: Journey Intelligence');
  console.log('   "Where did travelers go after Gyeongbokgung?"');
  console.log('═'.repeat(50));

  const journeyResults = findNextDestinations('loc-001', DEMO_JOURNEY_PATTERNS, locations);

  console.log('\n🎯 Top Next Destinations from 경복궁:');
  journeyResults.forEach((result, idx) => {
    const pct = (result.similarity * 100).toFixed(0);
    console.log(`   ${idx + 1}. ${result.location.name} (${result.location.nameKo})`);
    console.log(`      👥 ${result.journeyCount} travelers (${pct}% of top choice)`);
  });

  // Demo 2: Vibe Matching
  console.log('\n');
  console.log('═'.repeat(50));
  console.log('🎭 Demo 2: Vibe Matching');
  console.log('   "Find places with similar vibe to Seongsu-dong"');
  console.log('═'.repeat(50));

  const seongsuVector = vibeVectors.get('loc-009')!.vector;
  const vibeResults = findSimilarByVibe(seongsuVector, vibeVectors, locations, 5);

  console.log('\n🎯 Places with Similar Vibe to 성수동:');
  vibeResults.forEach((result, idx) => {
    const pct = (result.similarity * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(result.similarity * 20));
    console.log(`   ${idx + 1}. ${result.location.name} (${result.location.nameKo})`);
    console.log(`      ${bar} ${pct}% match | Category: ${result.location.category}`);
  });

  // Demo 3: Hybrid Recommendation
  console.log('\n');
  console.log('═'.repeat(50));
  console.log('🔮 Demo 3: Hybrid Recommendation');
  console.log('   "You\'re at Hongdae - where should you go next?"');
  console.log('   (Combining journey patterns + vibe similarity)');
  console.log('═'.repeat(50));

  const hongdaeVector = vibeVectors.get('loc-006')!.vector;
  const hybridResults = hybridRecommendation(
    'loc-006',
    hongdaeVector,
    vibeVectors,
    DEMO_JOURNEY_PATTERNS,
    locations,
    0.3, // 30% vibe weight
    0.7  // 70% journey weight
  );

  console.log('\n🎯 Recommended Next from 홍대:');
  hybridResults.forEach((result, idx) => {
    const pct = (result.similarity * 100).toFixed(1);
    const travelers = result.journeyCount ? `${result.journeyCount} travelers` : 'vibe match';
    console.log(`   ${idx + 1}. ${result.location.name} (${result.location.nameKo})`);
    console.log(`      Score: ${pct}% | ${travelers}`);
  });

  // SQL Examples
  console.log('\n');
  console.log('═'.repeat(50));
  console.log('📝 Production SQL Examples (pgvector)');
  console.log('═'.repeat(50));

  console.log('\n-- 1. Create extension');
  console.log(`CREATE EXTENSION IF NOT EXISTS vector;`);

  console.log('\n-- 2. Create locations table with embedding');
  console.log(`CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ko TEXT,
  category TEXT,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  vibe_embedding VECTOR(128)
);`);

  console.log('\n-- 3. Create IVFFlat index for fast search');
  console.log(`CREATE INDEX ON locations
USING ivfflat (vibe_embedding vector_cosine_ops)
WITH (lists = 100);`);

  console.log('\n-- 4. Similarity search query');
  console.log(`SELECT id, name, name_ko,
  1 - (vibe_embedding <=> '[0.1, 0.2, ...]'::vector) as similarity
FROM locations
ORDER BY vibe_embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 5;`);

  console.log('\n-- 5. Journey patterns table');
  console.log(`CREATE TABLE journey_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location_id UUID REFERENCES locations(id),
  to_location_id UUID REFERENCES locations(id),
  journey_count INT DEFAULT 0,
  avg_time_between INTERVAL,
  UNIQUE(from_location_id, to_location_id)
);`);

  // Performance metrics
  console.log('\n');
  console.log('═'.repeat(50));
  console.log('📊 Expected Performance (pgvector + IVFFlat)');
  console.log('═'.repeat(50));

  console.log('\n   Data Scale        | Query Time');
  console.log('   ─────────────────|──────────────');
  console.log('   10K vectors      | ~5ms');
  console.log('   100K vectors     | ~15ms');
  console.log('   1M vectors       | ~50ms');
  console.log('\n   * IVFFlat: O(sqrt(n)) complexity');
  console.log('   * Supabase free tier: 500MB, enough for ~100K locations');

  console.log('\n✅ POC Complete! Ready for Supabase integration.');
}

// Run demo
runDemo().catch(console.error);
