# ZZIK LIVE v4

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Testing

### Unit Tests

Run unit tests with Vitest:

```bash
npm run test          # Run tests
npm run test:ui       # Run tests with UI
npm run test:coverage # Run tests with coverage
```

### Load Testing

Performance and load testing using [k6](https://k6.io/):

```bash
# Install k6 first (see load-tests/README.md for installation)
brew install k6  # macOS

# Run load tests
k6 run load-tests/baseline.js      # Basic API performance
k6 run load-tests/mission-flow.js  # Mission flow simulation
k6 run load-tests/stress.js        # Stress testing
```

For detailed load testing documentation, see [load-tests/README.md](load-tests/README.md).

**Performance Targets:**
- Response time (p95): < 500ms
- Error rate: < 1%
- Concurrent users: 100+

## Monitoring

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Prometheus Metrics

```bash
curl http://localhost:3000/api/metrics
```

For observability architecture details, see [OBSERVABILITY_ARCHITECTURE.md](OBSERVABILITY_ARCHITECTURE.md).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
