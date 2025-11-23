// ZZIK LIVE v4 - Prisma Client Singleton (Prisma 7.0 with Adapter)

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

// Parse DATABASE_URL from environment
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL is not set');
}

const url = new URL(dbUrl);

// Create optimized connection pool
// Pool size tuned for production workload with health checks and timeouts
const pool =
  globalForPrisma.pool ??
  new Pool({
    host: url.hostname,
    port: parseInt(url.port || '5432', 10),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1).split('?')[0],

    // Connection pool configuration (optimized for production)
    max: 50, // Maximum number of connections in the pool
    min: 10, // Minimum number of connections to maintain
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 10000, // Timeout for acquiring a connection (10s)
    maxUses: 7500, // Recycle connections after 7500 uses to prevent leaks

    // Keep connections alive with health checks
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Create Prisma Client with adapter
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}
