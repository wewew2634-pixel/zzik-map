// ZZIK LIVE - Core Web Vitals Monitoring
// Note: FID has been deprecated in web-vitals v5+ in favor of INP
import { onCLS, onLCP, onINP, onFCP, onTTFB, type Metric } from 'web-vitals';

/**
 * Reports Web Vitals metrics to analytics
 * 
 * Metrics tracked:
 * - LCP (Largest Contentful Paint): < 2.5s good, < 4s needs improvement
 * - CLS (Cumulative Layout Shift): < 0.1 good, < 0.25 needs improvement
 * - INP (Interaction to Next Paint): < 200ms good, < 500ms needs improvement (replaces FID)
 * - FCP (First Contentful Paint): < 1.8s good, < 3s needs improvement
 * - TTFB (Time to First Byte): < 800ms good, < 1800ms needs improvement
 */
function sendToAnalytics(metric: Metric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    });
  }

  // Send to analytics in production
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_rating: metric.rating,
      non_interaction: true,
    });
  }

  // Alternative: Send to custom analytics endpoint
  // fetch('/api/analytics/web-vitals', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(metric),
  //   keepalive: true,
  // });
}

/**
 * Initialize Web Vitals monitoring
 * Call this once on app initialization
 */
export function reportWebVitals() {
  try {
    onCLS(sendToAnalytics);
    // onFID removed in web-vitals v5 - replaced by onINP
    onLCP(sendToAnalytics);
    onINP(sendToAnalytics);
    onFCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  } catch (error) {
    console.error('[Web Vitals] Failed to initialize:', error);
  }
}

// TypeScript declaration for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}
