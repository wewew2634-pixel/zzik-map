/**
 * V7 Weekly Report Generator
 *
 * Automated weekly analytics report for stakeholders
 * Tracks: KPI trends, cohort performance, error analysis, test results
 */

import type { UploadAnalyticsMetrics, UploadKPIs } from '@/hooks/useUploadAnalytics';

export interface WeeklyReportData {
  week: {
    startDate: Date;
    endDate: Date;
  };
  kpis: {
    current: UploadKPIs;
    previous: UploadKPIs;
    targets: {
      successRate: number;
      completionRate: number;
      avgDuration: number;
    };
  };
  cohorts: Array<{
    name: string;
    successRate: number;
    completionRate: number;
    userCount: number;
    trend: number; // % change from previous week
  }>;
  topErrors: Array<{
    error: string;
    count: number;
    percentageOfTotal: number;
    impact: 'high' | 'medium' | 'low';
  }>;
  abTests: Array<{
    testId: string;
    name: string;
    status: 'running' | 'completed' | 'inconclusive';
    winner?: string;
    lift?: number;
  }>;
  insights: string[];
  recommendations: string[];
}

/**
 * Generate markdown weekly report
 */
export function generateWeeklyReport(data: WeeklyReportData): string {
  const {
    week,
    kpis,
    cohorts,
    topErrors,
    abTests,
    insights,
    recommendations,
  } = data;

  const weekString = `${week.startDate.toLocaleDateString()} - ${week.endDate.toLocaleDateString()}`;

  return `# Weekly Analytics Report
**Week of ${weekString}**

---

## Executive Summary

This week's upload flow shows **${getHealthStatus(kpis.current)}** health.

- **Success Rate**: ${(kpis.current.successRate * 100).toFixed(1)}% (target: ${(kpis.targets.successRate * 100).toFixed(0)}%)
- **Completion Rate**: ${(kpis.current.completionRate * 100).toFixed(1)}% (target: ${(kpis.targets.completionRate * 100).toFixed(0)}%)
- **Error Rate**: ${(kpis.current.errorRate * 100).toFixed(1)}%

${getSuccessMessage(kpis.current, kpis.previous)}

---

## KPI Trends

| Metric | Current | Previous | Change |
|--------|---------|----------|--------|
| Success Rate | ${(kpis.current.successRate * 100).toFixed(1)}% | ${(kpis.previous.successRate * 100).toFixed(1)}% | ${getTrendArrow(kpis.current.successRate - kpis.previous.successRate)} ${Math.abs((kpis.current.successRate - kpis.previous.successRate) * 100).toFixed(1)}pp |
| Completion Rate | ${(kpis.current.completionRate * 100).toFixed(1)}% | ${(kpis.previous.completionRate * 100).toFixed(1)}% | ${getTrendArrow(kpis.current.completionRate - kpis.previous.completionRate)} ${Math.abs((kpis.current.completionRate - kpis.previous.completionRate) * 100).toFixed(1)}pp |
| Avg Duration | ${(kpis.current.averageDuration / 1000).toFixed(1)}s | ${(kpis.previous.averageDuration / 1000).toFixed(1)}s | ${getTrendArrow(-(kpis.current.averageDuration - kpis.previous.averageDuration))} ${Math.abs((kpis.current.averageDuration - kpis.previous.averageDuration) / 1000).toFixed(1)}s |
| Error Rate | ${(kpis.current.errorRate * 100).toFixed(1)}% | ${(kpis.previous.errorRate * 100).toFixed(1)}% | ${getTrendArrow(-(kpis.current.errorRate - kpis.previous.errorRate))} ${Math.abs((kpis.current.errorRate - kpis.previous.errorRate) * 100).toFixed(1)}pp |
| Retry Rate | ${(kpis.current.retryRate * 100).toFixed(1)}% | ${(kpis.previous.retryRate * 100).toFixed(1)}% | ${getTrendArrow(-(kpis.current.retryRate - kpis.previous.retryRate))} ${Math.abs((kpis.current.retryRate - kpis.previous.retryRate) * 100).toFixed(1)}pp |

---

## Cohort Performance

${cohorts
  .map(
    (cohort) => `
### ${cohort.name}
- **Users**: ${cohort.userCount}
- **Success Rate**: ${(cohort.successRate * 100).toFixed(1)}%
- **Completion Rate**: ${(cohort.completionRate * 100).toFixed(1)}%
- **Trend**: ${getTrendArrow(cohort.trend)} ${Math.abs(cohort.trend).toFixed(1)}% ${cohort.trend >= 0 ? 'growth' : 'decline'}
`,
  )
  .join('\n')}

---

## Error Analysis

### Top 5 Errors
${topErrors
  .slice(0, 5)
  .map(
    (error, index) => `
${index + 1}. **${error.error}**
   - Count: ${error.count}
   - % of Total: ${error.percentageOfTotal.toFixed(1)}%
   - Impact: ${error.impact.toUpperCase()}
`,
  )
  .join('\n')}

---

## A/B Test Results

${abTests.length === 0
  ? 'No A/B tests running this week.'
  : abTests
      .map(
        (test) => `
### ${test.name} (${test.testId})
- **Status**: ${test.status.toUpperCase()}
${test.status === 'completed' ? `- **Winner**: ${test.winner}\n- **Lift**: ${test.lift?.toFixed(1) || 'N/A'}%` : '- **Status**: Still running, check again next week'}
`,
      )
      .join('\n')}

---

## Key Insights 💡

${insights.map((insight) => `- ${insight}`).join('\n')}

---

## Recommendations 📋

${recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

---

## Next Week's Focus

1. Monitor top errors for regression
2. Continue A/B tests (sample size tracking)
3. Optimize uploading state (currently slowest)
4. Review cohort-specific friction points

---

*Report generated: ${new Date().toISOString()}*
`;
}

