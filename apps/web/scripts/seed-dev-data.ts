// ZZIK LIVE - Development Data Seeding Script
import { prisma } from "../src/lib/prisma";

async function seed() {
  console.log("🌱 Starting development data seeding...\n");

  console.log("Creating users...");
  const user1 = await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: { email: "user@test.com", name: "Test User", role: "USER" },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: { email: "admin@test.com", name: "Test Admin", role: "ADMIN" },
  });

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@test.com" },
    update: {},
    create: { email: "superadmin@test.com", name: "Test Super Admin", role: "SUPER_ADMIN" },
  });

  console.log(`✓ Created 3 users`);

  console.log("\nCreating places...");
  const placeData = [
    { name: "스타벅스 강남점", category: "카페", lat: 37.4979, lng: 127.0276 },
    { name: "맥도날드 홍대점", category: "패스트푸드", lat: 37.5563, lng: 126.9222 },
    { name: "올리브영 명동점", category: "화장품", lat: 37.5635, lng: 126.9826 },
    { name: "GS25 서울대점", category: "편의점", lat: 37.4602, lng: 126.9516 },
    { name: "이디야 커피 판교점", category: "카페", lat: 37.3948, lng: 127.1111 },
  ];

  const places = [];
  for (const place of placeData) {
    const created = await prisma.place.create({
      data: {
        name: place.name,
        category: place.category,
        latitude: place.lat,
        longitude: place.lng,
        address: `서울시 ${place.name}`,
      },
    });
    places.push(created);
  }

  console.log(`✓ Created ${places.length} places`);

  console.log("\nCreating missions...");
  let missionCount = 0;
  for (const place of places) {
    await prisma.mission.create({
      data: {
        title: `${place.name} 방문 미션`,
        description: `${place.name}을 방문하고 QR 스캔하세요!`,
        placeId: place.id,
        status: "ACTIVE",
        rewardAmount: 1000,
        maxRunsPerUser: 1,
        maxTotalRuns: 100,
        startAt: new Date(),
        endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        verificationSpec: {
          steps: ['GPS', 'QR', 'REELS', 'REVIEW'],
          gps: { radiusMeters: 50 },
          qr: { required: true },
          reels: { minDurationSeconds: 10 },
          review: { required: false }
        },
      },
    });
    missionCount++;
  }

  console.log(`✓ Created ${missionCount} missions`);

  console.log("\nCreating wallets...");
  await prisma.wallet.create({ data: { userId: user1.id, balance: 0 } });
  await prisma.wallet.create({ data: { userId: admin.id, balance: 10000 } });
  await prisma.wallet.create({ data: { userId: superAdmin.id, balance: 50000 } });

  console.log(`✓ Created 3 wallets\n`);
  console.log("✅ Seeding completed!\n");
  console.log(`Summary: 3 users, ${places.length} places, ${missionCount} missions, 3 wallets\n`);
}

seed()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
