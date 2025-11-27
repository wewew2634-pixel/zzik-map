# ZZIK MAP 권한 승인 허용 목록
## 전체 개발 계획에서 승인이 필요한 모든 Bash 명령어

---

**목적**: Claude Code에서 자동 승인할 명령어들을 한번에 설정
**설정 위치**: `/home/ubuntu/.claude/settings.json` 또는 프로젝트 `.claude/settings.json`

---

## 1. 패키지 관리 (pnpm)

```
Bash(pnpm install:*)
Bash(pnpm add:*)
Bash(pnpm add -D:*)
Bash(pnpm remove:*)
Bash(pnpm update:*)
Bash(pnpm list:*)
Bash(pnpm outdated:*)
Bash(pnpm rebuild:*)
Bash(pnpm approve-builds:*)
Bash(pnpm run:*)
Bash(pnpm exec:*)
```

## 2. Next.js 개발

```
Bash(pnpm dev:*)
Bash(pnpm build:*)
Bash(pnpm start:*)
Bash(pnpm lint:*)
Bash(pnpm lint:fix:*)
Bash(next dev:*)
Bash(next build:*)
Bash(next start:*)
Bash(next lint:*)
```

## 3. TypeScript

```
Bash(pnpm type-check:*)
Bash(pnpm tsc:*)
Bash(pnpm exec tsc:*)
Bash(npx tsc:*)
Bash(tsc --noEmit:*)
Bash(tsc:*)
```

## 4. 테스트 (Vitest, Playwright)

```
Bash(pnpm test:*)
Bash(pnpm test:ui:*)
Bash(pnpm test:coverage:*)
Bash(pnpm test:e2e:*)
Bash(pnpm test:e2e:ui:*)
Bash(vitest:*)
Bash(npx vitest:*)
Bash(playwright test:*)
Bash(npx playwright:*)
Bash(pnpm exec playwright:*)
Bash(pnpm exec playwright install:*)
```

## 5. 코드 품질 (Prettier, ESLint)

```
Bash(pnpm format:*)
Bash(pnpm format:check:*)
Bash(prettier:*)
Bash(npx prettier:*)
Bash(eslint:*)
Bash(npx eslint:*)
```

## 6. Supabase CLI

```
Bash(pnpm db:init:*)
Bash(pnpm db:start:*)
Bash(pnpm db:stop:*)
Bash(pnpm db:migrate:*)
Bash(pnpm db:reset:*)
Bash(pnpm db:seed:*)
Bash(pnpm db:types:*)
Bash(supabase init:*)
Bash(supabase start:*)
Bash(supabase stop:*)
Bash(supabase db push:*)
Bash(supabase db reset:*)
Bash(supabase db diff:*)
Bash(supabase gen types:*)
Bash(supabase migration:*)
Bash(supabase status:*)
Bash(supabase link:*)
Bash(npx supabase:*)
Bash(pnpm supabase:*)
```

## 7. POC 스크립트 (tsx 실행)

```
Bash(pnpm poc:gps:*)
Bash(pnpm poc:gemini:*)
Bash(pnpm poc:pgvector:*)
Bash(pnpm poc:all:*)
Bash(tsx scripts/:*)
Bash(tsx scripts/poc/:*)
Bash(tsx scripts/seed/:*)
Bash(npx tsx:*)
Bash(pnpm exec tsx:*)
```

## 8. Git 명령어

```
Bash(git status:*)
Bash(git add:*)
Bash(git commit:*)
Bash(git push:*)
Bash(git pull:*)
Bash(git fetch:*)
Bash(git checkout:*)
Bash(git branch:*)
Bash(git merge:*)
Bash(git log:*)
Bash(git diff:*)
Bash(git stash:*)
Bash(git reset:*)
Bash(git remote:*)
Bash(git clone:*)
Bash(git init:*)
Bash(git -C:*)
```

## 9. 파일/디렉토리 관리

```
Bash(mkdir:*)
Bash(mkdir -p:*)
Bash(rm:*)
Bash(rm -rf:*)
Bash(cp:*)
Bash(cp -r:*)
Bash(mv:*)
Bash(touch:*)
Bash(chmod:*)
Bash(ls:*)
Bash(ls -la:*)
Bash(tree:*)
Bash(cat:*)
Bash(head:*)
Bash(tail:*)
Bash(wc:*)
Bash(find:*)
Bash(xargs:*)
```

## 10. 프로세스/네트워크

```
Bash(lsof:*)
Bash(lsof -i:*)
Bash(kill:*)
Bash(pkill:*)
Bash(curl:*)
Bash(curl -s:*)
Bash(wget:*)
Bash(node:*)
Bash(node --version:*)
Bash(npm --version:*)
Bash(pnpm --version:*)
Bash(timeout:*)
```

## 11. Claude MCP

```
Bash(claude mcp add:*)
Bash(claude mcp list:*)
Bash(claude mcp remove:*)
Bash(claude --version:*)
```

## 12. Docker (Supabase 로컬)

