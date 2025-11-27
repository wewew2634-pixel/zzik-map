# Performance Optimization Skill V2
## Sub-Second Loading & 60fps Interactions

## When to Use
Invoke this skill when:
- Optimizing page load times
- Reducing bundle size
- Improving animation performance
- Fixing layout thrashing
- Implementing lazy loading

---

## Core Web Vitals Targets

| Metric | Good | Needs Work | Poor |
|--------|------|------------|------|
| LCP | < 2.5s | 2.5-4s | > 4s |
| FID | < 100ms | 100-300ms | > 300ms |
| CLS | < 0.1 | 0.1-0.25 | > 0.25 |
| TTFB | < 800ms | 800-1800ms | > 1800ms |
| FCP | < 1.8s | 1.8-3s | > 3s |

---

## Bundle Optimization

### Analyze Bundle Size
```bash
# Next.js bundle analyzer
pnpm add -D @next/bundle-analyzer

# Build with analysis
ANALYZE=true pnpm build
```

### Configure in next.config.js
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... other config
});
```

### Code Splitting Patterns
```tsx
// Dynamic import for large components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false,
});

// Route-based splitting (automatic in Next.js)
// Each page in /app is automatically code-split
```

### Tree Shaking
```tsx
// BAD - imports entire library
import _ from 'lodash';
_.debounce(fn, 300);

// GOOD - imports only what's needed
import debounce from 'lodash/debounce';
debounce(fn, 300);

// BETTER - use native or smaller library
import { useDebouncedCallback } from 'use-debounce';
```

---

## Image Optimization

### Next.js Image Component
```tsx
import Image from 'next/image';

// Automatic optimization
<Image
  src="/photo.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL={blurHash}
/>

// Responsive images
<Image
  src="/photo.jpg"
  alt="Description"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>
```

### Image Loading Strategies
```tsx
// Above the fold - load immediately
<Image priority src="/hero.jpg" />

// Below the fold - lazy load (default)
<Image src="/gallery.jpg" />

// With blur placeholder
<Image
  src="/photo.jpg"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Generate Blur Data URL
```typescript
import { getPlaiceholder } from 'plaiceholder';

async function getBlurDataURL(src: string) {
  const { base64 } = await getPlaiceholder(src);
  return base64;
}
```

---

## Font Optimization

### Next.js Font Optimization
```tsx
// app/layout.tsx
import { Noto_Sans_KR } from 'next/font/google';

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
});

export default function RootLayout({ children }) {
  return (
    <html className={notoSansKR.variable}>
      <body>{children}</body>
    </html>
  );
}
```

### Font Preloading
```tsx
// For critical fonts
<link
  rel="preload"
  href="/fonts/custom.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

---

## Animation Performance

### GPU-Accelerated Properties
```css
/* GOOD - GPU accelerated */
transform: translateX(100px);
transform: scale(1.1);
opacity: 0.5;

/* BAD - triggers layout */
left: 100px;
width: 200px;
height: 200px;
```

### will-change Optimization
```css
/* Use sparingly - only for known animations */
.card-hover {
  will-change: transform;
}

/* Remove after animation */
.card-hover:hover {
  transform: scale(1.05);
}
```

### Framer Motion Best Practices
```tsx
// GOOD - uses transform
<motion.div animate={{ x: 100, scale: 1.1 }} />

// BAD - triggers layout
<motion.div animate={{ left: 100, width: 200 }} />

// Use layout animations carefully
<motion.div layout layoutId="shared-element" />

// Reduce motion for accessibility
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

<motion.div
  animate={prefersReducedMotion ? {} : { x: 100 }}
/>
```

### CSS Animation Performance
```css
/* Prefer CSS for simple animations */
.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Use contain for isolated components */
.card {
  contain: layout paint;
}
```

---

## React Performance

### Memoization
```tsx
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
const ExpensiveList = memo(function ExpensiveList({ items }) {
  return items.map(item => <Item key={item.id} {...item} />);
});

// Memoize expensive calculations
const sortedItems = useMemo(() => {
  return items.sort((a, b) => b.score - a.score);
}, [items]);

// Memoize callbacks
const handleClick = useCallback((id: string) => {
  setSelected(id);
}, []);
```

### Virtualization for Long Lists
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} className="h-[400px] overflow-auto">
      <div
        style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Avoid Re-renders
```tsx
// BAD - creates new object every render
<Component style={{ color: 'red' }} />

