/**
 * ZZIK LIVE - Generic Event Tracking Utility
 *
 * Professional event tracking with:
 * - Console logging in development
 * - Google Analytics integration (if available)
 * - Custom analytics endpoint (optional)
 * - Type-safe event names and properties
 */

type EventProperties = Record<string, unknown>

/**
 * Tracks a custom event to analytics
 *
 * @param eventName - Name of the event (e.g., 'error_boundary_triggered')
 * @param properties - Optional event properties
 *
 * @example
 * trackEvent('error_boundary_triggered', {
 *   error: error.message,
 *   component: 'HomePage',
 * })
 */
export function trackEvent(eventName: string, properties?: EventProperties): void {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${eventName}`, properties)
  }

  // Send to Google Analytics (if available)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties)
  }

  // Alternative: Send to custom analytics endpoint
  // Uncomment to enable:
  // if (typeof window !== 'undefined') {
  //   fetch('/api/analytics/events', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       event: eventName,
  //       properties,
  //       timestamp: new Date().toISOString(),
  //     }),
  //     keepalive: true,
  //   }).catch((err) => {
  //     console.error('[Analytics] Failed to send event:', err)
  //   })
  // }
}

// TypeScript declaration for gtag (extends web-vitals.ts)
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, unknown>
    ) => void
  }
}