```
Bash(docker:*)
Bash(docker-compose:*)
Bash(docker ps:*)
Bash(docker logs:*)
```

## 13. PostgreSQL (로컬 테스트)

```
Bash(psql:*)
Bash(pg_isready:*)
Bash(PGPASSWORD=*:*)
```

## 14. 기타 유틸리티

```
Bash(echo:*)
Bash(tee:*)
Bash(grep:*)
Bash(sed:*)
Bash(awk:*)
Bash(sort:*)
Bash(uniq:*)
Bash(bc:*)
Bash(date:*)
Bash(env:*)
Bash(which:*)
Bash(whereis:*)
Bash(unzip:*)
Bash(tar:*)
```

---

## settings.json 설정 예시

`/home/ubuntu/.claude/settings.json` 또는 `/home/ubuntu/zzik-map/.claude/settings.json`에 추가:

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm:*)",
      "Bash(npm:*)",
      "Bash(npx:*)",
      "Bash(node:*)",
      "Bash(tsx:*)",
      "Bash(next:*)",
      "Bash(vitest:*)",
      "Bash(playwright:*)",
      "Bash(prettier:*)",
      "Bash(eslint:*)",
      "Bash(supabase:*)",
      "Bash(git:*)",
      "Bash(mkdir:*)",
      "Bash(rm:*)",
      "Bash(cp:*)",
      "Bash(mv:*)",
      "Bash(touch:*)",
      "Bash(chmod:*)",
      "Bash(ls:*)",
      "Bash(tree:*)",
      "Bash(cat:*)",
      "Bash(head:*)",
      "Bash(tail:*)",
      "Bash(wc:*)",
      "Bash(find:*)",
      "Bash(xargs:*)",
      "Bash(lsof:*)",
      "Bash(kill:*)",
      "Bash(pkill:*)",
      "Bash(curl:*)",
      "Bash(timeout:*)",
      "Bash(claude:*)",
      "Bash(docker:*)",
      "Bash(echo:*)",
      "Bash(tee:*)",
      "Bash(grep:*)",
      "Read(/home/ubuntu/zzik-map/**)",
      "Edit(/home/ubuntu/zzik-map/**)",
      "Write(/home/ubuntu/zzik-map/**)",
      "Glob(/home/ubuntu/zzik-map/**)",
      "Grep(/home/ubuntu/zzik-map/**)"
    ],
    "deny": []
  }
}
```

---

## 프로젝트별 설정 (권장)

`/home/ubuntu/zzik-map/.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm:*)",
      "Bash(npm:*)",
      "Bash(npx:*)",
      "Bash(node:*)",
      "Bash(tsx:*)",
      "Bash(next:*)",
      "Bash(vitest:*)",
      "Bash(playwright:*)",
      "Bash(prettier:*)",
      "Bash(eslint:*)",
      "Bash(supabase:*)",
      "Bash(git:*)",
      "Bash(mkdir:*)",
      "Bash(rm:*)",
      "Bash(cp:*)",
      "Bash(mv:*)",
      "Bash(touch:*)",
      "Bash(chmod:*)",
      "Bash(ls:*)",
      "Bash(tree:*)",
      "Bash(cat:*)",
      "Bash(head:*)",
      "Bash(tail:*)",
      "Bash(wc:*)",
      "Bash(find:*)",
      "Bash(xargs:*)",
      "Bash(lsof:*)",
      "Bash(kill:*)",
      "Bash(pkill:*)",
      "Bash(curl:*)",
      "Bash(timeout:*)",
      "Bash(claude:*)",
      "Bash(docker:*)",
      "Bash(echo:*)",
      "Bash(tee:*)",
      "Bash(grep:*)",
      "Bash(sleep:*)",
      "Bash(bash:*)",
      "Bash(sh:*)",
      "Read(/home/ubuntu/zzik-map/**)",
      "Edit(/home/ubuntu/zzik-map/**)",
      "Write(/home/ubuntu/zzik-map/**)"
    ]
  }
}
```

---

## 한번에 적용하는 방법

### 방법 1: settings.json 직접 수정
위의 JSON을 `/home/ubuntu/zzik-map/.claude/settings.json`에 저장

### 방법 2: Claude 대화에서 /permissions 명령어 사용
```
/permissions
```
메뉴에서 "Allow" 추가

### 방법 3: 대화 중 "Always allow" 선택
명령어 실행 시 나오는 권한 요청에서 "Always allow for this project" 선택

---

## Phase별 필요 명령어 요약

| Phase | 주요 명령어 |
|-------|------------|
| 0. 환경설정 | pnpm install, pnpm add, pnpm dev |
| 1. POC | tsx scripts/poc/*, pnpm poc:* |
| 2. 인프라 | supabase *, pnpm db:* |
| 3. MVP | pnpm dev, pnpm build, pnpm test |
| 4. 베타 | git *, pnpm build, vercel deploy |

---

*ZZIK MAP 권한 허용 목록*
*2025-11-26*
