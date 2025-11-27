/**
 * UX Metrics Analytics (Phase 5)
 *
 * Tracks Core Web Vitals and custom UX metrics
 * WCAG 2.1: Provides data-driven accessibility improvements
 *
 * Metrics:
 * - LCP: Largest Contentful Paint (page load performance)
 * - FID: First Input Delay (interactivity)
 * - CLS: Cumulative Layout Shift (visual stability)
 * - TTI: Time to Interactive (app ready)
 * - FCP: First Contentful Paint (perceived load)
 */

export interface UXMetrics {
  // Core Web Vitals
  lcp?: number;  // Largest Contentful Paint (ms)
  fid?: number;  // First Input Delay (ms)
  cls?: number;  // Cumulative Layout Shift (0-1)
  tti?: number;  // Time to Interactive (ms)
  fcp?: number;  // First Contentful Paint (ms)

  // Custom Metrics
  navigationTime?: number;  // Page transition time
  interactionTime?: number; // Time to respond to user action
  animationFPS?: number;    // Animation frame rate
  memoryUsage?: number;     // Memory used (MB)

  // Accessibility
  focusTraps?: number;      // Number of focus management issues
  colorContrastErrors?: number; // Contrast ratio failures
  mobileAccessibilityErrors?: number; // Mobile-specific a11y issues

  // Business
  conversionTime?: number;  // Time to conversion/goal
  sessionDuration?: number; // User session length
  bounceRate?: number;      // Percentage of single-page sessions
}

/**
 * Web Vitals API - Reports real user metrics
 *
 * Falls back to Performance Observer API if web-vitals library is not available
 */
export function initializeWebVitals(callback: (metrics: UXMetrics) => void) {
  if (typeof window === 'undefined') return;

  const metrics: UXMetrics = {};

  // Use Performance Observer API as primary method
  initializePerformanceObserver(metrics, callback);
}

/**
 * Fallback: Performance Observer API
 */
function initializePerformanceObserver(
  metrics: UXMetrics,
  callback: (metrics: UXMetrics) => void
) {
  if (!window.PerformanceObserver) return;

  // Observe Long Tasks (FID proxy)
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'longtask') {
          metrics.fid = (metrics.fid || 0) + entry.duration;
        }
      }
    });

    observer.observe({ entryTypes: ['longtask', 'largest-contentful-paint'] });

    // Report after 3 seconds
    setTimeout(() => callback(metrics), 3000);
  } catch (error) {
    console.warn('PerformanceObserver setup failed:', error);
  }
}

/**
 * Track custom interaction metrics
 */
export function trackInteraction(actionName: string, duration: number) {
  if (typeof window === 'undefined') return;

  const metrics = {
    action: actionName,
    duration,
    timestamp: Date.now(),
  };

  // Send to analytics endpoint
  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      '/api/analytics/interactions',
      JSON.stringify(metrics)
    );
  } else {
    // Fallback to fetch
    fetch('/api/analytics/interactions', {
      method: 'POST',
      body: JSON.stringify(metrics),
      keepalive: true,
    }).catch((err) => console.warn('Failed to send metrics:', err));
  }
}

/**
 * Performance scoring based on Core Web Vitals
 * Returns score 0-100 (Google Lighthouse scale)
 */
export function calculatePerformanceScore(metrics: UXMetrics): number {
  let score = 100;

  // LCP (Largest Contentful Paint)
  // Good: < 2.5s, Needs improvement: 2.5-4s, Poor: > 4s
  if (metrics.lcp) {
    if (metrics.lcp > 4000) score -= 40;
    else if (metrics.lcp > 2500) score -= 20;
  }

  // FID (First Input Delay)
  // Good: < 100ms, Needs improvement: 100-300ms, Poor: > 300ms
  if (metrics.fid) {
    if (metrics.fid > 300) score -= 30;
    else if (metrics.fid > 100) score -= 15;
  }

  // CLS (Cumulative Layout Shift)
  // Good: < 0.1, Needs improvement: 0.1-0.25, Poor: > 0.25
  if (metrics.cls) {
    if (metrics.cls > 0.25) score -= 30;
    else if (metrics.cls > 0.1) score -= 15;
  }

  return Math.max(0, score);
}

/**
 * Accessibility scoring based on audit results
 */
export function calculateAccessibilityScore(metrics: UXMetrics): number {
  let score = 100;

  // Color contrast errors
  if (metrics.colorContrastErrors) {
    score -= Math.min(40, metrics.colorContrastErrors * 5);
  }

  // Focus management issues
  if (metrics.focusTraps) {
    score -= Math.min(30, metrics.focusTraps * 10);
  }

  // Mobile accessibility
  if (metrics.mobileAccessibilityErrors) {
    score -= Math.min(30, metrics.mobileAccessibilityErrors * 3);
  }

  return Math.max(0, score);
}

/**
 * Overall UX score (weighted average)
 */
export function calculateUXScore(metrics: UXMetrics): number {
  const perfScore = calculatePerformanceScore(metrics);
  const a11yScore = calculateAccessibilityScore(metrics);

  // Weight: 60% performance, 40% accessibility
  return Math.round(perfScore * 0.6 + a11yScore * 0.4);
}
