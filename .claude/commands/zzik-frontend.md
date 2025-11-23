---
description: Start ZZIK frontend work (React Query, PWA, TODO handlers)
---

# ZZIK Frontend Development Session

Activating **zzik-frontend-completion** agent and **zzik-react-query-patterns** skill.

## Current Frontend Tasks

### 1. React Query Integration (P0)
- **Create**: `/apps/web/src/providers/query-provider.tsx`
- **Action**: Set up TanStack Query with proper defaults
- **Pattern**: 5-minute staleTime, retry logic, error boundaries

**Triggers**: zzik-react-query, zzik-cache-strategy

### 2. TODO Handler Implementation (P0)
- **Issue**: 20+ handlers with `console.log("TODO: ...")`
- **Files**: Mission steps, place reviews, wallet operations
- **Action**: Replace with proper React Query mutations

**Triggers**: zzik-todo-handlers, zzik-mutation-pattern

### 3. PWA Offline Support (P1)
- **Action**: Configure service workers for offline map caching
- **Strategy**: Cache-first for static assets, network-first for API
- **Pattern**: Workbox configuration

**Triggers**: zzik-pwa

### 4. Loading States & Error Boundaries (P1)
- **Issue**: Missing loading indicators and error handling UX
- **Action**: Add skeleton screens, error recovery UI
- **Pattern**: React Suspense + Error Boundary

**Triggers**: zzik-ui-completion

## React Query Patterns Available

**Query Hooks**: `usePlaces()`, `useMissions()`, `useWallet()`
**Mutation Patterns**: Optimistic updates, query invalidation, rollback
**Polling**: Real-time mission status updates (5-second intervals)
**Pagination**: Infinite scroll for place listings

## Ready for Frontend Work

Use patterns from **zzik-react-query-patterns** skill for state management.
Use **zzik-backend** agent for API route modifications if needed.

What frontend task would you like to start with?
