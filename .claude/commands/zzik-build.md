# ZZIK Production Build

Create a production build of ZZIK MAP.

## Steps

1. Run type checking
2. Run linting
3. Build production bundle
4. Show build output

## Commands

```bash
cd /home/ubuntu/zzik-map/app
pnpm type-check
pnpm lint
pnpm build
```

## Expected Output

- No TypeScript errors
- No ESLint warnings
- Optimized production build in `.next/`

## Build Targets

- Static pages pre-rendered
- API routes bundled
- Assets optimized
