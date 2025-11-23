-- DropIndex
DROP INDEX IF EXISTS "MissionRun_missionId_userId_status_idx";

-- CreateTable
CREATE TABLE "QrNonce" (
    "id" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "usedBy" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QrNonce_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QrNonce_nonce_key" ON "QrNonce"("nonce");

-- CreateIndex
CREATE INDEX "QrNonce_nonce_expiresAt_idx" ON "QrNonce"("nonce", "expiresAt");

-- CreateIndex
CREATE INDEX "QrNonce_expiresAt_idx" ON "QrNonce"("expiresAt");

-- CreateIndex
CREATE INDEX "Mission_status_startAt_endAt_idx" ON "Mission"("status", "startAt", "endAt");

-- CreateIndex
CREATE INDEX "Mission_placeId_status_idx" ON "Mission"("placeId", "status");

-- CreateIndex
CREATE INDEX "MissionRun_missionId_userId_idx" ON "MissionRun"("missionId", "userId");

-- CreateIndex
CREATE INDEX "MissionRun_status_expiresAt_idx" ON "MissionRun"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "MissionRun_userId_status_idx" ON "MissionRun"("userId", "status");

-- CreateIndex
CREATE INDEX "MissionRun_activeLockKey_idx" ON "MissionRun"("activeLockKey");
