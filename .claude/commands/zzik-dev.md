# ZZIK Development Environment

Start the ZZIK MAP development environment.

## Steps

1. Check Node.js and pnpm versions
2. Navigate to app directory
3. Install dependencies if needed
4. Check environment variables
5. Start development server

## Commands

```bash
cd /home/ubuntu/zzik-map/app
node --version
pnpm --version
pnpm install
pnpm dev
```

## Expected Output

- Development server running on http://localhost:3000
- Hot reload enabled
- TypeScript checking active

## Troubleshooting

- If port 3000 is busy: `lsof -i :3000` then `kill -9 <PID>`
- If dependencies fail: `rm -rf node_modules && pnpm install`
- If env missing: Copy `.env.example` to `.env.local`
