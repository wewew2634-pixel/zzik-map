# Microinteractions Library V4
## Subtle Feedback, Profound Impact

## Definition

Microinteractions = Single task accomplishment with micro-level feedback

```
Trigger → Rules → Feedback → Loops/Modes
   ↓        ↓        ↓          ↓
 User    Animation  Visual    Continue?
 action  sequence   states    behavior
```

---

## Microinteraction Catalog

### 1. Button Press
```typescript
// Trigger: User clicks/taps button
// Rules: Execute action, show loading if async
// Feedback: Visual press + color change
// Loop: Continue on success, retry on failure

<motion.button
  whileHover={{
    backgroundColor: 'var(--coral-600)',
    boxShadow: '0 8px 24px rgba(255, 90, 95, 0.4)',
  }}
  whileTap={{
    scale: 0.95,
    backgroundColor: 'var(--coral-700)',
  }}
  transition={{ duration: 0.1 }}
  className="
    px-6 py-3
    bg-coral-500
    text-white
    rounded-lg
    font-semibold
    active:scale-95
  "
>
  {isLoading ? (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      ⟳
    </motion.div>
  ) : (
    'Send'
  )}
</motion.button>
```

**Feedback Timeline:**
- 0ms: Tap detected
- 50ms: Scale to 0.95
- 100ms: Color darkens
- 200ms: Release detected
- 300ms: Scale returns to 1
- 400ms: Color returns

---

### 2. Form Validation Feedback
```typescript
// Trigger: User leaves input field or submits
// Rules: Validate value, check format
// Feedback: Color change, error message, icon
// Loop: Continue typing to clear error

const [value, setValue] = useState('');
const [error, setError] = useState<string | null>(null);

const validateEmail = (val: string) => {
  if (!val.includes('@')) {
    setError('유효한 이메일을 입력해주세요');
    return false;
  }
  setError(null);
  return true;
};

<motion.div className="relative">
  <input
    type="email"
    value={value}
    onChange={(e) => {
      setValue(e.target.value);
      if (error) validateEmail(e.target.value); // Clear error on typing
    }}
    onBlur={() => validateEmail(value)}
    className={`
      w-full px-4 py-3 rounded-lg
      border-2 transition-colors
      ${error
        ? 'border-red-500 bg-red-500/10'
        : 'border-white/10 bg-white/5'
      }
    `}
    aria-invalid={error ? true : false}
    aria-describedby={error ? 'email-error' : undefined}
  />

  {/* Validation icon */}
  <AnimatePresence>
    {error && (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="absolute right-3 top-1/2 -translate-y-1/2"
      >
        <XCircleIcon className="w-5 h-5 text-red-500" />
      </motion.div>
    )}
    {!error && value && (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute right-3 top-1/2 -translate-y-1/2"
      >
        <CheckCircleIcon className="w-5 h-5 text-green-500" />
      </motion.div>
    )}
  </AnimatePresence>

  {/* Error message */}
  <AnimatePresence>
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        id="email-error"
        role="alert"
        className="text-red-400 text-sm mt-2"
      >
        {error}
      </motion.p>
    )}
  </AnimatePresence>
</motion.div>
```

**Interaction States:**
- Pristine: White/10 border
- Focused: Brighter border
- Typing: Clear error if present
- Invalid: Red border + icon + message
- Valid: Green checkmark

---

### 3. Hover Reveal
```typescript
// Trigger: Mouse enters element
// Rules: Show secondary info, don't distract
// Feedback: Smooth entrance, elevation
// Loop: Hide on mouse leave

<motion.div
  whileHover="show"
  initial="hide"
  className="relative group"
>
  {/* Base content */}
  <div className="text-white">Card Content</div>

  {/* Hover reveal */}
  <motion.div
    variants={{
      hide: {
        opacity: 0,
        y: 10,
        pointerEvents: 'none',
      },
      show: {
        opacity: 1,
        y: 0,
        pointerEvents: 'auto',
      },
    }}
    transition={{ duration: 0.2 }}
    className="
      absolute inset-0 bg-black/80 rounded-lg
      flex items-center justify-center gap-2
    "
  >
    <button className="px-4 py-2 bg-coral rounded hover:bg-coral-600">
      보기
    </button>
    <button className="px-4 py-2 bg-white/20 rounded hover:bg-white/30">
      공유
    </button>
  </motion.div>
</motion.div>
```

