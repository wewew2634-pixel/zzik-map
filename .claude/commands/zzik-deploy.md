# /zzik-deploy Command

Deployment operations for ZZIK MAP.

---

## Usage

```
/zzik-deploy [environment] [options]
```

---

## Environments

| Environment | URL | Branch |
|-------------|-----|--------|
| Development | localhost:3000 | feature/* |
| Staging | staging.zzik.app | develop |
| Production | zzik.app | main |

---

## Pre-Deploy Checklist

```bash
# 1. Run all tests
pnpm test:coverage
pnpm test:e2e

# 2. Check types
pnpm tsc --noEmit

# 3. Run linter
pnpm lint

# 4. Build locally
pnpm build

# 5. Check bundle size
pnpm analyze
```

---

## Vercel Deployment

### Initial Setup
```bash
# Install Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Link project
vercel link
```

### Deploy Commands
```bash
# Preview deployment (staging)
vercel

# Production deployment
vercel --prod

# Deploy specific branch
vercel --prod --scope=zzik-team
```

### Environment Variables
```bash
# Add secret
vercel env add GEMINI_API_KEY production

# Pull env to local
vercel env pull .env.local

# List all env vars
vercel env ls
```

---

## Database Migrations (Production)

### Before Deploy
```bash
# 1. Backup production DB
pg_dump -h $PROD_SUPABASE_HOST -U postgres -d postgres > backup_pre_deploy_$(date +%Y%m%d).sql

# 2. Apply migrations to staging first
SUPABASE_DB_URL=$STAGING_DB_URL npx supabase db push

# 3. Test on staging
# ... run manual tests ...

# 4. Apply to production
SUPABASE_DB_URL=$PROD_DB_URL npx supabase db push
```

### Rollback Plan
```bash
# If migration fails, restore from backup
psql -h $PROD_SUPABASE_HOST -U postgres -d postgres < backup_pre_deploy_20251126.sql
```

---

## CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:coverage
      - run: pnpm test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: ${{ github.ref == 'refs/heads/main' && '--prod' || '' }}
```

---

## Deployment Workflow

### Feature → Staging
```bash
# 1. Create PR to develop
git checkout -b feature/new-feature
# ... make changes ...
git push origin feature/new-feature
# Create PR to develop branch

# 2. Merge triggers staging deploy
# Auto-deploys to staging.zzik.app
```

### Staging → Production
```bash
# 1. Test on staging thoroughly
# 2. Create PR from develop to main
git checkout develop
git pull origin develop
git checkout main
git merge develop
git push origin main

# 3. Triggers production deploy
# Auto-deploys to zzik.app
```

---

## Monitoring Post-Deploy

### Vercel Dashboard
```
https://vercel.com/zzik-team/zzik-map
```

### Key Metrics to Check
1. **Build Time**: Should be < 3 minutes
2. **Bundle Size**: Check for increases
3. **Error Rate**: Monitor Sentry
4. **API Latency**: Check Supabase dashboard

### Health Check
```bash
# Check production health
curl -I https://zzik.app/api/health

# Check specific endpoints
curl https://zzik.app/api/vibe/analyze -X POST -d '{"test": true}'
```

---

## Rollback

### Vercel Rollback
```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]

# Or from dashboard:
# Vercel Dashboard → Deployments → ... → Promote to Production
```

### Emergency Rollback
```bash
# 1. Rollback Vercel deployment
vercel rollback

# 2. Rollback database if needed
psql -h $PROD_HOST -U postgres -d postgres < backup_pre_deploy.sql

# 3. Clear CDN cache
vercel purge
```

---

## Environment-Specific Configs

### Development
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DEBUG=true
```

### Staging
```env
NEXT_PUBLIC_SUPABASE_URL=https://staging-xxx.supabase.co
NEXT_PUBLIC_API_URL=https://staging.zzik.app/api
DEBUG=true
```

### Production
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_API_URL=https://zzik.app/api
DEBUG=false
```

---

## Quick Reference

| Operation | Command |
|-----------|---------|
| Preview deploy | `vercel` |
| Production deploy | `vercel --prod` |
| List deployments | `vercel ls` |
| Rollback | `vercel rollback` |
| Add env var | `vercel env add` |
| Pull env vars | `vercel env pull` |
| Check logs | `vercel logs` |
| Purge cache | `vercel purge` |

---

## Post-Deploy Tasks

1. **Verify critical paths**
   - User login/signup
   - Photo upload
   - Vibe analysis
   - Payment flow (if applicable)

2. **Monitor for 30 minutes**
   - Error rates
   - API response times
   - User reports

3. **Update status page** (if applicable)
   - status.zzik.app

4. **Notify team**
   - Slack #deployments channel
