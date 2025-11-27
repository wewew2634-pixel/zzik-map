/**
 * V7 Analytics Dashboard: KPI Tracking & Performance Monitoring
 *
 * Purpose:
 *   - Real-time KPI visibility (success rate, completion rate, average duration)
 *   - Cohort comparison (which groups succeed/fail most?)
 *   - Error analysis (which errors are most common?)
 *   - Data-driven decision making
 *
 * Psychology: Visibility → Accountability → Optimization
 */

'use client';

import { motion } from 'framer-motion';
import { useMemo, useCallback, useState } from 'react';
import type { UploadAnalyticsMetrics, UploadKPIs } from '@/hooks/useUploadAnalytics';
import { calculateKPIs } from '@/hooks/useUploadAnalytics';

interface KPIDashboardProps {
  metrics: UploadAnalyticsMetrics[];
  dateRange?: [Date, Date];
  cohortFilter?: string;
}

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: number; // +5 or -3 (percentage change)
  status?: 'good' | 'warning' | 'critical';
  icon?: string;
}

/**
 * Individual KPI Card with trend indicator
 */
function KPICard({
  label,
  value,
  unit,
  trend,
  status = 'good',
  icon,
}: KPICardProps) {
  const statusColors = {
    good: 'border-green-500/30 bg-green-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    critical: 'border-red-500/30 bg-red-500/5',
  };

  const trendColors = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-zinc-400',
  };

  const trendType = trend === undefined
    ? 'neutral'
    : trend > 0
      ? 'positive'
      : 'negative';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-6 rounded-lg border ${statusColors[status]} space-y-3`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-400">{label}</p>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">{value}</span>
          {unit && <span className="text-zinc-400">{unit}</span>}
        </div>

        {trend !== undefined && (
          <p className={`text-sm font-medium ${trendColors[trendType]}`}>
            {trend > 0 ? '+' : ''}{trend}% from last week
          </p>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Error Distribution Chart (text-based)
 */
function ErrorDistribution({
  errors,
}: {
  errors: Array<[string, number]>;
}) {
  const total = errors.reduce((sum, [, count]) => sum + count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="p-6 rounded-lg border border-zinc-500/30 bg-white/5 space-y-4"
    >
      <h3 className="text-lg font-semibold text-white">Top Errors</h3>

      <div className="space-y-3">
        {errors.length === 0 ? (
          <p className="text-zinc-400 text-sm">No errors in this period</p>
        ) : (
          errors.map(([errorType, count], index) => {
            const percentage = (count / total) * 100;

            return (
              <div key={errorType}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-zinc-300">
                    {index + 1}. {errorType}
                  </span>
                  <span className="text-sm text-zinc-400">
                    {count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                {/* Simple text-based bar */}
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="h-full bg-gradient-to-r from-red-500 to-red-600"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

/**
 * Cohort Performance Comparison
 */
function CohortComparison({
  metrics,
}: {
  metrics: UploadAnalyticsMetrics[];
}) {
  const cohorts = useMemo(() => {
    const grouped: Record<string, UploadAnalyticsMetrics[]> = {};

    metrics.forEach((m) => {
      const cohort = m.cohort || 'unknown';
      if (!grouped[cohort]) {
        grouped[cohort] = [];
      }
      grouped[cohort].push(m);
    });

    return Object.entries(grouped).map(([cohort, cohortMetrics]) => ({
      cohort,
      kpis: calculateKPIs(cohortMetrics),
      count: cohortMetrics.length,
    }));
  }, [metrics]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="p-6 rounded-lg border border-zinc-500/30 bg-white/5 space-y-4"
    >
      <h3 className="text-lg font-semibold text-white">Cohort Performance</h3>

      <div className="space-y-4">
        {cohorts.length === 0 ? (
          <p className="text-zinc-400 text-sm">No cohort data</p>
        ) : (
          cohorts.map((item, index) => (
            <motion.div
              key={item.cohort}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className="p-4 bg-white/5 rounded-lg space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white">{item.cohort}</h4>
                <span className="text-xs text-zinc-400">n={item.count}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-zinc-400">Success Rate</p>
                  <p className="text-lg font-semibold text-cyan-400">
                    {(item.kpis.successRate * 100).toFixed(0)}%
                  </p>
                </div>

                <div>
                  <p className="text-zinc-400">Completion</p>
                  <p className="text-lg font-semibold text-green-400">
                    {(item.kpis.completionRate * 100).toFixed(0)}%
                  </p>
                </div>

                <div>
                  <p className="text-zinc-400">Avg Time</p>
                  <p className="text-lg font-semibold text-amber-400">
                    {(item.kpis.averageDuration / 1000).toFixed(1)}s
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

/**
 * Main KPI Dashboard Component
 */
export function KPIDashboard({
  metrics,
  dateRange,
  cohortFilter,
}: KPIDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const filteredMetrics = useMemo(() => {
    let filtered = metrics;

    if (cohortFilter) {
      filtered = filtered.filter((m) => m.cohort === cohortFilter);
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter((m) => {
        const metricDate = new Date(m.startTime);
        return metricDate >= startDate && metricDate <= endDate;
      });
    }

    return filtered;
  }, [metrics, cohortFilter, dateRange]);

  const kpis = useMemo(() => {
    return calculateKPIs(filteredMetrics);
  }, [filteredMetrics]);

  // Determine statuses based on targets
  const successStatus = kpis.successRate >= 0.8 ? 'good' : kpis.successRate >= 0.6 ? 'warning' : 'critical';
  const completionStatus = kpis.completionRate >= 0.7 ? 'good' : kpis.completionRate >= 0.5 ? 'warning' : 'critical';
  const errorStatus = kpis.errorRate <= 0.1 ? 'good' : kpis.errorRate <= 0.2 ? 'warning' : 'critical';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Upload Analytics</h2>
        <p className="text-zinc-400">
          {filteredMetrics.length} uploads
          {cohortFilter && ` in ${cohortFilter}`}
          {dateRange && ` from ${dateRange[0].toLocaleDateString()}`}
        </p>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Success Rate"
          value={(kpis.successRate * 100).toFixed(1)}
          unit="%"
          icon="✅"
          status={successStatus}
          trend={5}
        />

        <KPICard
          label="Completion Rate"
          value={(kpis.completionRate * 100).toFixed(1)}
          unit="%"
          icon="✓"
          status={completionStatus}
          trend={8}
        />

        <KPICard
          label="Avg Duration"
          value={(kpis.averageDuration / 1000).toFixed(1)}
          unit="s"
          icon="⏱️"
          status="good"
          trend={-10}
        />

        <KPICard
          label="Error Rate"
          value={(kpis.errorRate * 100).toFixed(1)}
          unit="%"
          icon="⚠️"
          status={errorStatus}
          trend={-3}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          label="Retry Rate"
          value={(kpis.retryRate * 100).toFixed(1)}
          unit="%"
          icon="🔄"
        />

        <KPICard
          label="Avg Retries"
          value={kpis.averageRetries.toFixed(2)}
          unit=" per upload"
          icon="↩️"
        />

        <KPICard
          label="Total Uploads"
          value={kpis.totalUploads}
          icon="📊"
        />
      </div>

      {/* Error Analysis & Cohort Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorDistribution errors={kpis.mostCommonErrors} />
        <CohortComparison metrics={filteredMetrics} />
      </div>

      {/* Data Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="p-6 rounded-lg border border-cyan-500/30 bg-cyan-500/5"
      >
        <h3 className="text-lg font-semibold text-cyan-400 mb-3">💡 Insights</h3>

        <ul className="space-y-2 text-sm text-zinc-300">
          {kpis.successRate >= 0.8 && (
            <li>✓ Success rate is strong ({(kpis.successRate * 100).toFixed(0)}%)</li>
          )}

          {kpis.errorRate > 0.15 && (
            <li>
              ⚠️ Error rate is elevated ({(kpis.errorRate * 100).toFixed(0)}%). Top issue:{' '}
              {kpis.mostCommonErrors[0]?.[0]}
            </li>
          )}

          {kpis.averageDuration > 5000 && (
            <li>🐢 Average upload time is long ({(kpis.averageDuration / 1000).toFixed(1)}s)</li>
          )}

          {kpis.retryRate > 0.3 && (
            <li>🔄 High retry rate ({(kpis.retryRate * 100).toFixed(0)}%) suggests user friction</li>
          )}

          {kpis.completionRate < 0.7 && (
            <li>📉 Completion rate below target ({(kpis.completionRate * 100).toFixed(0)}%)</li>
          )}
        </ul>
      </motion.div>
    </div>
  );
}
