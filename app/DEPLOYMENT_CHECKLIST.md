# ZZIK MAP - P0 Security Fixes Deployment Checklist

## Pre-Deployment Verification

### 1. Code Quality ✅
- [x] TypeScript compilation passes (`pnpm type-check`)
- [x] All security fixes implemented
- [x] No linting errors
- [ ] Unit tests pass
- [ ] E2E tests pass

### 2. Dependencies ✅
```bash
# Installed dependencies
pnpm install
# New: isomorphic-dompurify
```

### 3. Environment Variables ⚠️
**CRITICAL**: Verify all required environment variables are set

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Optional (for rate limiting)
REDIS_URL=redis://...
```

**Test validation**:
```bash
# Should fail gracefully with clear error
unset NEXT_PUBLIC_SUPABASE_URL
pnpm dev
# Expected: "Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL"
```

---

## Deployment Steps

### Step 1: Build Production Bundle
```bash
cd /home/ubuntu/zzik-map/app
pnpm build
```

**Expected Output**:
- No TypeScript errors
- No build warnings
- Bundle size report

### Step 2: Test Production Build Locally
```bash
pnpm start
```

**Test Checklist**:
- [ ] Server starts without errors
- [ ] Environment variables validated
- [ ] Supabase client initialized
- [ ] Middleware active (check security headers)

### Step 3: Deploy to Staging
```bash
# Your deployment command here
# Example: vercel deploy --staging
```

### Step 4: Staging Tests

**API Tests**:
```bash
# Test rate limiting
curl -X POST https://staging.zzikmap.com/api/analytics/upload \
  -H "Content-Type: application/json" \
  -d '{"metrics": {...}}'
# Repeat 11 times, should get 429 on 11th

# Test validation
curl -X POST https://staging.zzikmap.com/api/analytics/upload \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
# Expected: 400 with validation errors

# Test XSS sanitization
curl -X POST https://staging.zzikmap.com/api/analytics/upload \
  -H "Content-Type: application/json" \
  -d '{"metrics": {"fileName": "<script>alert(1)</script>"}}'
# Expected: 400 or fileName sanitized
```

**Security Headers Check**:
```bash
curl -I https://staging.zzikmap.com/api/analytics/upload
# Verify headers:
# - Content-Security-Policy
# - X-Frame-Options: DENY
# - X-Content-Type-Options: nosniff
# - X-RateLimit-Limit
# - X-Request-ID
```

### Step 5: Deploy to Production
```bash
# Your production deployment command
# Example: vercel deploy --prod
```

---

## Post-Deployment Monitoring

### Immediate (First Hour)

**Check Error Logs**:
```bash
# Look for:
# - "Missing required Supabase environment variables" (should NOT appear)
# - "Rate limit exceeded" (normal if users hitting limits)
# - "SECURITY ALERT: Potential secret exposed" (CRITICAL - investigate)
# - "Validation failed" (normal for invalid requests)
```

**Monitor Metrics**:
- Response times (should be +10-15ms max)
- Error rates (should be stable)
- Rate limit hits (track frequency)
- 429 responses (rate limit working)

### First 24 Hours

**Analytics**:
- [ ] Total requests
- [ ] Rate limit hit rate
- [ ] Validation error rate
- [ ] Average response time
- [ ] Error breakdown by category

**Security Events**:
- [ ] No secret exposure alerts
- [ ] CSRF protection working
- [ ] XSS attempts blocked
- [ ] Rate limiting effective

---

## Rollback Plan

If critical issues detected:

### 1. Immediate Rollback
```bash
# Revert to previous deployment
# Example: vercel rollback
```

### 2. Known Issues & Workarounds

**Issue**: Rate limiting too aggressive
**Workaround**: Temporarily increase limits in `/src/lib/rateLimit.ts`
```typescript
analyticsUpload: createRateLimiter({
  maxRequests: 20, // Increased from 10
  windowMs: 60 * 1000,
})
```

**Issue**: Validation rejecting valid data
**Workaround**: Check Zod schema in `/src/lib/schemas/analytics.ts`

**Issue**: CSRF blocking legitimate requests
**Workaround**: Temporarily disable CSRF in middleware (NOT RECOMMENDED)

---

## Success Criteria

### ✅ Deployment Successful If:

1. **Zero critical errors** in first hour
2. **No secret exposure alerts**
3. **Rate limiting working** (seeing 429s)
4. **Validation working** (seeing 400s for invalid data)
5. **Response times** <50ms increase
6. **Error rates** stable or decreased
7. **Security headers** present on all responses
8. **TypeScript compilation** passes in production

### ⚠️ Monitor Closely If:

1. Rate limit hit rate >10% of requests
2. Validation error rate >5% of requests
3. Response time increase >20ms
4. Any secret exposure warnings

### 🚨 Rollback Immediately If:

1. **Secret exposure detected** in production
2. **Error rate spike** >20%
3. **Critical functionality broken**
4. **Database connection failures**
5. **Authentication broken**

---

## Team Communication

### Before Deployment
- [ ] Notify team in #deployments channel
- [ ] Schedule deployment window
- [ ] Assign on-call engineer
- [ ] Prepare rollback plan

### During Deployment
- [ ] Status updates every 15 minutes
- [ ] Monitor error logs live
- [ ] Watch metrics dashboard

### After Deployment
- [ ] Post-deployment summary
- [ ] Document any issues
- [ ] Update runbook if needed

---

## Quick Commands Reference

```bash
# Build
pnpm build

# Type check
pnpm type-check

# Test
pnpm test

# Dev server
pnpm dev

# Production server
pnpm start

# Logs (if using PM2)
pm2 logs zzik-map

# Restart (if using PM2)
pm2 restart zzik-map
```

---

## Emergency Contacts

- **On-Call Engineer**: [Your Contact]
- **Security Team**: security@zzikmap.com
- **DevOps Lead**: [Your Contact]

---

**Checklist Version**: 1.0
**Created**: 2025-11-27
**For Deployment**: P0 Security Fixes