**Timing:**
- 0ms: Hover detected
- 0ms: Opacity 0 → 1
- 200ms: Y position 10 → 0
- 200ms: Pointer events enabled

---

### 4. List Item Entrance
```typescript
// Trigger: Item appears on screen
// Rules: Stagger entrance, one after another
// Feedback: Fade + slide animation
// Loop: Loop for each item

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0, 0, 0.2, 1] },
  },
};

<motion.ul
  variants={container}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true }}
>
  {items.map((item) => (
    <motion.li key={item.id} variants={item}>
      <div className="p-4 bg-white/5 rounded-lg">
        {item.text}
      </div>
    </motion.li>
  ))}
</motion.ul>
```

**Timeline Example (3 items):**
- 0ms: Container hidden
- 200ms: Item 1 starts (0-400ms)
- 300ms: Item 2 starts (100-500ms)
- 400ms: Item 3 starts (200-600ms)
- 600ms: All done

---

### 5. Like/Favorite Toggle
```typescript
// Trigger: User clicks heart icon
// Rules: Toggle favorite, update UI
// Feedback: Icon animation, color change
// Loop: Can toggle again

const [isFavorited, setIsFavorited] = useState(false);

<motion.button
  onClick={() => setIsFavorited(!isFavorited)}
  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
  aria-label={isFavorited ? 'Remove favorite' : 'Add favorite'}
>
  <motion.div
    initial={false}
    animate={{
      scale: isFavorited ? [1, 1.3, 1] : 1,
    }}
    transition={{
      duration: 0.4,
      ease: [0.34, 1.56, 0.64, 1], // bounce
    }}
  >
    <HeartIcon
      className={`w-6 h-6 transition-colors ${
        isFavorited ? 'fill-coral text-coral' : 'text-zinc-400'
      }`}
    />
  </motion.div>
</motion.button>
```

**Bounce Animation:**
- 0ms: Scale 1
- 150ms: Scale 1.3 (peak)
- 400ms: Scale 1 (return)

---

### 6. Page Transition
```typescript
// Trigger: User navigates to new page
// Rules: Exit animation + enter animation
// Feedback: Smooth fade + slide
// Loop: Continue when complete

const pageVariants = {
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

<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    {children}
  </motion.div>
</AnimatePresence>
```

**Timing:**
- Click: 0ms
- Trigger exit: 0ms
- Fade out: 0-300ms
- Load new: 0ms
- Fade in: 0-400ms
- Total: ~300ms (overlap)

---

### 7. Success Toast
```typescript
// Trigger: Action completes successfully
// Rules: Show message, auto-dismiss
// Feedback: Color (green), sound optional
// Loop: Queue toasts if multiple

const [toasts, setToasts] = useState<Toast[]>([]);

const showToast = (message: string) => {
  const id = Date.now();
  setToasts((prev) => [...prev, { id, message }]);

  setTimeout(() => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, 4000);
};

<div className="fixed bottom-4 right-4 space-y-2 z-50">
  <AnimatePresence>
    {toasts.map((toast) => (
      <motion.div
        key={toast.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="
          px-4 py-3 rounded-lg
          bg-green-500/20 border border-green-500/50
          text-green-300 text-sm
          flex items-center gap-2
        "
      >
        <CheckCircleIcon className="w-5 h-5" />
        {toast.message}
      </motion.div>
    ))}
  </AnimatePresence>
</div>
```

**Timeline:**
- 0ms: Show (slide up + fade in)
- 0-500ms: Entrance animation
- 500-3500ms: Display
- 3500-4000ms: Exit animation

---

### 8. Loading Skeleton Shimmer
```typescript
// Trigger: Data loading starts
// Rules: Show placeholder matching shape
// Feedback: Shimmer effect suggests loading
// Loop: Remove when data arrives

const shimmerGradient = `
  linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  )
`;

<motion.div
  className="space-y-4"
  animate={{
    backgroundPosition: ['200% 0', '-200% 0'],
  }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    ease: 'linear',
  }}
  style={{
    backgroundImage: shimmerGradient,
    backgroundSize: '200% 100%',
  }}
>
  {/* Multiple skeleton items */}
  {Array(3).fill(null).map((_, i) => (
    <div
      key={i}
      className="h-16 bg-white/5 rounded-lg"
    />
  ))}
</motion.div>
```

