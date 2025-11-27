/**
 * V7 A/B Testing Framework
 *
 * Purpose:
 *   - Run controlled experiments on features
 *   - Measure impact on KPIs
 *   - Make data-driven product decisions
 *   - Reduce guessing, increase learning
 *
 * Psychology: Iterate based on data, not opinions
 */

'use client';

import { useCallback, useMemo, useRef } from 'react';
import { logger } from '@/lib/logger';

type TestVariant = 'control' | 'variant_a' | 'variant_b';

type MetricKey =
  | 'success_rate'
  | 'completion_rate'
  | 'average_duration'
  | 'error_rate'
  | 'retry_rate'
  | 'user_satisfaction';

interface ABTestConfig {
  testId: string;
  name: string;
  description: string;
  variants: {
    control: string; // Description of control group
    variant_a: string;
    variant_b?: string;
  };
  hypothesis: string; // What we expect to happen
  metrics: MetricKey[]; // Which KPIs to measure
  startDate: Date;
  endDate: Date;
  targetSampleSize: number;
  expectedLift: number; // % improvement we hope for
}

/**
 * Active A/B Tests Configuration
 * These are the 3 tests we're running during Phase 5
 */
const ACTIVE_TESTS: Record<string, ABTestConfig> = {
  celebration_animation: {
    testId: 'celebration_animation_v1',
    name: 'Success Celebration Duration',
    description: 'Test different animation durations for success celebration',
    variants: {
      control: 'Original 600ms bounce animation',
      variant_a: 'Faster 300ms fade animation',
      variant_b: 'Slower 800ms delayed bounce',
    },
    hypothesis: 'Faster animation may feel more responsive, improving satisfaction',
    metrics: ['success_rate', 'user_satisfaction'],
    startDate: new Date('2025-11-27'),
    endDate: new Date('2025-12-04'),
    targetSampleSize: 1000,
    expectedLift: 8,
  },

  error_messaging: {
    testId: 'error_messaging_v1',
    name: 'Error Message Style',
    description: 'Test friendly vs technical error messages',
    variants: {
      control: 'Technical error messages (e.g., "network_error")',
      variant_a: 'Friendly error messages (e.g., "Connection lost. Retrying...")',
    },
    hypothesis: 'Friendly messages reduce user frustration, improving retry rate',
    metrics: ['retry_rate', 'user_satisfaction', 'completion_rate'],
    startDate: new Date('2025-11-27'),
    endDate: new Date('2025-12-04'),
    targetSampleSize: 1000,
    expectedLift: 15,
  },

  retry_strategy: {
    testId: 'retry_strategy_v1',
    name: 'Retry Behavior',
    description: 'Test automatic vs manual retry',
    variants: {
      control: 'Manual retry (user clicks button)',
      variant_a: 'Automatic retry with 2-second delay',
    },
    hypothesis: 'Automatic retry reduces friction, improving completion rate',
    metrics: ['completion_rate', 'success_rate', 'error_rate'],
    startDate: new Date('2025-11-27'),
    endDate: new Date('2025-12-04'),
    targetSampleSize: 1000,
    expectedLift: 12,
  },
};

/**
 * Assign user to test variant (consistent, deterministic)
 * Uses hash to ensure same user always gets same variant
 */
function assignVariant(userId: string, _testId: string): TestVariant {
  // Simple hash: sum of char codes
  const hash = userId
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  const variants: TestVariant[] = ['control', 'variant_a', 'variant_b'];
  const index = hash % variants.length;

  return variants[index];
}

/**
 * Hook: useABTest
 * Assign user to test variant and track results
 *
 * Usage:
 *   const test = useABTest('celebration_animation', userId);
 *
 *   if (test.variant === 'control') {
 *     // 600ms bounce
 *   } else if (test.variant === 'variant_a') {
 *     // 300ms fade
 *   }
 */
