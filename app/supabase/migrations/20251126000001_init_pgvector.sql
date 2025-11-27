-- ZZIK MAP Initial Migration
-- Enable pgvector extension for similarity search
-- Created: 2025-11-26

-- ===========================================
-- Extensions
-- ===========================================
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- Locations Table (Tourist spots, cafes, restaurants)
-- ===========================================
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ko TEXT,
  name_en TEXT,
  name_ja TEXT,
  name_zh_cn TEXT,
  name_zh_tw TEXT,
  name_th TEXT,

  -- Category
  category TEXT NOT NULL DEFAULT 'other',
  subcategory TEXT,

  -- Coordinates
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,

  -- Address
  address TEXT,
  address_ko TEXT,

  -- Vibe embedding for similarity search (128 dimensions)
  vibe_embedding VECTOR(128),

  -- Metadata
  photo_count INT DEFAULT 0,
  visit_count INT DEFAULT 0,
  avg_rating DECIMAL(2, 1),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast similarity search
CREATE INDEX IF NOT EXISTS idx_locations_vibe_embedding
ON locations USING ivfflat (vibe_embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for geographic queries
CREATE INDEX IF NOT EXISTS idx_locations_coordinates
ON locations (latitude, longitude);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_locations_category
ON locations (category);

-- ===========================================
-- Photos Table (User uploaded photos)
-- ===========================================
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  location_id UUID REFERENCES locations(id),

  -- Photo metadata
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  original_filename TEXT,

  -- GPS data
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  gps_source TEXT CHECK (gps_source IN ('exif', 'gemini', 'manual', 'none')),
  gps_confidence DECIMAL(3, 2),

  -- EXIF metadata
  camera_make TEXT,
  camera_model TEXT,
  taken_at TIMESTAMPTZ,

  -- AI analysis results
  vibe_analysis JSONB,
  vibe_embedding VECTOR(128),
  gemini_response JSONB,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'analyzed', 'failed')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user's photos
CREATE INDEX IF NOT EXISTS idx_photos_user_id
ON photos (user_id);

-- Index for location photos
CREATE INDEX IF NOT EXISTS idx_photos_location_id
ON photos (location_id);

-- Index for photo vibe similarity
CREATE INDEX IF NOT EXISTS idx_photos_vibe_embedding
ON photos USING ivfflat (vibe_embedding vector_cosine_ops)
WITH (lists = 100);

-- ===========================================
-- Journey Patterns Table (Where did travelers go next?)
-- ===========================================
CREATE TABLE IF NOT EXISTS journey_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_location_id UUID NOT NULL REFERENCES locations(id),
  to_location_id UUID NOT NULL REFERENCES locations(id),

  -- Statistics
  journey_count INT DEFAULT 1,
  avg_time_between INTERVAL,

  -- Demographics (optional)
  user_nationalities JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(from_location_id, to_location_id)
);

-- Index for finding next destinations
CREATE INDEX IF NOT EXISTS idx_journey_patterns_from
ON journey_patterns (from_location_id, journey_count DESC);

-- ===========================================
-- Functions
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER photos_updated_at
  BEFORE UPDATE ON photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER journey_patterns_updated_at
  BEFORE UPDATE ON journey_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to find similar locations by vibe
CREATE OR REPLACE FUNCTION find_similar_locations(
  query_embedding VECTOR(128),
  limit_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  name_ko TEXT,
  category TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.name,
    l.name_ko,
    l.category,
    l.latitude,
    l.longitude,
    1 - (l.vibe_embedding <=> query_embedding) as similarity
  FROM locations l
  WHERE l.vibe_embedding IS NOT NULL
  ORDER BY l.vibe_embedding <=> query_embedding
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to find next destinations from a location
CREATE OR REPLACE FUNCTION find_next_destinations(
  from_loc_id UUID,
  limit_count INT DEFAULT 5
)
RETURNS TABLE (
  location_id UUID,
  name TEXT,
  name_ko TEXT,
  category TEXT,
  journey_count INT,
  percentage FLOAT
) AS $$
DECLARE
  total_journeys INT;
BEGIN
  -- Get total journey count from this location
  SELECT COALESCE(SUM(jp.journey_count), 0) INTO total_journeys
  FROM journey_patterns jp
  WHERE jp.from_location_id = from_loc_id;

  RETURN QUERY
  SELECT
    l.id as location_id,
    l.name,
    l.name_ko,
    l.category,
    jp.journey_count,
    CASE WHEN total_journeys > 0
      THEN (jp.journey_count::FLOAT / total_journeys * 100)
      ELSE 0
    END as percentage
  FROM journey_patterns jp
  JOIN locations l ON l.id = jp.to_location_id
  WHERE jp.from_location_id = from_loc_id
  ORDER BY jp.journey_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- RLS (Row Level Security) Policies
-- ===========================================
-- Enable RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_patterns ENABLE ROW LEVEL SECURITY;

-- Public read access for locations
CREATE POLICY "Anyone can view locations" ON locations
  FOR SELECT USING (true);

-- Public read access for journey patterns
CREATE POLICY "Anyone can view journey patterns" ON journey_patterns
  FOR SELECT USING (true);

-- Users can view all photos (for MVP, relax later)
CREATE POLICY "Anyone can view photos" ON photos
  FOR SELECT USING (true);

-- Users can insert their own photos
CREATE POLICY "Users can insert their own photos" ON photos
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own photos
CREATE POLICY "Users can update their own photos" ON photos
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- ===========================================
-- Comments
-- ===========================================
COMMENT ON TABLE locations IS 'Tourist spots, cafes, restaurants in Korea';
COMMENT ON TABLE photos IS 'User uploaded travel photos with AI analysis';
COMMENT ON TABLE journey_patterns IS 'Statistical patterns of where travelers go next';
COMMENT ON COLUMN locations.vibe_embedding IS '128-dimensional vibe vector from Gemini Vision analysis';
COMMENT ON COLUMN photos.gps_source IS 'Source of GPS data: exif, gemini (AI detected), manual, or none';