**Effect:**
- Gradient moves left to right
- Creates "shimmer" illusion
- Suggests continued activity
- Repeats until content loads

---

### 9. Checkbox Check Animation
```typescript
// Trigger: User clicks checkbox
// Rules: Update state, validate if needed
// Feedback: Checkmark drawing animation
// Loop: Can check/uncheck again

const [isChecked, setIsChecked] = useState(false);

<motion.div className="relative w-6 h-6">
  {/* Background circle */}
  <motion.div
    className="absolute inset-0 rounded-md border-2"
    animate={{
      borderColor: isChecked ? 'var(--coral)' : 'rgba(255,255,255,0.2)',
      backgroundColor: isChecked ? 'rgba(255,90,95,0.1)' : 'transparent',
    }}
    transition={{ duration: 0.2 }}
  />

  {/* Checkmark */}
  <motion.svg
    viewBox="0 0 24 24"
    className="absolute inset-0 text-coral"
    animate={{
      opacity: isChecked ? 1 : 0,
    }}
    transition={{ duration: 0.15 }}
  >
    <motion.path
      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
      fill="currentColor"
      initial={{ pathLength: 0 }}
      animate={{
        pathLength: isChecked ? 1 : 0,
      }}
      transition={{
        duration: 0.3,
        ease: [0.34, 1.56, 0.64, 1],
      }}
    />
  </motion.svg>

  <input
    type="checkbox"
    checked={isChecked}
    onChange={(e) => setIsChecked(e.target.checked)}
    className="sr-only"
  />
</motion.div>
```

**Animation Sequence:**
- Click: 0ms
- Background animate: 0-200ms
- Checkmark draws: 0-300ms
- Total: 300ms

---

### 10. Scroll-Linked Animation
```typescript
// Trigger: User scrolls page
// Rules: Update element based on scroll position
// Feedback: Parallax, fade, transform
// Loop: Continues as user scrolls

import { useScroll, useTransform, motion } from 'framer-motion';

export function ScrollAnimation() {
  const { scrollY } = useScroll();

  const opacity = useTransform(scrollY, [0, 200], [0, 1]);
  const scale = useTransform(scrollY, [0, 200], [0.8, 1]);
  const y = useTransform(scrollY, [0, 400], [100, 0]);

  return (
    <motion.div
      style={{
        opacity,
        scale,
        y,
      }}
    >
      Scroll-linked content
    </motion.div>
  );
}
```

**Mapping:**
- Scroll 0-200px: Fade in 0→1
- Scroll 0-200px: Scale 0.8→1
- Scroll 0-400px: Move from 100px to 0

---

## Microinteraction Principles

### 1. Purposeful
- Every animation communicates something
- No decorative movement without reason
- Feedback should be clear and relevant
- Users understand what happened

### 2. Responsive
- Immediate feedback (< 200ms)
- Never blocks user action
- Can be interrupted if needed
- Performance never sacrificed

### 3. Subtle
- Duration 100-400ms (mostly 200-300ms)
- Easing smooth not bouncy (unless celebratory)
- Scale changes small (1.05 not 1.5)
- Don't distract from content

### 4. Consistent
- Same action = same feedback always
- Timing consistent across similar actions
- Easing curves reused
- Visual language unified

### 5. Accessible
- Can be disabled (prefers-reduced-motion)
- Alternative feedback for color-blind
- No critical info conveyed by animation alone
- Keyboard accessible

---

## Common Timings

| Action | Duration | Easing |
|--------|----------|--------|
| Hover state | 100ms | easeOut |
| Form validation | 150ms | easeOut |
| Button press | 100ms | easeOut |
| Modal entrance | 300ms | spring |
| Page transition | 400ms | easeOut |
| Scroll animation | 600ms | easeOut |
| Loading animation | 1500ms+ | linear |
| Success celebration | 400-800ms | bounce |

---

## Performance Checklist

- [ ] All animations use `transform` + `opacity`
- [ ] Duration < 500ms (except loading)
- [ ] No animation larger than viewport
- [ ] `will-change` used sparingly
- [ ] `prefers-reduced-motion` respected
- [ ] 60fps maintained (no jank)
- [ ] Animations can be interrupted
- [ ] No critical feedback animation-only

---

*Microinteractions Library V4.0*
*Subtle Feedback, Profound Impact*