export function useABTest(testId: string, userId: string) {
  const testConfigRef = useRef(ACTIVE_TESTS[testId]);
  const variantRef = useRef<TestVariant>(assignVariant(userId, testId));

  const isActive = useMemo(() => {
    const config = testConfigRef.current;
    if (!config) return false;

    const now = new Date();
    return now >= config.startDate && now <= config.endDate;
  }, []);

  const logEvent = useCallback(
    (metric: MetricKey, value: number) => {
      if (!isActive) return;

      // Send to analytics backend
      fetch('/api/analytics/ab-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          variant: variantRef.current,
          metric,
          value,
          userId,
          timestamp: Date.now(),
        }),
      }).catch((error) => {
        logger.error('Failed to log A/B test event', { error: String(error) });
      });
    },
    [testId, isActive, userId],
  );

  return {
    testId,
    variant: variantRef.current,
    isActive,
    config: testConfigRef.current,
    logEvent,
  };
}

/**
 * Hook: useTestAnalysis
 * Analyze A/B test results (call on admin dashboard)
 *
 * Purpose: Determine winner, statistical significance
 */
export interface TestAnalysisResult {
  testId: string;
  completed: boolean;
  sampleSizes: Record<TestVariant, number>;
  results: Partial<Record<MetricKey, {
    control: number;
    variant_a: number;
    variant_b?: number;
    winner: TestVariant;
    lift: number; // percentage improvement
    pValue: number;
    significant: boolean;
  }>>;
  recommendation: string;
}

export async function analyzeABTest(testId: string): Promise<TestAnalysisResult> {
  try {
    const response = await fetch(`/api/analytics/ab-test/${testId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch test results: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    logger.error('Failed to analyze A/B test', { error: String(error), testId });
    throw error;
  }
}

/**
 * Statistical significance calculator
 * Uses binomial test for proportions (success rate)
 *
 * Returns: p-value (lower = more significant)
 */
export function calculateSignificance(
  controlConversions: number,
  controlTotal: number,
  variantConversions: number,
  variantTotal: number,
): number {
  // Chi-square approximation for simplicity
  const controlRate = controlConversions / controlTotal;
  const variantRate = variantConversions / variantTotal;

  const pooledRate = (controlConversions + variantConversions) / (controlTotal + variantTotal);

  const se = Math.sqrt(
    pooledRate * (1 - pooledRate) * (1 / controlTotal + 1 / variantTotal),
  );

  const zScore = (variantRate - controlRate) / se;

  // Approximate p-value from z-score (two-tailed)
  // For z > 1.96, p < 0.05 (95% confidence)
  const pValue = 2 * (1 - gaussianCDF(Math.abs(zScore)));

  return pValue;
}

/**
 * Approximate cumulative distribution function for standard normal
 */
function gaussianCDF(z: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  z = Math.abs(z) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * z);
  const y = 1.0 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-z * z);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Calculate lift (percentage improvement)
 */
export function calculateLift(control: number, variant: number): number {
  if (control === 0) return 0;
  return ((variant - control) / control) * 100;
}

/**
 * Get all active tests
 */
export function getActiveTests(): ABTestConfig[] {
  const now = new Date();

  return Object.values(ACTIVE_TESTS).filter((test) => {
    return now >= test.startDate && now <= test.endDate;
  });
}

/**
 * Get test configuration
 */
export function getTestConfig(testId: string): ABTestConfig | undefined {
  return ACTIVE_TESTS[testId];
}

/**
 * Declare test winner (call when test ends)
 */
export async function declareWinner(
  testId: string,
  winner: TestVariant,
  rationale: string,
) {
  try {
    const response = await fetch(`/api/analytics/ab-test/${testId}/winner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        winner,
        rationale,
        declaredAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to declare winner: ${response.status}`);
    }

    logger.info('Test winner declared', { testId, winner });
    return response.json();
  } catch (error) {
    logger.error('Failed to declare A/B test winner', { error: String(error) });
    throw error;
  }
}
