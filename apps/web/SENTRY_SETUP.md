# Sentry Error Tracking - Quick Setup Guide

## Prerequisites
- Sentry account (free tier available)
- Project created in Sentry dashboard

## Setup Steps

### 1. Get Your Sentry DSN

1. Go to https://sentry.io
2. Create a new project or select existing one
3. Choose "Next.js" as platform
4. Copy your DSN (looks like: `https://xxx@xxx.ingest.sentry.io/xxx`)

### 2. Configure Environment Variables

Create or update `.env.local`:

```bash
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/your-project-id
SENTRY_AUTH_TOKEN=your-auth-token-here
```

**To get SENTRY_AUTH_TOKEN**:
1. Go to Settings → Auth Tokens
2. Create new token with `project:releases` scope
3. Copy the token

### 3. Test the Integration

Start the dev server:
```bash
pnpm dev
```

Test error capture (development only):
```bash
# Test error
curl http://localhost:3000/api/sentry-test?type=error

# Test message
curl http://localhost:3000/api/sentry-test?type=message

# Test breadcrumb with error
curl http://localhost:3000/api/sentry-test?type=breadcrumb
```

Check Sentry dashboard for events.

### 4. Production Configuration

For production, adjust sampling rates in config files:

**sentry.client.config.ts**:
```typescript
tracesSampleRate: 0.1,  // 10% of requests
replaysSessionSampleRate: 0.01,  // 1% of sessions
```

**sentry.server.config.ts**:
```typescript
tracesSampleRate: 0.1,  // 10% of requests
```

## Usage Examples

### Capture Error with Context
```typescript
import { captureError } from '@/core/observability/error-tracking';

try {
  // Your code
} catch (error) {
  captureError(error as Error, {
    userId: user.id,
    action: 'mission-verification',
  });
}
```

### Track Mission Events
```typescript
import { captureMissionRunError } from '@/core/observability/error-tracking';

captureMissionRunError(
  new Error('GPS verification failed'),
  missionRunId,
  missionId,
  userId,
  { latitude, longitude, accuracy }
);
```

### Add Breadcrumbs
```typescript
import { addBreadcrumb } from '@/core/observability/error-tracking';

addBreadcrumb(
  'User started verification',
  'mission.verification',
  { type: 'gps', missionId }
);
```

### Set User Context
```typescript
import { setUser, clearUser } from '@/core/observability/error-tracking';

// On login
setUser(user.id, { username: user.name });

// On logout
clearUser();
```

## Sentry Dashboard

### Recommended Setup

1. **Alerts**: Configure for critical errors
   - New issue types
   - High error frequency
   - Performance degradation

2. **Filters**: Create saved searches
   - `missionId:*` - All mission errors
   - `level:error` - Only errors
   - `environment:production` - Production only

3. **Performance**: Monitor transactions
   - API response times
   - Mission completion duration
   - Database queries

## Troubleshooting

### No events in Sentry?

1. Check `NEXT_PUBLIC_SENTRY_DSN` is set
2. Verify `enabled: true` in production
3. Check browser console for Sentry errors
4. Ensure error actually occurred (not caught silently)

### Source maps not working?

1. Verify `SENTRY_AUTH_TOKEN` is set
2. Check token has `project:releases` scope
3. Ensure build runs successfully
4. Check Sentry → Settings → Source Maps

### PII concerns?

All configs include `beforeSend` hooks that:
- Remove cookies
- Remove headers
- Remove IP addresses
- Remove email addresses
- Strip query parameters

## Performance Impact

Sentry has minimal performance impact:
- Client: ~10KB gzipped
- Server: Async reporting (non-blocking)
- Sampling: Configurable rates
- Session replay: Opt-in, sampled

## Best Practices

1. **Don't over-capture**: Only capture 5xx errors from API
2. **Use breadcrumbs**: Track user journey for context
3. **Add tags**: Make filtering easier (`missionId`, `userId`)
4. **Set context**: Add relevant metadata
5. **Ignore noise**: Configure `ignoreErrors` for known issues
6. **Monitor quota**: Check Sentry usage regularly

## Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Error Tracking Utils](/src/core/observability/error-tracking.ts)
- [Test Endpoint](/src/app/api/sentry-test/route.ts)
- [Integration Summary](/SENTRY_INTEGRATION_SUMMARY.md)

## Support

For issues with Sentry integration, check:
1. This setup guide
2. Sentry documentation
3. Project maintainers
4. Sentry support (for platform issues)
