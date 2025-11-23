-- Add activeLockKey for MissionRun to enforce deterministic active-run uniqueness
ALTER TABLE "MissionRun"
ADD COLUMN "activeLockKey" TEXT;

-- Ensure only one MissionRun per active lock key (mission:user)
CREATE UNIQUE INDEX IF NOT EXISTS "MissionRun_active_lock_key_unique"
  ON "MissionRun"("activeLockKey")
  WHERE "activeLockKey" IS NOT NULL;
