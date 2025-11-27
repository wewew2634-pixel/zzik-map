# Animation System Skill V3
## 60fps Motion Design & Performance

## When to Use
Invoke this skill when:
- Implementing page transitions
- Adding micro-interactions
- Building loading states
- Creating scroll animations
- Optimizing animation performance

---

## Animation Principles

### ZZIK Motion Values
```yaml
Brand Personality:
  - Energetic but not chaotic
  - Smooth and confident
  - Playful discovery feel
  - Professional elegance

Performance Rules:
  - 60fps minimum
  - GPU-accelerated only
  - Respect reduced motion
  - Purposeful, not decorative
```

---

## Duration System

```typescript
// tokens/animation.ts
export const duration = {
  instant: 50,    // Micro feedback (hover state change)
  fast: 100,      // Button press, toggle
  normal: 200,    // Most transitions
  slow: 300,      // Modal open/close
  slower: 500,    // Page transitions
  slowest: 800,   // Hero animations
};

// CSS Variables
:root {
  --duration-instant: 50ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
  --duration-slowest: 800ms;
}
```

---

## Easing Functions

```typescript
export const easing = {
  // Standard easings
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

  // Custom springs
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  snappy: 'cubic-bezier(0.25, 0.1, 0.25, 1)',

  // Smooth for UI
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

// CSS Variables
:root {
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### When to Use Each
```yaml
easeOut:     Entering elements (modal appears)
easeIn:      Exiting elements (modal closes)
easeInOut:   Morphing (size/position change)
spring:      Playful interactions (like button)
bounce:      Celebratory (success states)
smooth:      General transitions
```

---

## Framer Motion Variants

### Fade In Up
```tsx
const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0, 0, 0.2, 1], // easeOut
    },
  },
};

<motion.div
  variants={fadeInUp}
  initial="hidden"
  animate="visible"
>
  Content
</motion.div>
```

### Scale In
```tsx
const scaleIn = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.175, 0.885, 0.32, 1.275], // spring
    },
  },
};
```

### Stagger Container
```tsx
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.ul variants={staggerContainer} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.li key={item.id} variants={staggerItem}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

### Page Transition
```tsx
const pageTransition = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
};
```

---

## CSS Animations

### Keyframes
```css
/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Slide Up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Pulse Glow */
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 90, 95, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 90, 95, 0.5);
  }
}

/* Shimmer (Loading) */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Float */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
```

### Animation Classes
```css
.animate-fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.animate-slide-up {
  animation: slideUp var(--duration-slow) var(--ease-out);
}

.animate-scale-in {
  animation: scaleIn var(--duration-normal) var(--ease-spring);
}

.animate-pulse-glow {
  animation: pulseGlow 2s infinite;
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
```

---

## Scroll Animations

### Intersection Observer Hook
```tsx
import { useRef, useEffect, useState } from 'react';

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useInView(options: UseInViewOptions = {}) {
  const { threshold = 0.2, rootMargin = '0px', triggerOnce = true } = options;
  const ref = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) observer.disconnect();
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isInView };
}
```

### With Framer Motion
```tsx
import { motion } from 'framer-motion';

function ScrollReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

---

## Micro-Interactions

### Button Hover
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.1 }}
>
  Click me
</motion.button>
```

### Card Hover
```tsx
<motion.div
  whileHover={{
    y: -4,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
  }}
  transition={{ duration: 0.2 }}
>
  Card content
</motion.div>
```

### Link Hover
```css
.link-hover {
  position: relative;
}

.link-hover::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--zzik-coral);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform var(--duration-fast) var(--ease-out);
}

.link-hover:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}
```

### Icon Rotation
```tsx
<motion.div
  animate={{ rotate: isOpen ? 180 : 0 }}
  transition={{ duration: 0.2 }}
>
  <ChevronIcon />
</motion.div>
```

---

## Loading States

### Skeleton
```tsx
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`
        bg-white/5
        rounded-lg
        animate-shimmer
        ${className}
      `}
    />
  );
}

// Usage
<Skeleton className="h-4 w-3/4" />
<Skeleton className="h-4 w-1/2 mt-2" />
```

### Spinner
```tsx
function Spinner({ size = 24 }: { size?: number }) {
  return (
    <motion.div
      className="border-2 border-white/20 border-t-white rounded-full"
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
}
```

### Progress Bar
```tsx
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-zzik-coral"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      />
    </div>
  );
}
```

---

## Performance Optimization

### GPU-Accelerated Properties
```yaml
GOOD (Composited):
  - transform (translate, scale, rotate)
  - opacity
  - filter

BAD (Layout/Paint):
  - width, height
  - top, left, right, bottom
  - margin, padding
  - border-width
```

### will-change
```css
/* Use sparingly */
.will-animate {
  will-change: transform, opacity;
}

/* Remove after animation */
.animation-complete {
  will-change: auto;
}
```

### Contain
```css
/* Isolate rendering */
.isolated-animation {
  contain: layout paint;
}
```

### Layer Promotion
```css
/* Force GPU layer */
.gpu-layer {
  transform: translateZ(0);
  /* or */
  backface-visibility: hidden;
}
```

---

## Reduced Motion

### CSS
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### React Hook
```tsx
import { useReducedMotion } from 'framer-motion';

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={shouldReduceMotion ? {} : { x: 100 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
    >
      Content
    </motion.div>
  );
}
```

---

## Animation Patterns Library

### Modal
```tsx
const modalVariants = {
  overlay: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  content: {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  },
};
```

### Dropdown
```tsx
const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.15, ease: [0, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    y: -5,
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};
```

### Accordion
```tsx
const accordionVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
};
```

### Toast
```tsx
const toastVariants = {
  initial: { opacity: 0, y: 50, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15 } },
};
```

---

## Quick Reference

| Animation | Duration | Easing |
|-----------|----------|--------|
| Hover state | 100ms | easeOut |
| Button press | 100ms | easeOut |
| Toggle | 150ms | easeInOut |
| Modal open | 300ms | spring |
| Modal close | 200ms | easeIn |
| Page transition | 400ms | easeOut |
| Scroll reveal | 600ms | easeOut |
| Hero animation | 800ms | easeOut |

---

*Animation System Skill V3.0*
*60fps Motion Design & Performance*
