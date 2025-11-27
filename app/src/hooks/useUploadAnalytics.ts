/**
 * V7 Analytics: Upload Flow Tracking
 *
 * Tracks every state transition for:
 *   - Performance metrics (how long in each state?)
 *   - User behavior (where do users drop off?)
 *   - Error analysis (what errors occur most?)
 *   - A/B testing (feature variants impact)
 */

'use client';

import { useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';

type AnalyticsEventType =
  | 'upload_started'
  | 'validation_started'
  | 'validation_completed'
  | 'validation_failed'
  | 'upload_progress'
  | 'upload_completed'
  | 'processing_started'
  | 'processing_completed'
  | 'processing_failed'
  | 'upload_error'
  | 'retry_attempted'
  | 'upload_success'
  | 'upload_abandoned';

interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  timestamp: number;
  metadata: Record<string, unknown>;
  userSegment?: 'explorer' | 'one_shot' | 'high_engagement' | 'inactive';
}

export interface UploadAnalyticsMetrics {
  sessionId: string;
  userId?: string;
  uploadId: string;
  cohort?: string;
  events: AnalyticsEvent[];
  startTime: number;
  endTime?: number;
  totalDuration?: number;
  // Derived metrics
  completed: boolean;
  succeeded: boolean;
  hadErrors: boolean;
  errorTypes: string[];
  retryCount: number;
  timeInEachState: Record<string, number>;
}

/**
 * V7 Analytics Hook: Track upload flow for data-driven decisions
 *
 * Psychology: Understanding user behavior → better UX decisions
 * Business: Metrics → A/B testing → conversion optimization
 *
 * Integration points:
 *   1. State machine transitions
 *   2. Error recovery attempts
 *   3. Time spent in each state
 *   4. User segment classification
 */
export function useUploadAnalytics() {
  const sessionIdRef = useRef<string>(generateSessionId());
  const metricsRef = useRef<UploadAnalyticsMetrics>({
    sessionId: sessionIdRef.current,
    uploadId: generateUploadId(),
    events: [],
    startTime: Date.now(),
    completed: false,
    succeeded: false,
    hadErrors: false,
    errorTypes: [],
    retryCount: 0,
    timeInEachState: {},
  });

  const stateEnterTimeRef = useRef<number>(Date.now());
  const previousStateRef = useRef<string>('idle');

  /**
   * Track state transition time
   * Updates: timeInEachState[previousState] += (now - stateEnterTime)
   */
  const trackStateTime = useCallback((newState: string) => {
    const now = Date.now();
    const duration = now - stateEnterTimeRef.current;
    const previousState = previousStateRef.current;

    if (!metricsRef.current.timeInEachState[previousState]) {
      metricsRef.current.timeInEachState[previousState] = 0;
    }
    metricsRef.current.timeInEachState[previousState] += duration;

    stateEnterTimeRef.current = now;
    previousStateRef.current = newState;
  }, []);

  /**
   * Track analytics event with metadata
   */
  const trackEvent = useCallback(
    (
      eventType: AnalyticsEventType,
      metadata: Record<string, unknown> = {},
      userSegment?: 'explorer' | 'one_shot' | 'high_engagement' | 'inactive',
    ) => {
      const event: AnalyticsEvent = {
        eventType,
        timestamp: Date.now(),
        metadata,
        userSegment,
      };

      metricsRef.current.events.push(event);

      // Special handling for certain events
      switch (eventType) {
        case 'validation_failed':
        case 'upload_error':
        case 'processing_failed':
          metricsRef.current.hadErrors = true;
          if (metadata.error && typeof metadata.error === 'string') {
            metricsRef.current.errorTypes.push(metadata.error);
          }
          break;

        case 'retry_attempted':
          metricsRef.current.retryCount += 1;
          break;

        case 'upload_success':
          metricsRef.current.succeeded = true;
          metricsRef.current.completed = true;
          metricsRef.current.endTime = Date.now();
          metricsRef.current.totalDuration = metricsRef.current.endTime - metricsRef.current.startTime;
          break;

        case 'upload_abandoned':
          metricsRef.current.completed = false;
          metricsRef.current.endTime = Date.now();
          metricsRef.current.totalDuration = metricsRef.current.endTime - metricsRef.current.startTime;
          break;
      }

      // Log for debugging
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`[Analytics] ${eventType}`, {
          sessionId: metricsRef.current.sessionId,
          uploadId: metricsRef.current.uploadId,
          ...metadata,
        });
      }
    },
    [],
  );

  /**
   * Submit analytics to backend
   * Runs on success, error, or abandonment
   */
  const submitMetrics = useCallback(async () => {
    const metrics = metricsRef.current;

    // Don't submit if no events
    if (metrics.events.length === 0) return;

    try {
      const response = await fetch('/api/analytics/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: {
            sessionId: metrics.sessionId,
            uploadId: metrics.uploadId,
            userId: metrics.userId,
            cohort: metrics.cohort,
            succeeded: metrics.succeeded,
            completed: metrics.completed,
            hadErrors: metrics.hadErrors,
            retryCount: metrics.retryCount,
            totalDuration: metrics.totalDuration,
            errorTypes: metrics.errorTypes,
            timeInEachState: metrics.timeInEachState,
            eventCount: metrics.events.length,
            events: metrics.events,
          },
        }),
      });

      if (!response.ok) {
        logger.error('Failed to submit analytics', {
          status: response.status,
          uploadId: metrics.uploadId,
        });
      }
    } catch (error) {
      logger.error('Analytics submission error', {
        error: String(error),
        uploadId: metrics.uploadId,
      });
    }
  }, []);

  /**
   * Set user segment (for cohort analysis)
   * Used to track which cohorts benefit most from features
   */
  const setUserSegment = useCallback((segment: string) => {
    metricsRef.current.cohort = segment;
  }, []);

  /**
   * Get current metrics snapshot
   */
  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  return {
    sessionId: sessionIdRef.current,
    uploadId: metricsRef.current.uploadId,
    trackEvent,
    trackStateTime,
    submitMetrics,
    setUserSegment,
    getMetrics,
  };
}

