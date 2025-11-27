# Accessibility Audit Skill V2
## WCAG 2.1 AA/AAA Compliance

## When to Use
Invoke this skill when:
- Auditing accessibility compliance
- Fixing a11y issues
- Adding ARIA attributes
- Testing keyboard navigation
- Ensuring screen reader compatibility

---

## WCAG 2.1 Levels

| Level | Description | Target |
|-------|-------------|--------|
| A | Minimum accessibility | Required |
| AA | Standard compliance | **Target** |
| AAA | Enhanced accessibility | Recommended for critical flows |

---

## Color Contrast Requirements

### Contrast Ratios
```yaml
Normal Text (< 18pt or < 14pt bold):
  AA: 4.5:1
  AAA: 7:1

Large Text (≥ 18pt or ≥ 14pt bold):
  AA: 3:1
  AAA: 4.5:1

UI Components & Graphics:
  AA: 3:1
```

### ZZIK Color System Contrast
```css
/* On dark background (#0A1628) */
--text-zinc-200: 12.1:1 ✓ AAA
--text-zinc-300: 8.2:1  ✓ AAA
--text-zinc-400: 5.7:1  ✓ AA
--text-zinc-500: 4.3:1  ✓ AA (large text only)
--text-zinc-600: 3.3:1  ✗ FAIL

/* Brand colors */
--zzik-coral: 4.8:1    ✓ AA
--electric-cyan: 9.2:1 ✓ AAA
```

### Checking Contrast
```typescript
// Using color.js
import Color from 'colorjs.io';

function getContrastRatio(fg: string, bg: string): number {
  const foreground = new Color(fg);
  const background = new Color(bg);
  return foreground.contrast(background, 'WCAG21');
}

// Example
getContrastRatio('#A1A1AA', '#0A1628'); // 5.7:1
```

---

## Keyboard Navigation

### Focus Management
```tsx
// Visible focus indicator
<button className="
  focus:outline-none
  focus-visible:ring-2
  focus-visible:ring-[var(--electric-cyan)]
  focus-visible:ring-offset-2
  focus-visible:ring-offset-[var(--deep-space)]
">
  Click me
</button>

// Skip link
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:text-black"
>
  Skip to main content
</a>
```

### Tab Order
```tsx
// Natural tab order follows DOM order
<nav>
  <a href="/">Home</a>          {/* Tab 1 */}
  <a href="/journey">Journey</a> {/* Tab 2 */}
  <a href="/explore">Explore</a> {/* Tab 3 */}
</nav>

// Explicit tab order (use sparingly)
<button tabIndex={1}>First</button>
<button tabIndex={2}>Second</button>

// Remove from tab order
<div tabIndex={-1}>Not focusable via Tab</div>
```

### Focus Trap for Modals
```tsx
import { Dialog } from '@headlessui/react';

// HeadlessUI handles focus trap automatically
<Dialog open={isOpen} onClose={setIsOpen}>
  <Dialog.Panel>
    {/* Focus is trapped inside */}
    <button>Close</button>
    <input type="text" />
  </Dialog.Panel>
</Dialog>
```

### Keyboard Shortcuts
```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Escape to close
    if (e.key === 'Escape') {
      closeModal();
    }

    // Arrow keys for navigation
    if (e.key === 'ArrowDown') {
      focusNextItem();
    }
    if (e.key === 'ArrowUp') {
      focusPrevItem();
    }

    // Enter/Space to select
    if (e.key === 'Enter' || e.key === ' ') {
      selectCurrentItem();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## ARIA Attributes

### Roles
```tsx
// Landmark roles
<header role="banner">...</header>
<nav role="navigation">...</nav>
<main role="main">...</main>
<footer role="contentinfo">...</footer>

// Widget roles
<button role="button">Click</button>
<div role="dialog">Modal content</div>
<ul role="listbox">...</ul>
<li role="option">Item</li>
```

### States and Properties
```tsx
// Expanded/collapsed
<button
  aria-expanded={isOpen}
  aria-controls="menu-content"
>
  Menu
</button>
<div id="menu-content" hidden={!isOpen}>
  Menu items
</div>

// Selected state
<li
  role="option"
  aria-selected={isSelected}
>
  Option
</li>

// Disabled state
<button
  aria-disabled={isDisabled}
  disabled={isDisabled}
>
  Submit
</button>

