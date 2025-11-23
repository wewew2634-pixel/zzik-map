---
name: zzik-react-query-patterns
description: TanStack Query (React Query) patterns for ZZIK v5.1 state management.
triggers: ["zzik-react-query", "zzik-cache-strategy", "zzik-optimistic-update", "zzik-query-invalidation", "zzik-mutation-pattern"]
version: 1.0.0
created: 2025-11-24
---

# ZZIK React Query Patterns Skill

Provides TanStack Query (React Query) patterns for ZZIK v5.1 state management.

## Activation

This skill activates automatically when you mention ZZIK frontend state management:
- "zzik-react-query", "zzik-cache-strategy", "zzik-optimistic-update"
- "zzik-query-invalidation", "zzik-mutation-pattern"

---

## Core Patterns

### 1. Query Hooks with Proper Keys

```typescript
// apps/web/src/hooks/usePlaces.ts
import { useQuery } from '@tanstack/react-query';

export function usePlaces(filters?: { category?: string; distance?: number }) {
  return useQuery({
    queryKey: ['places', filters], // ✅ Include filters in key
    queryFn: async () => {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`/api/places?${params}`);
      if (!response.ok) throw new Error('Failed to fetch places');
      return response.json();
    },
    staleTime: 60 * 1000, // 1 minute
  });
}
```

**Key Structure**:
- `['places']` - All places queries
- `['places', { category: 'cafe' }]` - Filtered places
- `['place', placeId]` - Single place

---

### 2. Mutations with Optimistic Updates

```typescript
// apps/web/src/hooks/useStartMission.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useStartMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ missionId, userId }) => {
      const res = await fetch('/api/mission-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId, userId }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onMutate: async (variables) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['missionRuns'] });

      // Snapshot current value
      const previous = queryClient.getQueryData(['missionRuns']);

      // Optimistically add new run
      queryClient.setQueryData(['missionRuns'], (old: any) => [
        ...old,
        { id: 'temp', missionId: variables.missionId, status: 'PENDING_GPS' },
      ]);

      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['missionRuns'], context?.previous);
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: ['missionRuns'] });
    },
  });
}
```

---

### 3. Polling for Real-Time Updates

```typescript
// apps/web/src/hooks/useMissionRun.ts
export function useMissionRun(missionRunId: string) {
  return useQuery({
    queryKey: ['missionRun', missionRunId],
    queryFn: async () => {
      const res = await fetch(`/api/mission-runs/${missionRunId}`);
      return res.json();
    },
    refetchInterval: (query) => {
      const status = query.state.data?.missionRun.status;

      // Poll every 3s if pending, stop if completed
      return ['PENDING_GPS', 'PENDING_QR', 'PENDING_REELS', 'PENDING_REVIEW'].includes(status)
        ? 3000
        : false;
    },
  });
}
```

---

### 4. Dependent Queries

```typescript
// Only fetch missions after place is loaded
export function useMissions(placeId?: string) {
  return useQuery({
    queryKey: ['missions', placeId],
    queryFn: async () => {
      const res = await fetch(`/api/missions?placeId=${placeId}`);
      return res.json();
    },
    enabled: !!placeId, // ✅ Wait for placeId
  });
}

// Usage:
const { data: place } = usePlace(placeId);
const { data: missions } = useMissions(place?.id); // Waits for place
```

---

### 5. Infinite Scroll Pagination

```typescript
export function usePlacesInfinite() {
  return useInfiniteQuery({
    queryKey: ['places', 'infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetch(`/api/places?page=${pageParam}&limit=20`);
      return res.json();
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length : undefined;
    },
  });
}

// Usage:
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = usePlacesInfinite();

<InfiniteScroll
  loadMore={fetchNextPage}
  hasMore={hasNextPage}
  loader={<Spinner />}
>
  {data?.pages.flatMap(page => page.places).map(place => (
    <PlaceCard key={place.id} place={place} />
  ))}
</InfiniteScroll>
```

---

### 6. Manual Query Invalidation

```typescript
// After approving mission, invalidate related queries
const approveMutation = useMutation({
  mutationFn: approveMissionRun,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['missionRuns'] });
    queryClient.invalidateQueries({ queryKey: ['wallet'] });
    queryClient.invalidateQueries({ queryKey: ['loyalty'] });
  },
});
```

---

### 7. Prefetching for Better UX

```typescript
// Prefetch place details on hover
const queryClient = useQueryClient();

<PlaceCard
  onMouseEnter={() => {
    queryClient.prefetchQuery({
      queryKey: ['place', place.id],
      queryFn: () => fetch(`/api/places/${place.id}`).then(r => r.json()),
    });
  }}
/>
```

---

## Best Practices

1. **Query Keys**: Use arrays with structured data
   - ✅ `['missions', { placeId: '123', status: 'ACTIVE' }]`
   - ❌ `['missions-123-ACTIVE']` (string concatenation, hard to invalidate)

2. **Stale Time**: Set based on data freshness needs
   - Static data: `Infinity` (never refetch)
   - User data: `60000` (1 minute)
   - Real-time data: `0` (always refetch)

3. **Error Handling**: Show toast notifications
   ```typescript
   onError: (error) => {
     toast.error(error.message);
   }
   ```

4. **Loading States**: Use `isLoading` vs `isFetching`
   - `isLoading`: First load
   - `isFetching`: Background refetch

---

## Resources

- TanStack Query Docs: https://tanstack.com/query/latest
- ZZIK Hooks: `/apps/web/src/hooks/`

**Skill Version**: 1.0.0
**Created**: 2025-11-24
