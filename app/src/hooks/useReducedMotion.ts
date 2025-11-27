'use client';

import { useEffect, useState } from 'react';

/**
 * CONSOLIDATED Motion Reduction Hook (Phase 3)
 *
 * Provides a centralized way to detect user's motion preference.
 * Replaces scattered implementations in ButtonFeedback, FormValidation, SuccessCelebration.
 *
 * Usage:
 *   const prefersReducedMotion = useReducedMotion();
 *   const variants = prefersReducedMotion ? noAnimationVariants : animationVariants;
 *
 * WCAG 2.1 Success Criterion 2.3.3: Animation from Interactions
 * Users who prefer reduced motion get instant, no-animation versions of interactions.
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check on mount
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