// Loading state
<button aria-busy={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</button>
```

### Labels and Descriptions
```tsx
// Accessible name
<button aria-label="Close dialog">
  <XIcon />
</button>

// Described by
<input
  aria-describedby="password-help"
  type="password"
/>
<p id="password-help">
  Password must be at least 8 characters
</p>

// Labelled by
<div
  role="dialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Confirm Action</h2>
  <p id="dialog-description">Are you sure?</p>
</div>
```

### Live Regions
```tsx
// Polite announcements (waits for silence)
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Assertive announcements (interrupts)
<div aria-live="assertive" role="alert">
  {errorMessage}
</div>

// Status updates
<div role="status" aria-live="polite">
  {`${items.length} results found`}
</div>
```

---

## Screen Reader Testing

### VoiceOver (Mac)
```bash
# Enable: Cmd + F5
# Navigate: VO + Arrow keys
# Activate: VO + Space
# Rotor: VO + U
```

### NVDA (Windows)
```bash
# Navigate: Arrow keys
# Forms mode: NVDA + Space
# Elements list: NVDA + F7
```

### Common Issues
```tsx
// Problem: Image without alt text
<img src="/photo.jpg" />

// Solution: Add descriptive alt
<img src="/photo.jpg" alt="Sunset over Seoul skyline" />

// Decorative image
<img src="/decoration.svg" alt="" role="presentation" />

// Problem: Unlabeled form control
<input type="email" />

// Solution: Add label
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Or use aria-label
<input type="email" aria-label="Email address" />
```

---

## Touch Accessibility

### Touch Target Size
```css
/* Minimum 44x44px */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}

/* For coarse pointer (touch) */
@media (pointer: coarse) {
  .touch-target {
    min-height: 48px;
    min-width: 48px;
  }
}
```

### Touch Actions
```css
/* Prevent accidental zoom on double-tap */
.button {
  touch-action: manipulation;
}

/* Allow scroll only */
.scrollable {
  touch-action: pan-y;
}
```

---

## Reduced Motion

### Respect User Preference
```css
/* Remove animations */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Framer Motion
```tsx
import { useReducedMotion } from 'framer-motion';

function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={prefersReducedMotion ? {} : { x: 100 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
    />
  );
}
```

---

## Form Accessibility

### Error Handling
```tsx
<Field>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    aria-invalid={hasError}
    aria-describedby={hasError ? 'email-error' : undefined}
  />
  {hasError && (
    <p id="email-error" className="text-red-500" role="alert">
      Please enter a valid email address
    </p>
  )}
</Field>
```

### Required Fields
```tsx
<Label htmlFor="name">
  Name <span aria-hidden="true">*</span>
  <span className="sr-only">(required)</span>
</Label>
<Input id="name" required aria-required="true" />
```

### Autocomplete
```tsx
<Input
  type="email"
  autoComplete="email"
  aria-label="Email address"
/>

<Input
  type="tel"
  autoComplete="tel"
  aria-label="Phone number"
/>
```

---

## Testing Tools

### Automated Testing
```typescript
// axe-core with Playwright
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('home page has no violations', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
```

### Lighthouse Accessibility
```bash
lighthouse http://localhost:3000 --only-categories=accessibility --output=json
```

### Manual Testing Checklist
```markdown
## Keyboard Navigation
- [ ] All interactive elements focusable
- [ ] Focus order logical
- [ ] Focus visible
- [ ] No keyboard traps
- [ ] Modals trap focus correctly
- [ ] Escape closes modals

## Screen Reader
- [ ] All images have alt text
- [ ] Form controls have labels
- [ ] Headings in logical order
- [ ] Links have descriptive text
- [ ] Error messages announced

## Visual
- [ ] Color contrast passes
- [ ] Text readable at 200% zoom
- [ ] No information conveyed by color alone
- [ ] Focus indicators visible
```

---

## Common Fixes Quick Reference

### Issue: Low contrast text
```css
/* Before */
.muted { color: #52525B; } /* 3.3:1 - FAIL */

/* After */
.muted { color: #A1A1AA; } /* 5.7:1 - PASS */
```

### Issue: Missing form labels
```tsx
/* Before */
<input type="search" placeholder="Search..." />

/* After */
<label className="sr-only" htmlFor="search">Search</label>
<input id="search" type="search" placeholder="Search..." />
```

### Issue: Non-descriptive links
```tsx
/* Before */
<a href="/details">Click here</a>

/* After */
<a href="/details">View journey details</a>
```

### Issue: Missing skip link
```tsx
/* Add at top of page */
<a href="#main" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

<main id="main" tabIndex={-1}>
  Content
</main>
```

---

*Accessibility Audit Skill V2.0*
*WCAG 2.1 AA/AAA Compliance*
