// ZZIK LIVE v4 - Backend Test Setup
// Node.js test runner 사용

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// 환경 변수로 DATABASE_URL 설정
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://zzik:zzik_pw@localhost:5432/zzikmap?schema=public";
}

// Create connection pool for tests
const testPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // 테스트용은 작은 pool size
});

// Create Prisma adapter
const adapter = new PrismaPg(testPool);

// Create Prisma Client with adapter (Prisma 7.0 방식)
export const testPrisma = new PrismaClient({
  adapter,
  log: ["error"],
});

/**
 * 테스트용 User 생성
 */
export async function createTestUser(email?: string) {
  return testPrisma.user.create({
    data: {
      email: email || `test-${crypto.randomUUID()}@example.com`,
      phone: `010${Math.floor(Math.random() * 100000000)}`,
      authProvider: "test",
      providerUserId: `test-${crypto.randomUUID()}`,
    },
  });
}

/**
 * 테스트용 Place 생성
 */
export async function createTestPlace(overrides?: Partial<any>) {
  return testPrisma.place.create({
    data: {
      name: overrides?.name || "테스트 카페",
      category: overrides?.category || "CAFE",
      address: "서울시 강남구 테스트로 123",
      latitude: 37.5665,
      longitude: 126.978,
      isGold: overrides?.isGold ?? false,
      ...overrides,
    },
  });
}

/**
 * 테스트용 Mission 생성
 */
export async function createTestMission(placeId: string, overrides?: Partial<any>) {
  return testPrisma.mission.create({
    data: {
      placeId,
      title: overrides?.title || "테스트 미션",
      description: "테스트용 미션입니다",
      status: overrides?.status || "ACTIVE",
      rewardAmount: overrides?.rewardAmount || 1000,
      maxRunsPerUser: overrides?.maxRunsPerUser ?? null,
      maxTotalRuns: overrides?.maxTotalRuns ?? null,
      startAt: overrides?.startAt || new Date(),
      endAt: overrides?.endAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      verificationSpec: overrides?.verificationSpec || {
        steps: ["GPS", "QR", "REELS"],
        gps: true,
        qr: true,
        reels: true,
      },
      ...overrides,
    },
  });
}

/**
 * 테스트 데이터 정리
 */
export async function cleanupTestData() {
  // 순서 중요: 외래키 제약 고려 (자식 → 부모 순서)
  await testPrisma.walletTransaction.deleteMany({});
  await testPrisma.missionRun.deleteMany({});
  await testPrisma.mission.deleteMany({}); // Mission이 Place를 참조하므로 먼저 삭제
  await testPrisma.wallet.deleteMany({});
  await testPrisma.place.deleteMany({});
  await testPrisma.user.deleteMany({});
  await testPrisma.qrNonce.deleteMany({});
}

/**
 * 각 테스트 후 정리
 */
export async function afterEachTest() {
  await cleanupTestData();
}

/**
 * 모든 테스트 후 정리
 */
export async function afterAllTests() {
  await cleanupTestData();
  await testPrisma.$disconnect();
}
