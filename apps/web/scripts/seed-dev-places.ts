import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { prisma } from '../src/lib/prisma.js'

const testPlaces = [
  {
    name: '스타벅스 강남R점',
    category: '카페',
    address: '서울 강남구 역삼동',
    latitude: 37.4979,
    longitude: 127.0276,
    isGold: true,
    successRate: 92,
    missionsCount: 45,
    trafficSignal: 'GREEN' as const,
  },
  {
    name: '교촌치킨 역삼점',
    category: '치킨',
    address: '서울 강남구 역삼1동',
    latitude: 37.5000,
    longitude: 127.0360,
    isGold: true,
    successRate: 88,
    missionsCount: 38,
    trafficSignal: 'GREEN' as const,
  },
  {
    name: '맘스터치 선릉역점',
    category: '버거',
    address: '서울 강남구 역삼동',
    latitude: 37.5045,
    longitude: 127.0493,
    isGold: false,
    successRate: 75,
    missionsCount: 22,
    trafficSignal: 'YELLOW' as const,
  },
  {
    name: '본죽 강남점',
    category: '죽/한식',
    address: '서울 강남구 역삼동',
    latitude: 37.4985,
    longitude: 127.0312,
    isGold: true,
    successRate: 95,
    missionsCount: 52,
    trafficSignal: 'GREEN' as const,
  },
  {
    name: '설빙 강남역점',
    category: '디저트',
    address: '서울 강남구 역삼1동',
    latitude: 37.4979,
    longitude: 127.0269,
    isGold: false,
    successRate: 68,
    missionsCount: 15,
    trafficSignal: 'YELLOW' as const,
  },
  {
    name: '공차 선릉점',
    category: '카페',
    address: '서울 강남구 역삼동',
    latitude: 37.5050,
    longitude: 127.0510,
    isGold: false,
    successRate: 55,
    missionsCount: 8,
    trafficSignal: 'RED' as const,
  },
  {
    name: '이디야커피 역삼점',
    category: '카페',
    address: '서울 강남구 역삼1동',
    latitude: 37.4995,
    longitude: 127.0340,
    isGold: true,
    successRate: 90,
    missionsCount: 41,
    trafficSignal: 'GREEN' as const,
  },
  {
    name: '버거킹 강남점',
    category: '버거',
    address: '서울 강남구 역삼동',
    latitude: 37.4970,
    longitude: 127.0280,
    isGold: false,
    successRate: 72,
    missionsCount: 19,
    trafficSignal: 'YELLOW' as const,
  },
]

async function main() {
  console.log('🌱 Seeding development places...')

  // Clear existing places
  const deleted = await prisma.place.deleteMany({})
  console.log(`   Deleted ${deleted.count} existing places`)

  // Create new places
  for (const place of testPlaces) {
    await prisma.place.create({ data: place })
    console.log(`   ✓ Created: ${place.name}`)
  }

  console.log(`\n✅ Successfully seeded ${testPlaces.length} places!`)
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
