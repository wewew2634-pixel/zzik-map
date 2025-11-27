'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Core Web Vitals Dashboard (Phase 7)
 *
 * Real-time visualization of:
 * - LCP: Largest Contentful Paint
 * - FID: First Input Delay
 * - CLS: Cumulative Layout Shift
 * - TTI: Time to Interactive
 * - FCP: First Contentful Paint
 *
 * Shows current metrics with historical comparison
 * Color-coded: Green (good), Yellow (needs improvement), Red (poor)
 */

export interface CoreWebVital {
  name: string;
  value?: number;
  unit: string;
  threshold: {
    good: number;
    needsImprovement: number;
  };
  status: 'good' | 'needsImprovement' | 'poor' | 'pending';
  percentile?: {
    p50: number;
    p75: number;
    p95: number;
  };
}

export interface CoreWebVitalsDashboardProps {
  className?: string;
  period?: '24h' | '7d' | '30d';
  autoRefresh?: boolean;
  refreshInterval?: number; // ms
}

export function CoreWebVitalsDashboard({
  className = '',
  period = '24h',
  autoRefresh = true,
  refreshInterval = 30000,
}: CoreWebVitalsDashboardProps) {
  const [metrics, setMetrics] = useState<CoreWebVital[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch metrics from API
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/ux-metrics?period=${period}`);
      const data = await response.json();

      if (data.success && data.data) {
        const { metrics: apiMetrics } = data.data;

        // Transform API data to dashboard format
        const transformed: CoreWebVital[] = [
          {
            name: 'LCP',
            value: apiMetrics.lcp.avg,
            unit: 'ms',
            threshold: { good: 2500, needsImprovement: 4000 },
            status: getStatus(apiMetrics.lcp.avg, 2500, 4000),
            percentile: {
              p50: apiMetrics.lcp.p50,
              p75: apiMetrics.lcp.p75,
              p95: apiMetrics.lcp.p95,
            },
          },
          {
            name: 'FID',
            value: apiMetrics.fid.avg,
            unit: 'ms',
            threshold: { good: 100, needsImprovement: 300 },
            status: getStatus(apiMetrics.fid.avg, 100, 300),
            percentile: {
              p50: apiMetrics.fid.p50,
              p75: apiMetrics.fid.p75,
              p95: apiMetrics.fid.p95,
            },
          },
          {
            name: 'CLS',
            value: apiMetrics.cls.avg,
            unit: '',
            threshold: { good: 0.1, needsImprovement: 0.25 },
            status: getStatus(apiMetrics.cls.avg, 0.1, 0.25),
            percentile: {
              p50: apiMetrics.cls.p50,
              p75: apiMetrics.cls.p75,
              p95: apiMetrics.cls.p95,
            },
          },
          {
            name: 'TTI',
            value: apiMetrics.tti.avg,
            unit: 'ms',
            threshold: { good: 3000, needsImprovement: 5000 },
            status: getStatus(apiMetrics.tti.avg, 3000, 5000),
          },
          {
            name: 'FCP',
            value: apiMetrics.fcp.avg,
            unit: 'ms',
            threshold: { good: 1800, needsImprovement: 3000 },
            status: getStatus(apiMetrics.fcp.avg, 1800, 3000),
          },
        ];

        setMetrics(transformed);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch Core Web Vitals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchMetrics();

    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [period, autoRefresh, refreshInterval]);

  if (loading && metrics.length === 0) {
    return (
      <div className={`p-6 rounded-lg bg-white/5 border border-white/10 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-white/60 mb-3">Loading Core Web Vitals...</div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-8 h-8 border-2 border-white/20 border-t-cyan-400 rounded-full mx-auto"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Core Web Vitals</h2>
          <p className="text-sm text-white/60 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchMetrics}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
        >
          Refresh
        </motion.button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.name} metric={metric} />
        ))}
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 pt-4 border-t border-white/10">
        <button className="px-3 py-2 text-sm bg-white/10 rounded text-white/60 hover:bg-white/20">
          24h
        </button>
        <button className="px-3 py-2 text-sm bg-white/10 rounded text-white/60 hover:bg-white/20">
          7d
        </button>
        <button className="px-3 py-2 text-sm bg-white/10 rounded text-white/60 hover:bg-white/20">
          30d
        </button>
      </div>
    </div>
  );
}

/**
 * Individual Metric Card
 */
interface MetricCardProps {
  metric: CoreWebVital;
}

function MetricCard({ metric }: MetricCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'needsImprovement':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'poor':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      default:
        return 'text-white/60 bg-white/5 border-white/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return '✓';
      case 'needsImprovement':
        return '⚠';
      case 'poor':
        return '✕';
      default:
        return '—';
    }
  };

  const statusColor = getStatusColor(metric.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${statusColor}`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-sm">{metric.name}</h3>
        <span className="text-xl font-bold">{getStatusIcon(metric.status)}</span>
      </div>

      <div className="mb-3">
        <div className="text-2xl font-bold text-white">
          {metric.value !== undefined ? Math.round(metric.value * 10) / 10 : '—'}
          <span className="text-xs ml-1 font-normal text-white/60">{metric.unit}</span>
        </div>
      </div>

      {/* Thresholds */}
      <div className="space-y-1 text-xs text-white/60">
        <div className="flex justify-between">
          <span>Good:</span>
          <span>&lt; {metric.threshold.good}{metric.unit}</span>
        </div>
        <div className="flex justify-between">
          <span>Improve:</span>
          <span>&lt; {metric.threshold.needsImprovement}{metric.unit}</span>
        </div>
      </div>

      {/* Percentiles */}
      {metric.percentile && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-1 text-xs text-white/50">
          <div className="flex justify-between">
            <span>P50:</span>
            <span>{Math.round(metric.percentile.p50)}{metric.unit}</span>
          </div>
          <div className="flex justify-between">
            <span>P75:</span>
            <span>{Math.round(metric.percentile.p75)}{metric.unit}</span>
          </div>
          <div className="flex justify-between">
            <span>P95:</span>
            <span>{Math.round(metric.percentile.p95)}{metric.unit}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Determine metric status based on thresholds
 */
function getStatus(
  value: number,
  goodThreshold: number,
  needsImprovementThreshold: number
): 'good' | 'needsImprovement' | 'poor' {
  if (value <= goodThreshold) return 'good';
  if (value <= needsImprovementThreshold) return 'needsImprovement';
  return 'poor';
}