/**
 * Helper: Get health status
 */
function getHealthStatus(kpis: UploadKPIs): string {
  if (kpis.successRate >= 0.8 && kpis.completionRate >= 0.7) {
    return '🟢 Excellent';
  }
  if (kpis.successRate >= 0.6 && kpis.completionRate >= 0.5) {
    return '🟡 Good';
  }
  return '🔴 Needs Attention';
}

/**
 * Helper: Get trend arrow
 */
function getTrendArrow(change: number): string {
  if (change > 0.05) return '📈';
  if (change < -0.05) return '📉';
  return '➡️';
}

/**
 * Helper: Get success message
 */
function getSuccessMessage(current: UploadKPIs, previous: UploadKPIs): string {
  const successChange = current.successRate - previous.successRate;
  const completionChange = current.completionRate - previous.completionRate;

  if (successChange > 0.1) {
    return '✅ **Great news!** Success rate improved significantly this week.';
  }
  if (successChange < -0.05) {
    return '⚠️ **Alert**: Success rate declined. Investigate top errors.';
  }
  if (completionChange > 0.1) {
    return '✅ Completion rate trending upward - fewer user dropoffs!';
  }
  return '➡️ Metrics stable week-over-week.';
}

/**
 * Example: Generate sample report
 */
export function generateSampleReport(): string {
  const sampleData: WeeklyReportData = {
    week: {
      startDate: new Date('2025-11-27'),
      endDate: new Date('2025-12-03'),
    },
    kpis: {
      current: {
        totalUploads: 1250,
        successRate: 0.82,
        completionRate: 0.75,
        averageDuration: 3200,
        errorRate: 0.08,
        retryRate: 0.15,
        averageRetries: 0.25,
        mostCommonErrors: [
          ['network_error', 45],
          ['timeout', 28],
          ['file_too_large', 15],
        ],
      },
      previous: {
        totalUploads: 1180,
        successRate: 0.78,
        completionRate: 0.71,
        averageDuration: 3500,
        errorRate: 0.12,
        retryRate: 0.18,
        averageRetries: 0.35,
        mostCommonErrors: [
          ['network_error', 50],
          ['timeout', 32],
        ],
      },
      targets: {
        successRate: 0.85,
        completionRate: 0.80,
        avgDuration: 3000,
      },
    },
    cohorts: [
      {
        name: 'High Engagement',
        successRate: 0.95,
        completionRate: 0.93,
        userCount: 180,
        trend: 2,
      },
      {
        name: 'Explorers',
        successRate: 0.85,
        completionRate: 0.78,
        userCount: 310,
        trend: 5,
      },
      {
        name: 'One-Shot',
        successRate: 0.68,
        completionRate: 0.60,
        userCount: 650,
        trend: 8,
      },
      {
        name: 'Inactive',
        successRate: 0.45,
        completionRate: 0.35,
        userCount: 110,
        trend: -3,
      },
    ],
    topErrors: [
      {
        error: 'network_error',
        count: 45,
        percentageOfTotal: 45.5,
        impact: 'high',
      },
      {
        error: 'timeout',
        count: 28,
        percentageOfTotal: 28.3,
        impact: 'high',
      },
      {
        error: 'file_too_large',
        count: 15,
        percentageOfTotal: 15.2,
        impact: 'medium',
      },
    ],
    abTests: [
      {
        testId: 'celebration_animation_v1',
        name: 'Success Celebration Duration',
        status: 'running',
      },
      {
        testId: 'error_messaging_v1',
        name: 'Error Message Style',
        status: 'running',
      },
      {
        testId: 'retry_strategy_v1',
        name: 'Retry Behavior',
        status: 'running',
      },
    ],
    insights: [
      'One-Shot cohort shows 8% week-over-week growth - progress indicator resonating',
      'Network errors remain top issue (45% of all errors) - consider timeout increase',
      'Average duration improved by 300ms - uploading flow optimization working',
      'Retry rate down 3pp - error messages becoming clearer',
      'Success rate approaching target (82% vs 85% goal)',
    ],
    recommendations: [
      'Increase network timeout from 10s to 15s for better reliability',
      'Run A/B test on error retry UX (automatic vs manual) next week',
      'Profile network conditions for slow connections',
      'Consider chunked uploads for large files (currently file_too_large #3)',
      'Monitor Inactive cohort trend (-3%) - may need re-engagement push',
    ],
  };

  return generateWeeklyReport(sampleData);
}