// GOOD - stable reference
const style = useMemo(() => ({ color: 'red' }), []);
<Component style={style} />

// BAD - creates new function every render
<Button onClick={() => handleClick(id)} />

// GOOD - stable callback
const handleButtonClick = useCallback(() => handleClick(id), [id]);
<Button onClick={handleButtonClick} />
```

---

## Data Fetching Optimization

### SWR with Deduplication
```tsx
import useSWR from 'swr';

// Automatic request deduplication
function useUser(id: string) {
  return useSWR(`/api/users/${id}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  });
}
```

### Prefetching
```tsx
import { preload } from 'swr';

// Prefetch on hover
function Link({ href, children }) {
  return (
    <a
      href={href}
      onMouseEnter={() => preload(href, fetcher)}
    >
      {children}
    </a>
  );
}
```

### Server-Side Data
```tsx
// Fetch data on server
async function Page({ params }) {
  const data = await fetchData(params.id);

  return <ClientComponent initialData={data} />;
}

// Use initial data in client
function ClientComponent({ initialData }) {
  const { data } = useSWR('/api/data', fetcher, {
    fallbackData: initialData,
  });
}
```

---

## Layout Stability (CLS)

### Reserve Space for Dynamic Content
```tsx
// BAD - causes layout shift
{isLoaded && <Image src={src} />}

// GOOD - reserves space
<div className="aspect-video">
  {isLoaded ? <Image src={src} fill /> : <Skeleton />}
</div>
```

### Font Display Swap
```css
/* Prevents FOIT (Flash of Invisible Text) */
@font-face {
  font-family: 'Custom';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap;
}
```

### Fixed Dimensions for Ads/Embeds
```tsx
// Reserve exact space
<div style={{ width: 300, height: 250 }}>
  <AdComponent />
</div>
```

---

## Caching Strategies

### Next.js Cache Headers
```typescript
// app/api/data/route.ts
export async function GET() {
  const data = await fetchData();

  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
```

### Static Generation
```typescript
// Generate at build time
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

// Revalidate periodically
export const revalidate = 3600; // 1 hour
```

---

## Profiling Tools

### React DevTools Profiler
```tsx
// Wrap component to profile
<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComponent />
</Profiler>

function onRenderCallback(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) {
  console.log({ id, phase, actualDuration, baseDuration });
}
```

### Performance API
```typescript
// Measure custom metrics
performance.mark('start-operation');
await doExpensiveOperation();
performance.mark('end-operation');

performance.measure('operation-duration', 'start-operation', 'end-operation');

const measures = performance.getEntriesByName('operation-duration');
console.log(`Operation took ${measures[0].duration}ms`);
```

### Lighthouse CI
```yaml
# .github/workflows/lighthouse.yml
- uses: treosh/lighthouse-ci-action@v10
  with:
    urls: |
      http://localhost:3000
      http://localhost:3000/journey
    budgetPath: ./lighthouse-budget.json
```

---

## Performance Budget

### lighthouse-budget.json
```json
[
  {
    "path": "/*",
    "timings": [
      { "metric": "first-contentful-paint", "budget": 1800 },
      { "metric": "largest-contentful-paint", "budget": 2500 },
      { "metric": "cumulative-layout-shift", "budget": 0.1 },
      { "metric": "total-blocking-time", "budget": 300 }
    ],
    "resourceSizes": [
      { "resourceType": "script", "budget": 300 },
      { "resourceType": "total", "budget": 1000 }
    ]
  }
]
```

---

## Quick Wins Checklist

- [ ] Enable Next.js Image optimization
- [ ] Use `next/font` for fonts
- [ ] Add `priority` to above-fold images
- [ ] Use `loading="lazy"` for below-fold images
- [ ] Implement skeleton loaders
- [ ] Use SWR for data fetching
- [ ] Add `will-change` for animated elements
- [ ] Use CSS `contain` for isolated components
- [ ] Virtualize long lists (> 100 items)
- [ ] Debounce search inputs
- [ ] Preload critical resources

---

*Performance Optimization Skill V2.0*
*Sub-Second Loading & 60fps Interactions*
