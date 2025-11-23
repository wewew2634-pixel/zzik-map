// ZZIK LIVE v4 - Loyalty Score Calculator
// 단골지수 계산 시스템 (60일 롤링 윈도우 기반)

import { prisma } from "@/lib/prisma";

export type LoyaltyScoreComponents = {
  visits: number; // 검증된 방문 수
  revisits: number; // 재방문 수
  revisitRate: number; // 재방문율 (0-1)
  rewardUsage: number; // 리워드 사용 수
  rewardIssued: number; // 리워드 발급 수
  rewardUsageRate: number; // 리워드 사용률 (0-1)
  averageDaysBetweenVisits: number; // 평균 방문 간격 (일)
  loyaltyScore: number; // 최종 단골지수 (0-100)
};

/**
 * Calculate loyalty score for a place for a specific user
 * Based on 60-day rolling window
 */
export async function calculateUserLoyaltyScore(
  userId: string,
  placeId: string,
): Promise<LoyaltyScoreComponents> {
  const now = new Date();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Get approved mission runs in the last 60 days
  const approvedRuns = await prisma.missionRun.findMany({
    where: {
      userId,
      mission: { placeId },
      status: "APPROVED",
      rewardedAt: {
        gte: sixtyDaysAgo,
      },
    },
    orderBy: { rewardedAt: "asc" },
    select: {
      id: true,
      rewardedAt: true,
      rewardAmount: true,
    },
  });

  const visits = approvedRuns.length;

  if (visits === 0) {
    return {
      visits: 0,
      revisits: 0,
      revisitRate: 0,
      rewardUsage: 0,
      rewardIssued: 0,
      rewardUsageRate: 0,
      averageDaysBetweenVisits: 0,
      loyaltyScore: 0,
    };
  }

  // Calculate revisits (visits after the first one)
  const revisits = Math.max(0, visits - 1);
  const revisitRate = visits > 0 ? revisits / visits : 0;

  // Calculate reward usage (transactions where rewards were spent at this place)
  const rewardIssued = approvedRuns.length;

  // Get wallet transactions (reward usage) at this place in last 60 days
  // TODO: Implement reward usage tracking when place-specific spending is added
  const rewardUsage = 0; // Placeholder
  const rewardUsageRate = rewardIssued > 0 ? rewardUsage / rewardIssued : 0;

  // Calculate average days between visits
  let averageDaysBetweenVisits = 0;
  if (approvedRuns.length > 1) {
    const intervals: number[] = [];
    for (let i = 1; i < approvedRuns.length; i++) {
      const prev = approvedRuns[i - 1].rewardedAt!;
      const curr = approvedRuns[i].rewardedAt!;
      const daysDiff = (curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000);
      intervals.push(daysDiff);
    }
    averageDaysBetweenVisits =
      intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }

  // Calculate loyalty score (0-100)
  // Formula: weighted combination of multiple factors
  const loyaltyScore = calculateWeightedLoyaltyScore({
    visits,
    revisitRate,
    rewardUsageRate,
    averageDaysBetweenVisits,
  });

  return {
    visits,
    revisits,
    revisitRate,
    rewardUsage,
    rewardIssued,
    rewardUsageRate,
    averageDaysBetweenVisits,
    loyaltyScore: Math.round(loyaltyScore),
  };
}

/**
 * Calculate weighted loyalty score
 *
 * Factors:
 * - Visit frequency (40%): More visits = higher score
 * - Revisit rate (30%): Higher revisit rate = higher loyalty
 * - Visit consistency (20%): More consistent visits = higher score
 * - Reward usage rate (10%): Higher usage = higher engagement
 */
function calculateWeightedLoyaltyScore(params: {
  visits: number;
  revisitRate: number;
  rewardUsageRate: number;
  averageDaysBetweenVisits: number;
}): number {
  const { visits, revisitRate, rewardUsageRate, averageDaysBetweenVisits } = params;

  // Visit frequency score (0-100)
  // Logarithmic scale: 1 visit = 20, 5 visits = 60, 10 visits = 80, 20+ visits = 100
  const visitScore = Math.min(100, 20 + Math.log(visits + 1) * 30);

  // Revisit rate score (0-100)
  const revisitScore = revisitRate * 100;

  // Consistency score (0-100)
  // Lower average days between visits = higher score
  // Ideal: 7 days (weekly) = 100, 14 days = 70, 30 days = 40
  let consistencyScore = 0;
  if (averageDaysBetweenVisits > 0) {
    if (averageDaysBetweenVisits <= 7) {
      consistencyScore = 100;
    } else if (averageDaysBetweenVisits <= 14) {
      consistencyScore = 100 - ((averageDaysBetweenVisits - 7) / 7) * 30;
    } else if (averageDaysBetweenVisits <= 30) {
      consistencyScore = 70 - ((averageDaysBetweenVisits - 14) / 16) * 30;
    } else {
      consistencyScore = Math.max(0, 40 - ((averageDaysBetweenVisits - 30) / 30) * 40);
    }
  }

  // Reward usage score (0-100)
  const rewardUsageScore = rewardUsageRate * 100;

  // Weighted combination
  const loyaltyScore =
    visitScore * 0.4 +
    revisitScore * 0.3 +
    consistencyScore * 0.2 +
    rewardUsageScore * 0.1;

  return Math.max(0, Math.min(100, loyaltyScore));
}

/**
 * Calculate aggregate loyalty metrics for a place (all users)
 */
export async function calculatePlaceLoyaltyMetrics(placeId: string) {
  const now = new Date();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Get all approved runs for this place in last 60 days
  const approvedRuns = await prisma.missionRun.findMany({
    where: {
      mission: { placeId },
      status: "APPROVED",
      rewardedAt: {
        gte: sixtyDaysAgo,
      },
    },
    select: {
      userId: true,
      rewardedAt: true,
    },
  });

  // Count unique users
  const uniqueUsers = new Set(approvedRuns.map((r) => r.userId)).size;

  // Count total visits
  const totalVisits = approvedRuns.length;

  // Calculate revisit rate
  const usersWithMultipleVisits = new Map<string, number>();
  for (const run of approvedRuns) {
    const count = usersWithMultipleVisits.get(run.userId) || 0;
    usersWithMultipleVisits.set(run.userId, count + 1);
  }

  const revisitingUsers = Array.from(usersWithMultipleVisits.values()).filter(
    (count) => count > 1
  ).length;

  const revisitRate = uniqueUsers > 0 ? revisitingUsers / uniqueUsers : 0;

  // Average visits per user
  const avgVisitsPerUser = uniqueUsers > 0 ? totalVisits / uniqueUsers : 0;

  return {
    totalVisits,
    uniqueUsers,
    revisitingUsers,
    revisitRate,
    avgVisitsPerUser,
    periodStart: sixtyDaysAgo,
    periodEnd: now,
  };
}
