-- Add partial unique index to prevent multiple active MissionRuns per (userId, missionId)
-- Also replace composite index to include status for better planner usage

-- Drop old index if it exists
DROP INDEX IF EXISTS "MissionRun_missionId_userId_idx";

-- Create new composite index including status
CREATE INDEX IF NOT EXISTS "MissionRun_missionId_userId_status_idx" ON "MissionRun"("missionId", "userId", "status");

-- Enforce single active MissionRun per user + mission for active statuses
CREATE UNIQUE INDEX IF NOT EXISTS "MissionRun_active_run_unique_idx"
  ON "MissionRun"("missionId", "userId")
  WHERE "status" IN ('PENDING_GPS', 'PENDING_QR', 'PENDING_REELS', 'PENDING_REVIEW');