/**
 * Analytics Query Hooks (for dashboards / reporting)
 */

interface AnalyticsFilter {
  dateRange?: [Date, Date];
  succeeded?: boolean;
  hadErrors?: boolean;
  minRetries?: number;
  cohort?: string;
}

/**
 * Fetch upload metrics for a time range
 * Used by: analytics dashboard, A/B test analysis, performance monitoring
 */
export async function fetchUploadMetrics(
  filter: AnalyticsFilter,
): Promise<UploadAnalyticsMetrics[]> {
  try {
    const params = new URLSearchParams();

    if (filter.dateRange) {
      params.append('startDate', filter.dateRange[0].toISOString());
      params.append('endDate', filter.dateRange[1].toISOString());
    }

    if (filter.succeeded !== undefined) {
      params.append('succeeded', String(filter.succeeded));
    }

    if (filter.hadErrors !== undefined) {
      params.append('hadErrors', String(filter.hadErrors));
    }

    if (filter.minRetries !== undefined) {
      params.append('minRetries', String(filter.minRetries));
    }

    if (filter.cohort) {
      params.append('cohort', filter.cohort);
    }

    const response = await fetch(`/api/analytics/uploads?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Analytics fetch failed: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    logger.error('Failed to fetch upload metrics', { error: String(error) });
    return [];
  }
}

/**
 * Calculate KPIs from metrics
 * Used by: KPI dashboard, success evaluation
 */
export interface UploadKPIs {
  totalUploads: number;
  successRate: number; // % of succeeded
  completionRate: number; // % of completed (succeeded or failed)
  averageDuration: number; // ms
  errorRate: number; // % with errors
  retryRate: number; // % that retried
  averageRetries: number;
  mostCommonErrors: Array<[string, number]>;
}

export function calculateKPIs(metrics: UploadAnalyticsMetrics[]): UploadKPIs {
  if (metrics.length === 0) {
    return {
      totalUploads: 0,
      successRate: 0,
      completionRate: 0,
      averageDuration: 0,
      errorRate: 0,
      retryRate: 0,
      averageRetries: 0,
      mostCommonErrors: [],
    };
  }

  const succeeded = metrics.filter((m) => m.succeeded).length;
  const completed = metrics.filter((m) => m.completed).length;
  const withErrors = metrics.filter((m) => m.hadErrors).length;
  const withRetries = metrics.filter((m) => m.retryCount > 0).length;

  // Count error types
  const errorCounts: Record<string, number> = {};
  metrics.forEach((m) => {
    m.errorTypes.forEach((error) => {
      errorCounts[error] = (errorCounts[error] || 0) + 1;
    });
  });

  const totalDuration = metrics.reduce((sum, m) => sum + (m.totalDuration || 0), 0);
  const totalRetries = metrics.reduce((sum, m) => sum + m.retryCount, 0);

  return {
    totalUploads: metrics.length,
    successRate: succeeded / metrics.length,
    completionRate: completed / metrics.length,
    averageDuration: totalDuration / metrics.length,
    errorRate: withErrors / metrics.length,
    retryRate: withRetries / metrics.length,
    averageRetries: totalRetries / metrics.length,
    mostCommonErrors: Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
  };
}

/**
 * Helper: Generate unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper: Generate unique upload ID
 */
function generateUploadId(): string {
  return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
