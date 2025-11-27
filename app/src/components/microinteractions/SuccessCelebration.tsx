'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

/**
 * V7 Motion Economics: Success Celebration
 * Duration: 600ms (celebratory, memorable moment)
 * Easing: bounce [0.34, 1.56, 0.64, 1] (playful, energetic)
 * ROI: (9 cognitive + 9 engagement) / (2 performance + 1 memory) = 6.0 MEDIUM-HIGH
 *
 * Psychology: Reward reinforcement for habit formation
 * Used when: User completes important action (upload, save, follow)
 *
 * P1-2 FIX: Respects prefers-reduced-motion for accessibility
 */

interface SuccessCelebrationProps {
  show: boolean;
  title: string;
  message?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  autoHideDuration?: number; // ms, 0 = no auto hide
}

function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
}

export function SuccessCelebration({
  show,
  title,
  message,
  icon,
  actionLabel,
  onAction,
  autoHideDuration: _autoHideDuration = 3000,
}: SuccessCelebrationProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="success-celebration"
          initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0, y: -20 }}
          transition={{
            duration: prefersReducedMotion ? 0.2 : 0.6,
            ease: prefersReducedMotion ? [0, 0, 0.2, 1] : [0.34, 1.56, 0.64, 1],
          }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/50 pointer-events-auto"
            onClick={onAction}
          />

          {/* Content */}
          <motion.div
            className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md mx-4 pointer-events-auto"
          >
            {/* Icon with bounce */}
            {icon && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 0.6,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                className="text-6xl mb-4 text-center"
              >
                {icon}
              </motion.div>
            )}

            {/* Title */}
            <h3 className="text-2xl font-bold text-white text-center mb-2">
              {title}
            </h3>

            {/* Message */}
            {message && (
              <p className="text-zinc-400 text-center mb-6">
                {message}
              </p>
            )}

            {/* Action Button */}
            {actionLabel && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAction}
                className="w-full px-6 py-3 bg-[var(--zzik-coral)] text-white font-semibold rounded-lg hover:bg-[var(--zzik-coral)]/90 transition-colors"
              >
                {actionLabel}
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Inline Success Message (compact version)
 */
interface InlineSuccessProps {
  show: boolean;
  message: string;
  autoDismiss?: number; // ms
}

export function InlineSuccess({
  show,
  message,
  autoDismiss: _autoDismiss = 4000,
}: InlineSuccessProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="inline-success"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
          className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-300"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Toast-style Success (bottom-right, stacked)
 */
interface SuccessToastProps {
  show: boolean;
  message: string;
  duration?: number;
  onDismiss?: () => void;
}

export function SuccessToast({
  show,
  message,
  duration: _duration = 4000,
  onDismiss,
}: SuccessToastProps) {
  // Auto-dismiss after duration
  // Note: In real app, this would be handled by a toast manager
  // For now, just show/hide based on prop

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="success-toast"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 px-6 py-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-300 flex items-center gap-3 z-50"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{message}</span>
          <button
            onClick={onDismiss}
            className="ml-2 text-green-400 hover:text-green-300"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
