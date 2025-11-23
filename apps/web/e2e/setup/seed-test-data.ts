/**
 * Seed test data for E2E tests
 *
 * This script should be run before E2E tests to populate the test database
 * with necessary data for testing.
 *
 * Usage:
 *   tsx e2e/setup/seed-test-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('Seeding test data...');

  try {
    // Clean up existing test data
    await prisma.missionRun.deleteMany({
      where: {
        userId: {
          startsWith: 'test-user-',
        },
      },
    });

    // Create test place
    const testPlace = await prisma.place.upsert({
      where: { id: 'test-place-1' },
      update: {},
      create: {
        id: 'test-place-1',
        name: 'Test Place Seoul',
        address: '123 Test Street, Seoul',
        latitude: 37.5665,
        longitude: 126.9780,
        category: 'RESTAURANT',
      },
    });

    console.log('Created test place:', testPlace.id);

    // Create test mission
    const testMission = await prisma.mission.upsert({
      where: { id: 'test-mission-1' },
      update: {},
      create: {
        id: 'test-mission-1',
        placeId: testPlace.id,
        title: 'Test Mission',
        description: 'This is a test mission for E2E tests',
        rewardAmount: 1000,
        status: 'ACTIVE',
        verificationSpec: {
          steps: ['GPS_VERIFY', 'QR_VERIFY', 'REELS_VERIFY'],
        },
      },
    });

    console.log('Created test mission:', testMission.id);

    // Create additional test data
    const testPlace2 = await prisma.place.upsert({
      where: { id: 'test-place-2' },
      update: {},
      create: {
        id: 'test-place-2',
        name: 'Test Place Gangnam',
        address: '456 Test Avenue, Gangnam',
        latitude: 37.4979,
        longitude: 127.0276,
        category: 'CAFE',
      },
    });

    const testMission2 = await prisma.mission.upsert({
      where: { id: 'test-mission-2' },
      update: {},
      create: {
        id: 'test-mission-2',
        placeId: testPlace2.id,
        title: 'Test Mission 2',
        description: 'Another test mission',
        rewardAmount: 2000,
        status: 'ACTIVE',
        verificationSpec: {
          steps: ['GPS_VERIFY', 'QR_VERIFY'],
        },
      },
    });

    console.log('Created additional test data');

    console.log('Test data seeded successfully!');
  } catch (error) {
    console.error('Error seeding test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedTestData };
