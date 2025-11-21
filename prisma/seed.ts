// ZZIK LIVE v4 - Database Seed Script
import "dotenv/config";
import { PrismaClient, TrafficSignal, MissionStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Create Prisma Client with adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  // 1) 테스트 유저 1명
  const user = await prisma.user.upsert({
    where: { email: "test@zzik.live" },
    update: {},
    create: {
      email: "test@zzik.live",
      authProvider: "local",
      providerUserId: "test-user-1",
    },
  });
  console.log("✅ Created test user:", user.email);

  // 2) 장소 4개
  const places = await Promise.all([
    prisma.place.upsert({
      where: { id: "zzik-lab-coffee" },
      update: {},
      create: {
        id: "zzik-lab-coffee",
        name: "ZZIK LAB COFFEE",
        category: "카페 · 스페셜티",
        address: "서울 성동구 성수동",
        latitude: 37.5446,
        longitude: 127.0565,
        isGold: true,
        successRate: 93,
        missionsCount: 42,
        trafficSignal: TrafficSignal.GREEN,
      },
    }),
    prisma.place.upsert({
      where: { id: "underground-izakaya" },
      update: {},
      create: {
        id: "underground-izakaya",
        name: "언더그라운드 이자카야",
        category: "이자카야 · 야간",
        address: "서울 성동구 성수동",
        latitude: 37.5456,
        longitude: 127.0595,
        isGold: false,
        successRate: 81,
        missionsCount: 21,
        trafficSignal: TrafficSignal.YELLOW,
      },
    }),
    prisma.place.upsert({
      where: { id: "seongsu-bagel-factory" },
      update: {},
      create: {
        id: "seongsu-bagel-factory",
        name: "성수 베이글 팩토리",
        category: "베이커리 · 브런치",
        address: "서울 성동구 성수동",
        latitude: 37.5435,
        longitude: 127.0545,
        isGold: true,
        successRate: 88,
        missionsCount: 67,
        trafficSignal: TrafficSignal.GREEN,
      },
    }),
    prisma.place.upsert({
      where: { id: "seoul-forest-walk" },
      update: {},
      create: {
        id: "seoul-forest-walk",
        name: "서울숲 공원 산책로",
        category: "공원 · 야외",
        address: "서울 성동구 서울숲",
        latitude: 37.5445,
        longitude: 127.0375,
        isGold: false,
        successRate: 72,
        missionsCount: 15,
        trafficSignal: TrafficSignal.RED,
      },
    }),
  ]);
  console.log("✅ Created 4 places");

  const [
    zzikLabCoffee,
    undergroundIzakaya,
    seongsuBagelFactory,
    seoulForestWalk,
  ] = places;

  // 3) 각 Place마다 기본 Mission 1개씩
  const now = new Date();
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await prisma.mission.createMany({
    data: [
      {
        id: "mission-zzik-lab-coffee-basic",
        placeId: zzikLabCoffee.id,
        title: "ZZIK LAB COFFEE 방문 인증 + 릴스 업로드",
        description: "GPS 인증 → QR 스캔 → 커피 릴스 촬영 → 리뷰 승인",
        status: MissionStatus.ACTIVE,
        rewardAmount: 5000,
        maxRunsPerUser: 3,
        maxTotalRuns: 100,
        startAt: now,
        endAt: oneWeekLater,
        verificationSpec: {
          gps: true,
          qr: true,
          reels: true,
          review: true,
        },
      },
      {
        id: "mission-underground-izakaya-basic",
        placeId: undergroundIzakaya.id,
        title: "언더그라운드 이자카야 야간 인증",
        description: "야간 방문 GPS 인증 → QR 코드 스캔 → 음식 사진 릴스 업로드",
        status: MissionStatus.ACTIVE,
        rewardAmount: 3000,
        maxRunsPerUser: 2,
        maxTotalRuns: 50,
        startAt: now,
        endAt: oneWeekLater,
        verificationSpec: {
          gps: true,
          qr: true,
          reels: true,
          review: false,
        },
      },
      {
        id: "mission-seongsu-bagel-factory-basic",
        placeId: seongsuBagelFactory.id,
        title: "성수 베이글 팩토리 모닝 미션",
        description: "아침 방문 인증 → 베이글 구매 릴스 → 자동 승인",
        status: MissionStatus.ACTIVE,
        rewardAmount: 2000,
        maxRunsPerUser: 1,
        maxTotalRuns: 80,
        startAt: now,
        endAt: oneWeekLater,
        verificationSpec: {
          gps: true,
          qr: false,
          reels: true,
          review: false,
        },
      },
      {
        id: "mission-seoul-forest-walk-basic",
        placeId: seoulForestWalk.id,
        title: "서울숲 산책 인증",
        description: "GPS 위치 인증 → QR 스캔 → 자연 릴스 업로드",
        status: MissionStatus.ACTIVE,
        rewardAmount: 1000,
        maxRunsPerUser: 1,
        maxTotalRuns: 200,
        startAt: now,
        endAt: oneWeekLater,
        verificationSpec: {
          gps: true,
          qr: true,
          reels: true,
          review: false,
        },
      },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Created 4 missions");

  console.log("\n🎉 Seed completed successfully!");
  console.log("---");
  console.log("📊 Summary:");
  console.log("  - Users: 1 (test@zzik.live)");
  console.log("  - Places: 4 (2 GOLD, 2 Regular)");
  console.log("  - Missions: 4 (All ACTIVE)");
  console.log("  - Traffic Signals: 2 GREEN, 1 YELLOW, 1 RED");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
