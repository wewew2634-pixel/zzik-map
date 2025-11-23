// ZZIK LIVE v4 - Sentry Server Configuration

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0, // 100% in dev, reduce in production

  // Environment
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === "production",

  // Don't send PII to Sentry
  beforeSend(event, hint) {
    // Remove sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }

    // Remove user data
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }

    // Remove query parameters that might contain sensitive data
    if (event.request?.url) {
      try {
        const url = new URL(event.request.url);
        url.search = ""; // Remove query params
        event.request.url = url.toString();
      } catch {
        // Invalid URL, skip
      }
    }

    return event;
  },

  // Ignore common errors
  ignoreErrors: [
    "ECONNRESET",
    "ENOTFOUND",
    "ETIMEDOUT",
    "ECONNREFUSED",
  ],

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Server-specific integrations
  integrations: [
    // Add database query tracing if needed
    // new Sentry.Integrations.Prisma({ client: prisma }),
  ],
});
