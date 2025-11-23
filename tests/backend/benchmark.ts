// ZZIK Backend Performance Benchmarks
// Measures critical path performance for MissionRun operations

import { performance } from "node:perf_hooks";
import {
  testPrisma,
  cleanupTestData,
  createTestUser,
  createTestPlace,
  createTestMission
} from "./setup";
import { startMissionRun, approveMissionRunAndReward } from "@/core/missions/service";

// Benchmark configuration
const WARMUP_ITERATIONS = 5;
const BENCHMARK_ITERATIONS = 50;

interface BenchmarkResult {
  operation: string;
  iterations: number;
  totalMs: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
}

// Helper to calculate percentiles
function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[index];
}

async function setupBenchmarkData() {
  const user = await createTestUser();
  const place = await createTestPlace();
  return { user, place };
}

async function benchmarkMissionRunCreation(): Promise<BenchmarkResult> {
  console.log("\n🏃 Benchmarking MissionRun Creation...");

  const { user, place } = await setupBenchmarkData();
  const durations: number[] = [];

  // Warmup
  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    const mission = await createTestMission(place.id, { title: `Warmup ${i}` });
    await startMissionRun({ userId: user.id, missionId: mission.id });
    await testPrisma.missionRun.deleteMany({ where: { missionId: mission.id } });
    await testPrisma.mission.delete({ where: { id: mission.id } });
  }

  // Benchmark
  for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
    const mission = await createTestMission(place.id, { title: `Benchmark ${i}` });

    const start = performance.now();
    await startMissionRun({ userId: user.id, missionId: mission.id });
    const end = performance.now();
    durations.push(end - start);

    // Cleanup for next iteration
    await testPrisma.missionRun.deleteMany({ where: { missionId: mission.id } });
    await testPrisma.mission.delete({ where: { id: mission.id } });
  }

  const totalMs = durations.reduce((a, b) => a + b, 0);
  return {
    operation: "MissionRun Creation",
    iterations: BENCHMARK_ITERATIONS,
    totalMs,
    avgMs: totalMs / durations.length,
    minMs: Math.min(...durations),
    maxMs: Math.max(...durations),
    p50Ms: percentile(durations, 50),
    p95Ms: percentile(durations, 95),
    p99Ms: percentile(durations, 99),
  };
}

async function benchmarkMissionRunApproval(): Promise<BenchmarkResult> {
  console.log("\n💰 Benchmarking MissionRun Approval...");

  const { user, place } = await setupBenchmarkData();
  const durations: number[] = [];

  // Warmup
  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    const mission = await createTestMission(place.id, { title: `Warmup Approval ${i}` });
    const run = await testPrisma.missionRun.create({
      data: {
        missionId: mission.id,
        userId: user.id,
        status: "PENDING_REVIEW",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    await approveMissionRunAndReward({ missionRunId: run.id });
    // Cleanup iteration data only (not user/place)
    await testPrisma.walletTransaction.deleteMany({});
    await testPrisma.wallet.deleteMany({});
    await testPrisma.missionRun.deleteMany({});
    await testPrisma.mission.deleteMany({});
  }

  // Benchmark
  for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
    const mission = await createTestMission(place.id, { title: `Benchmark Approval ${i}` });

    const run = await testPrisma.missionRun.create({
      data: {
        missionId: mission.id,
        userId: user.id,
        status: "PENDING_REVIEW",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const start = performance.now();
    await approveMissionRunAndReward({ missionRunId: run.id });
    const end = performance.now();
    durations.push(end - start);

    // Cleanup iteration data only (not user/place)
    await testPrisma.walletTransaction.deleteMany({});
    await testPrisma.wallet.deleteMany({});
    await testPrisma.missionRun.deleteMany({});
    await testPrisma.mission.deleteMany({});
  }

  const totalMs = durations.reduce((a, b) => a + b, 0);
  return {
    operation: "MissionRun Approval",
    iterations: BENCHMARK_ITERATIONS,
    totalMs,
    avgMs: totalMs / durations.length,
    minMs: Math.min(...durations),
    maxMs: Math.max(...durations),
    p50Ms: percentile(durations, 50),
    p95Ms: percentile(durations, 95),
    p99Ms: percentile(durations, 99),
  };
}

function printResults(result: BenchmarkResult) {
  console.log(`\n📊 ${result.operation} Results:`);
  console.log(`   Iterations: ${result.iterations}`);
  console.log(`   Total Time: ${result.totalMs.toFixed(2)}ms`);
  console.log(`   Average:    ${result.avgMs.toFixed(2)}ms`);
  console.log(`   Min:        ${result.minMs.toFixed(2)}ms`);
  console.log(`   Max:        ${result.maxMs.toFixed(2)}ms`);
  console.log(`   P50:        ${result.p50Ms.toFixed(2)}ms`);
  console.log(`   P95:        ${result.p95Ms.toFixed(2)}ms`);
  console.log(`   P99:        ${result.p99Ms.toFixed(2)}ms`);
}

function checkPerformanceThresholds(results: BenchmarkResult[]): boolean {
  console.log("\n🎯 Performance Thresholds:");
  let allPassed = true;

  for (const result of results) {
    let threshold: number;
    if (result.operation === "MissionRun Creation") {
      threshold = 100; // 100ms P95 threshold
    } else if (result.operation === "MissionRun Approval") {
      threshold = 150; // 150ms P95 threshold
    } else {
      threshold = 200;
    }

    const passed = result.p95Ms <= threshold;
    const status = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`   ${result.operation}: ${status} (P95: ${result.p95Ms.toFixed(2)}ms, threshold: ${threshold}ms)`);

    if (!passed) {
      allPassed = false;
    }
  }

  return allPassed;
}

async function main() {
  console.log("🚀 ZZIK Backend Performance Benchmarks");
  console.log("=====================================");
  console.log(`Warmup iterations: ${WARMUP_ITERATIONS}`);
  console.log(`Benchmark iterations: ${BENCHMARK_ITERATIONS}`);

  try {
    // Clean slate
    await cleanupTestData();

    const results: BenchmarkResult[] = [];

    // Run benchmarks
    results.push(await benchmarkMissionRunCreation());
    await cleanupTestData();

    results.push(await benchmarkMissionRunApproval());
    await cleanupTestData();

    // Print results
    console.log("\n\n📈 BENCHMARK RESULTS");
    console.log("==================");
    results.forEach(printResults);

    // Check thresholds
    const allPassed = checkPerformanceThresholds(results);

    console.log("\n=====================================");
    if (allPassed) {
      console.log("✅ All performance benchmarks passed!");
      process.exit(0);
    } else {
      console.log("❌ Some performance benchmarks failed!");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Benchmark failed:", error);
    process.exit(1);
  } finally {
    await testPrisma.$disconnect();
  }
}

main();
