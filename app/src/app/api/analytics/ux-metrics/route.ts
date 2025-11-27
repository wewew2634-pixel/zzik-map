import { NextRequest, NextResponse } from 'next/server';

/**
 * UX Metrics Collection Endpoint (Phase 7)
 *
 * Collects Core Web Vitals and custom UX metrics from client
 * Aggregates metrics for real-time dashboard and historical analysis
 *
 * Metrics collected:
 * - Core Web Vitals: LCP, FID, CLS, TTFB
 * - Custom metrics: navigationTime, interactionTime, animationFPS
 * - Accessibility: focusTraps, colorContrastErrors, mobileAccessibilityErrors
 * - Business: conversionTime, sessionDuration, bounceRate
 */

export interface UXMetricsPayload {
  // Session
  sessionId: string;
  timestamp: number;
  userAgent: string;

  // Core Web Vitals (milliseconds or unitless)
  lcp?: number; // Largest Contentful Paint (ms)
  fid?: number; // First Input Delay (ms)
  cls?: number; // Cumulative Layout Shift (0-1)
  ttfb?: number; // Time to First Byte (ms)
  tti?: number; // Time to Interactive (ms)
  fcp?: number; // First Contentful Paint (ms)

  // Custom Metrics
  navigationTime?: number; // Page transition time (ms)
  interactionTime?: number; // Time to respond to user action (ms)
  animationFps?: number; // Animation frame rate
  memoryUsage?: number; // Memory used (MB)

  // Accessibility
  focusTraps?: number; // Number of focus management issues
  colorContrastErrors?: number; // Contrast ratio failures
  mobileAccessibilityErrors?: number; // Mobile-specific a11y issues

  // Business
  conversionTime?: number; // Time to conversion/goal (ms)
  sessionDuration?: number; // User session length (ms)
  bounceRate?: number; // Percentage of single-page sessions (0-1)

  // Context
  page: string; // Current page URL
  referrer?: string;
  locale?: string;
  theme?: 'light' | 'dark' | 'dark-oled';
  deviceType?: 'mobile' | 'tablet' | 'desktop';
}

export interface UXMetricsResponse {
  success: boolean;
  message: string;
  metricsId?: string;
}

/**
 * POST /api/analytics/ux-metrics
 * Receives UX metrics from client
 */
export async function POST(request: NextRequest): Promise<NextResponse<UXMetricsResponse>> {
  try {
    // Parse request body
    const metrics: UXMetricsPayload = await request.json();

    // Validate required fields
    if (!metrics.sessionId || !metrics.page) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: sessionId, page',
        },
        { status: 400 }
      );
    }

    // TODO: In production, store metrics in database
    // Example: await db.uxMetrics.create({ ...metrics })

    // For now, log to console
    console.log('[UX Metrics]', {
      sessionId: metrics.sessionId,
      page: metrics.page,
      lcp: metrics.lcp,
      fid: metrics.fid,
      cls: metrics.cls,
      timestamp: new Date(metrics.timestamp).toISOString(),
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Metrics received successfully',
        metricsId: `metrics-${Date.now()}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[UX Metrics Error]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process metrics',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/ux-metrics
 * Retrieves aggregated metrics (for dashboard)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Query parameters for filtering
    const pageParam = request.nextUrl.searchParams.get('page');
    const periodParam = request.nextUrl.searchParams.get('period') || '24h';
    const thresholdParam = request.nextUrl.searchParams.get('threshold') || '50';

    // TODO: Query metrics from database
    // Example aggregation query:
    // const metrics = await db.uxMetrics.aggregate({
    //   page: pageParam,
    //   timestamp: { $gte: new Date(Date.now() - parsePeriod(periodParam)) },
    // });

    // For now, return mock data
    return NextResponse.json({
      success: true,
      data: {
        period: periodParam,
        page: pageParam || 'all',
        metrics: {
          lcp: {
            avg: 2300,
            p50: 2100,
            p75: 2800,
            p95: 3500,
            p99: 4200,
            good: 78, // percentage
            needsImprovement: 15,
            poor: 7,
          },
          fid: {
            avg: 85,
            p50: 50,
            p75: 120,
            p95: 250,
            p99: 350,
            good: 92,
            needsImprovement: 6,
            poor: 2,
          },
          cls: {
            avg: 0.08,
            p50: 0.05,
            p75: 0.12,
            p95: 0.25,
            p99: 0.35,
            good: 82,
            needsImprovement: 12,
            poor: 6,
          },
          tti: {
            avg: 3800,
            p50: 3200,
            p75: 4500,
            p95: 5800,
            p99: 6500,
          },
          fcp: {
            avg: 1200,
            p50: 1000,
            p75: 1500,
            p95: 2100,
            p99: 2800,
          },
        },
        accessibility: {
          focusTraps: 0.3, // avg per session
          colorContrastErrors: 0,
          mobileAccessibilityErrors: 0.5,
          overallA11yScore: 92, // out of 100
        },
        business: {
          averageSessionDuration: 245000, // ms
          bounceRate: 0.32, // 32%
          conversionRate: 0.045, // 4.5%
          averageConversionTime: 180000, // ms
        },
        devices: {
          mobile: 0.65,
          tablet: 0.15,
          desktop: 0.2,
        },
        locales: {
          en: 0.45,
          ko: 0.35,
          ja: 0.12,
          'zh-CN': 0.08,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[UX Metrics Aggregation Error]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve metrics',
      },
      { status: 500 }
    );
  }
}
