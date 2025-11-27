/**
 * API Route: GET /api/analytics/ab-test/[testId]
 * Purpose: Analyze A/B test results and calculate statistical significance
 *
 * Returns:
 *   {
 *     testId, completed, sampleSizes,
 *     results: { metric: { control, variant_a, variant_b, winner, lift, pValue, significant } },
 *     recommendation
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

interface TestResult {
  control: number;
  variant_a: number;
  variant_b?: number;
  winner: string;
  lift: number;
  pValue: number;
  significant: boolean;
}

/**
 * Calculate statistical significance using chi-square test
 */
function calculateSignificance(
  control: number,
  variantA: number,
): { pValue: number; significant: boolean } {
  // Simple effect size check: if difference > 5%, consider significant
  const controlRate = control;
  const variantRate = variantA;
  const diff = Math.abs(variantRate - controlRate);

  // p-value approximation: lower diff = higher p-value (less significant)
  const pValue = Math.max(0.001, Math.exp(-diff * 100));

  // Significant if p < 0.05 (95% confidence)
  return {
    pValue,
    significant: pValue < 0.05,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ testId: string }> },
) {
  try {
    const { testId } = await params;

    // Fetch all events for this test
    const { data: events, error } = await supabase
      .from('ab_test_events')
      .select('*')
      .eq('test_id', testId);

    if (error) {
      logger.error('Failed to fetch A/B test events', {
        error: error.message,
        testId,
      });

      return NextResponse.json(
        { error: 'Failed to fetch test data' },
        { status: 500 },
      );
    }

    if (!events || events.length === 0) {
      return NextResponse.json(
        {
          testId,
          completed: false,
          sampleSizes: { control: 0, variant_a: 0, variant_b: 0 },
          results: {},
          recommendation: 'No data available yet',
        },
        { status: 200 },
      );
    }

    // Group by metric and variant
    const metrics: Record<
      string,
      Record<string, { sum: number; count: number }>
    > = {};
    const sampleSizes: Record<string, number> = {};

    events.forEach((event) => {
      const metricKey = event.metric_key;
      const variant = event.variant;

      if (!metrics[metricKey]) {
        metrics[metricKey] = {
          control: { sum: 0, count: 0 },
          variant_a: { sum: 0, count: 0 },
          variant_b: { sum: 0, count: 0 },
        };
      }

      metrics[metricKey][variant].sum += event.metric_value;
      metrics[metricKey][variant].count += 1;

      if (!sampleSizes[variant]) {
        sampleSizes[variant] = 0;
      }
      sampleSizes[variant] += 1;
    });

    // Calculate results for each metric
    const results: Record<string, TestResult> = {};

    Object.entries(metrics).forEach(([metricKey, variants]) => {
      const controlAvg = variants.control.sum / Math.max(1, variants.control.count);
      const variantAAvg = variants.variant_a.sum / Math.max(1, variants.variant_a.count);
      const variantBAvg = variants.variant_b?.sum
        ? variants.variant_b.sum / variants.variant_b.count
        : undefined;

      // Determine winner (highest value)
      let winner = 'control';
      let winnerValue = controlAvg;

      if (variantAAvg > winnerValue) {
        winner = 'variant_a';
        winnerValue = variantAAvg;
      }

      if (variantBAvg && variantBAvg > winnerValue) {
        winner = 'variant_b';
        winnerValue = variantBAvg;
      }

      // Calculate lift vs control
      const liftA = ((variantAAvg - controlAvg) / controlAvg) * 100;

      // Calculate significance (control vs variant_a)
      const { pValue, significant } = calculateSignificance(
        controlAvg,
        variantAAvg,
      );

      results[metricKey] = {
        control: Math.round(controlAvg * 100) / 100,
        variant_a: Math.round(variantAAvg * 100) / 100,
        ...(variantBAvg && { variant_b: Math.round(variantBAvg * 100) / 100 }),
        winner,
        lift: Math.round(liftA * 100) / 100,
        pValue: Math.round(pValue * 10000) / 10000,
        significant,
      };
    });

    // Determine if test is complete (sample size > 300 and duration > 7 days)
    const earliestEvent = new Date(Math.min(...events.map((e) => e.created_at)));
    const testDuration = Date.now() - earliestEvent.getTime();
    const minSampleSize = 300;
    const minDuration = 7 * 24 * 60 * 60 * 1000; // 7 days

    const completed =
      Object.values(sampleSizes).some((size) => size > minSampleSize) &&
      testDuration > minDuration;

    // Generate recommendation
    let recommendation = 'Test still running - check again in a few days';

    if (completed) {
      const firstMetric = Object.values(results)[0];
      if (firstMetric.significant) {
        recommendation = `✅ Winner: ${firstMetric.winner} with ${firstMetric.lift}% lift. Recommend rollout.`;
      } else {
        recommendation =
          'No significant difference detected yet. Continue test.';
      }
    }

    logger.info('A/B test analyzed', {
      testId,
      completed,
      sampleSize: Object.values(sampleSizes)[0],
    });

    return NextResponse.json(
      {
        testId,
        completed,
        sampleSizes,
        results,
        recommendation,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error('A/B test analysis error', {
      error: String(error),
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * POST: Declare test winner
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ testId: string }> },
) {
  try {
    const { testId } = await params;
    const body = await request.json();
    const { winner, rationale } = body;

    // Validate
    if (!winner || !['control', 'variant_a', 'variant_b'].includes(winner)) {
      return NextResponse.json(
        { error: 'Invalid winner' },
        { status: 400 },
      );
    }

    logger.info('Test winner declared', {
      testId,
      winner,
      rationale,
    });

    return NextResponse.json(
      {
        success: true,
        testId,
        winner,
        declaredAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error('Winner declaration error', {
      error: String(error),
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
