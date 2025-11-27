-- V7 Analytics Schema
-- Upload events, metrics, and A/B test tracking

-- Uploads Analytics Table
CREATE TABLE IF NOT EXISTS uploads_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  upload_id TEXT NOT NULL UNIQUE,
  user_id UUID,
  cohort TEXT,

  -- Metrics
  succeeded BOOLEAN NOT NULL,
  completed BOOLEAN NOT NULL,
  had_errors BOOLEAN NOT NULL DEFAULT FALSE,
  retry_count INTEGER NOT NULL DEFAULT 0,
  total_duration_ms INTEGER,

  -- Events
  events JSONB NOT NULL DEFAULT '[]',

  -- State tracking
  time_in_states JSONB DEFAULT '{}',
  error_types TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Metadata
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_uploads_analytics_user_id ON uploads_analytics(user_id);
CREATE INDEX idx_uploads_analytics_cohort ON uploads_analytics(cohort);
CREATE INDEX idx_uploads_analytics_created_at ON uploads_analytics(created_at);
CREATE INDEX idx_uploads_analytics_succeeded ON uploads_analytics(succeeded);
CREATE INDEX idx_uploads_analytics_completed ON uploads_analytics(completed);

-- A/B Test Events Table
CREATE TABLE IF NOT EXISTS ab_test_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id TEXT NOT NULL,
  variant TEXT NOT NULL CHECK (variant IN ('control', 'variant_a', 'variant_b')),
  user_id UUID,
  metric_key TEXT NOT NULL,
  metric_value FLOAT NOT NULL,
  upload_id TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for A/B testing
CREATE INDEX idx_ab_test_events_test_id ON ab_test_events(test_id);
CREATE INDEX idx_ab_test_events_variant ON ab_test_events(variant);
CREATE INDEX idx_ab_test_events_user_id ON ab_test_events(user_id);
CREATE INDEX idx_ab_test_events_created_at ON ab_test_events(created_at);
CREATE INDEX idx_ab_test_events_test_variant ON ab_test_events(test_id, variant);

-- Analytics Summary View (for dashboard performance)
CREATE OR REPLACE VIEW analytics_summary AS
SELECT
  DATE(created_at) as date,
  cohort,
  COUNT(*) as total_uploads,
  SUM(CASE WHEN succeeded THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as success_rate,
  SUM(CASE WHEN completed THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as completion_rate,
  AVG(total_duration_ms) as avg_duration_ms,
  SUM(CASE WHEN had_errors THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as error_rate,
  AVG(retry_count) as avg_retries
FROM uploads_analytics
GROUP BY DATE(created_at), cohort;

-- A/B Test Summary View
CREATE OR REPLACE VIEW ab_test_summary AS
SELECT
  test_id,
  variant,
  metric_key,
  COUNT(*) as event_count,
  AVG(metric_value) as avg_value,
  STDDEV(metric_value) as stddev_value,
  MIN(metric_value) as min_value,
  MAX(metric_value) as max_value
FROM ab_test_events
GROUP BY test_id, variant, metric_key;

-- Enable RLS (Row Level Security)
ALTER TABLE uploads_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own analytics
CREATE POLICY "Users can read own analytics" ON uploads_analytics
  FOR SELECT
  USING (user_id = auth.uid() OR auth.uid() IS NULL);

-- RLS Policy: Service role can insert analytics
CREATE POLICY "Analytics insert policy" ON uploads_analytics
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Admins can read all analytics
CREATE POLICY "Admin can read all analytics" ON uploads_analytics
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin' OR auth.uid() IS NULL);

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at
CREATE TRIGGER update_uploads_analytics_updated_at
  BEFORE UPDATE ON uploads_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
