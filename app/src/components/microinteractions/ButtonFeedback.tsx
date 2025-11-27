'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useReducedMotion } from '@/hooks';

/**
 * V7 Motion Economics: Button Press Feedback
 * Duration: 100ms (snappy, responsive feel)
 * Easing: easeOut (immediate response)
 * ROI: (8 cognitive + 7 engagement) / (1 performance + 0.05 memory) = 14.2 HIGH
 *
 * P1-2 FIX: Respects prefers-reduced-motion for accessibility
 * Phase 3: Uses consolidated useReducedMotion hook
 */

interface ButtonFeedbackProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

export function ButtonFeedback({
  children,
  onClick,
  className = '',
  variant = 'primary',
  disabled = false,
  type = 'button',
  ariaLabel,
}: ButtonFeedbackProps) {
  const prefersReducedMotion = useReducedMotion();

  const baseStyles = 'relative inline-flex items-center justify-center font-semibold rounded-lg transition-colors';

  const variantStyles = {
    primary: 'px-6 py-3 bg-[var(--zzik-coral)] text-white hover:bg-[var(--zzik-coral)]/90',
    secondary: 'px-6 py-3 bg-white/10 text-white hover:bg-white/20 border border-white/20',
    ghost: 'px-6 py-3 text-white hover:bg-white/5',
  };

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`}
      whileHover={!disabled && !prefersReducedMotion ? { scale: 1.02 } : {}}
      whileTap={!disabled && !prefersReducedMotion ? { scale: 0.95 } : {}}
      transition={{
        duration: 0.1,
        ease: [0, 0, 0.2, 1], // easeOut
      }}
    >
      {children}
    </motion.button>
  );
}

/**
 * Enhanced Button with Loading State
 */
interface ButtonWithLoadingProps extends ButtonFeedbackProps {
  isLoading?: boolean;
  loadingText?: string;
}

export function ButtonWithLoading({
  children,
  isLoading = false,
  loadingText = 'Loading...',
  disabled = false,
  ...props
}: ButtonWithLoadingProps) {
  return (
    <ButtonFeedback
      {...props}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="inline-block mr-2"
        >
          ⟳
        </motion.div>
      ) : null}
      {isLoading ? loadingText : children}
    </ButtonFeedback>
  );
}
