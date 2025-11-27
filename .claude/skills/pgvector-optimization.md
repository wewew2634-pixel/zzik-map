# pgvector Optimization Skill

## When to Use
Invoke this skill when working on:
- Vector similarity search
- Embedding storage and retrieval
- Index optimization
- Query performance tuning

---

## Setup

### Enable Extension
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Check Version
```sql
SELECT extversion FROM pg_extension WHERE extname = 'vector';
-- Should be 0.5.0+ for best performance
```

---

## Table Design

### Basic Embedding Table
```sql
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  embedding vector(128) NOT NULL, -- 128 dimensions
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### With Foreign Key
```sql
CREATE TABLE place_vibes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  embedding vector(128) NOT NULL,
  primary_vibe VARCHAR(20) NOT NULL,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Index Types

### IVFFlat (Recommended for < 1M rows)
```sql
-- Calculate lists: sqrt(n) where n = expected rows
-- 10,000 rows → lists = 100
-- 100,000 rows → lists = 316
-- 1,000,000 rows → lists = 1000

CREATE INDEX idx_place_vibes_ivfflat
ON place_vibes
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- For L2 distance
CREATE INDEX idx_place_vibes_ivfflat_l2
ON place_vibes
USING ivfflat (embedding vector_l2_ops)
WITH (lists = 100);
```

### HNSW (Better for > 1M rows)
```sql
-- m = connections per node (16 is good default)
-- ef_construction = build quality (64-128 recommended)

CREATE INDEX idx_place_vibes_hnsw
ON place_vibes
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

---

## Query Optimization

### Basic Similarity Search
```sql
-- Cosine similarity (higher = more similar)
SELECT
  id,
  place_id,
  1 - (embedding <=> '[0.1, 0.2, ...]'::vector) AS similarity
FROM place_vibes
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 10;
```

### Set Search Parameters
```sql
-- IVFFlat: probes = number of lists to search
-- Higher = more accurate but slower
SET ivfflat.probes = 10; -- Default is 1

-- HNSW: ef_search controls recall vs speed
SET hnsw.ef_search = 40; -- Default is 40
```

### With Filtering
```sql
-- Filter BEFORE vector search for efficiency
SELECT
  pv.id,
  pv.place_id,
  1 - (pv.embedding <=> $1::vector) AS similarity
FROM place_vibes pv
WHERE pv.primary_vibe = 'modern' -- Filter first
ORDER BY pv.embedding <=> $1::vector
LIMIT 10;
```

### Combined Index for Filtered Queries
```sql
-- Create partial index for common filters
CREATE INDEX idx_place_vibes_modern
ON place_vibes
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50)
WHERE primary_vibe = 'modern';
```

---

## Distance Functions

### Operators
```sql
-- Cosine distance (most common for normalized vectors)
embedding <=> other_embedding

-- L2 (Euclidean) distance
embedding <-> other_embedding

-- Inner product (for dot product similarity)
embedding <#> other_embedding
```

### When to Use Each
- **Cosine (`<=>`)**: Normalized vectors, semantic similarity
- **L2 (`<->`)**: Raw vectors, absolute distance matters
- **Inner Product (`<#>`)**: When vectors aren't normalized

---

## Performance Tips

### 1. Normalize Vectors Before Insert
```sql
-- Normalized vectors work better with cosine similarity
INSERT INTO place_vibes (place_id, embedding)
VALUES (
  $1,
  (SELECT $2::vector / sqrt(inner_product($2::vector, $2::vector)))
);
```

### 2. Increase work_mem
```sql
SET work_mem = '256MB'; -- Per-operation memory
```

### 3. Parallel Query
```sql
SET max_parallel_workers_per_gather = 4;
```

### 4. Maintenance
```sql
-- Reindex periodically for IVFFlat
REINDEX INDEX CONCURRENTLY idx_place_vibes_ivfflat;

-- Vacuum to reclaim space
VACUUM ANALYZE place_vibes;
```

---

## Supabase-Specific

### RPC Function for Vector Search
```sql
CREATE OR REPLACE FUNCTION search_similar_places(
  query_embedding vector(128),
  match_count INT DEFAULT 10,
  min_similarity FLOAT DEFAULT 0.5
)
RETURNS TABLE (
  place_id UUID,
  primary_vibe VARCHAR(20),
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Set probes for this query
  PERFORM set_config('ivfflat.probes', '10', true);

  RETURN QUERY
  SELECT
    pv.place_id,
    pv.primary_vibe,
    1 - (pv.embedding <=> query_embedding) AS similarity
  FROM place_vibes pv
  WHERE 1 - (pv.embedding <=> query_embedding) >= min_similarity
  ORDER BY pv.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### Call from Supabase Client
```typescript
const { data, error } = await supabase.rpc('search_similar_places', {
  query_embedding: embedding,
  match_count: 10,
  min_similarity: 0.5,
});
```

---

## Benchmarking

### Measure Query Time
```sql
EXPLAIN ANALYZE
SELECT id, 1 - (embedding <=> '[...]'::vector) AS similarity
FROM place_vibes
ORDER BY embedding <=> '[...]'::vector
LIMIT 10;
```

### Expected Performance

| Rows | Index | Probes/EF | Latency |
|------|-------|-----------|---------|
| 10K | IVFFlat(100) | 10 | ~2-5ms |
| 100K | IVFFlat(316) | 20 | ~10-20ms |
| 1M | HNSW(16,64) | 40 | ~20-50ms |

---

## Troubleshooting

### Index Not Used
```sql
-- Check if index exists
SELECT * FROM pg_indexes WHERE tablename = 'place_vibes';

-- Force index usage
SET enable_seqscan = off;
EXPLAIN ANALYZE SELECT ...;
SET enable_seqscan = on;
```

### Slow Queries
1. Increase `ivfflat.probes` or `hnsw.ef_search`
2. Check if index is stale (REINDEX)
3. Increase `work_mem`
4. Check if filtering is happening after vector search

### Memory Issues
```sql
-- Check current settings
SHOW work_mem;
SHOW maintenance_work_mem;

-- Increase for large operations
SET maintenance_work_mem = '1GB';
```
