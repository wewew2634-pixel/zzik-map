# /zzik-db Command

Database operations for ZZIK MAP using Supabase.

---

## Usage

```
/zzik-db [operation] [options]
```

---

## Connection

### Check Connection
```bash
# Verify Supabase connection
npx supabase status

# Check PostgreSQL directly
PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $SUPABASE_HOST -U postgres -d postgres -c "SELECT version();"
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
DATABASE_URL=postgresql://postgres:xxx@xxx.supabase.co:5432/postgres
```

---

## Migrations

### Create Migration
```bash
# Create new migration
npx supabase migration new <migration_name>

# Example
npx supabase migration new add_vibe_embeddings
```

### Run Migrations
```bash
# Apply all pending migrations
npx supabase db push

# Reset and reapply (CAUTION: destroys data)
npx supabase db reset
```

### Check Migration Status
```bash
npx supabase migration list
```

---

## pgvector Operations

### Enable Extension
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Check pgvector Status
```sql
SELECT extversion FROM pg_extension WHERE extname = 'vector';
```

### Create Vector Index
```sql
-- IVFFlat (< 1M rows)
CREATE INDEX idx_place_vibes_ivfflat
ON place_vibes
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- HNSW (> 1M rows)
CREATE INDEX idx_place_vibes_hnsw
ON place_vibes
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

### Analyze Index Performance
```sql
SET ivfflat.probes = 10;
EXPLAIN ANALYZE
SELECT id, 1 - (embedding <=> '[...]'::vector) AS similarity
FROM place_vibes
ORDER BY embedding <=> '[...]'::vector
LIMIT 10;
```

---

## Common Queries

### Journey Data
```sql
-- Count journeys by nationality
SELECT nationality, COUNT(*)
FROM journeys
GROUP BY nationality
ORDER BY COUNT(*) DESC;

-- Recent journeys with photos
SELECT j.id, j.created_at, COUNT(jp.id) as photo_count
FROM journeys j
LEFT JOIN journey_photos jp ON j.id = jp.journey_id
WHERE j.created_at > NOW() - INTERVAL '7 days'
GROUP BY j.id
ORDER BY j.created_at DESC;
```

### Vibe Data
```sql
-- Vibe distribution by place
SELECT primary_vibe, COUNT(*)
FROM place_vibes
GROUP BY primary_vibe
ORDER BY COUNT(*) DESC;

-- Average vibe scores
SELECT
  AVG((vibe_scores->>'cozy')::int) as avg_cozy,
  AVG((vibe_scores->>'modern')::int) as avg_modern,
  AVG((vibe_scores->>'vintage')::int) as avg_vintage
FROM place_vibes;
```

### MAP BOX Data
```sql
-- Active partners
SELECT p.business_name, p.category, COUNT(e.id) as experience_count
FROM partners p
LEFT JOIN experiences e ON p.id = e.partner_id AND e.status = 'active'
WHERE p.status = 'active'
GROUP BY p.id;

-- Creator performance
SELECT c.nickname, COUNT(ct.id) as content_count, SUM(ct.views) as total_views
FROM creators c
LEFT JOIN content ct ON c.id = ct.creator_id
GROUP BY c.id
ORDER BY total_views DESC;
```

---

## Seed Data

### Run Seeder
```bash
# Run all seeders
pnpm prisma:seed

# Or direct SQL
psql -h $SUPABASE_HOST -U postgres -d postgres -f supabase/seeds/01_places.sql
```

### Sample Seed Files
```
/supabase/seeds/
├── 01_places.sql       # Initial places
├── 02_vibes.sql        # Vibe embeddings
├── 03_journeys.sql     # Sample journeys
└── 04_users.sql        # Test users
```

---

## Backup & Restore

### Create Backup
```bash
# Full backup
pg_dump -h $SUPABASE_HOST -U postgres -d postgres > backup_$(date +%Y%m%d).sql

# Schema only
pg_dump -h $SUPABASE_HOST -U postgres -d postgres --schema-only > schema.sql

# Data only
pg_dump -h $SUPABASE_HOST -U postgres -d postgres --data-only > data.sql
```

### Restore
```bash
# Restore from backup
psql -h $SUPABASE_HOST -U postgres -d postgres < backup_20251126.sql
```

---

## Maintenance

### Vacuum
```bash
# Analyze tables
psql -c "VACUUM ANALYZE place_vibes;"
psql -c "VACUUM ANALYZE journeys;"
```

### Reindex
```sql
-- Reindex vector index (run periodically)
REINDEX INDEX CONCURRENTLY idx_place_vibes_ivfflat;
```

### Check Table Sizes
```sql
SELECT
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

---

## RLS (Row Level Security)

### Check RLS Status
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### Enable RLS
```sql
ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;

-- User can only see own journeys
CREATE POLICY "Users can view own journeys"
ON journeys FOR SELECT
USING (auth.uid() = user_id);
```

---

## Quick Reference

| Operation | Command |
|-----------|---------|
| Check status | `npx supabase status` |
| New migration | `npx supabase migration new <name>` |
| Apply migrations | `npx supabase db push` |
| Reset DB | `npx supabase db reset` |
| Run seeds | `pnpm prisma:seed` |
| Backup | `pg_dump ... > backup.sql` |
