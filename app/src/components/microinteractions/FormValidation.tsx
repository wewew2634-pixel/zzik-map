'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

/**
 * V7 Motion Economics: Form Validation Feedback
 * Duration: 150-200ms (provides feedback without feeling slow)
 * Easing: easeOut (responsive entry)
 * ROI: (8 cognitive + 8 engagement) / (1 performance + 0 memory) = 16.0 VERY HIGH
 *
 * P1-2 FIX: Respects prefers-reduced-motion for accessibility
 */

interface FormValidationProps {
  value: string;
  error?: string | null;
  placeholder?: string;
  label?: string;
  type?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  validator?: (value: string) => string | null;
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

export function FormValidationInput({
  value,
  error: externalError,
  placeholder = '',
  label,
  type = 'text',
  onChange,
  onBlur,
  validator,
}: FormValidationProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const error = touched ? (externalError || internalError) : null;
  const isValid = touched && value && !error;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear error on typing (progressive validation)
    if (validator) {
      const validationError = validator(newValue);
      setInternalError(validationError);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (validator) {
      const validationError = validator(value);
      setInternalError(validationError);
    }
    onBlur?.();
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-white mb-2">
          {label}
        </label>
      )}

      <motion.input
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`
          w-full px-4 py-3 rounded-lg
          border-2 transition-colors
          bg-white/5 backdrop-blur-sm
          ${error ? 'border-red-500 bg-red-500/10' : isValid ? 'border-green-500 bg-green-500/10' : 'border-white/10'}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${label}-error` : undefined}
      />

      {/* V7: Icon animation - 150ms fade + scale (respects prefers-reduced-motion) */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error-icon"
            initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.15, ease: [0, 0, 0.2, 1] }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </motion.div>
        )}
        {isValid && (
          <motion.div
            key="success-icon"
            initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.15, ease: [0, 0, 0.2, 1] }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* V7: Error message - 200ms slide + fade (respects prefers-reduced-motion) */}
      <AnimatePresence>
        {error && (
          <motion.p
            key="error-message"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: [0, 0, 0.2, 1] }}
            id={`${label}-error`}
            role="alert"
            className="text-red-400 text-sm mt-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Common validators
 */
export const validators = {
  email: (value: string): string | null => {
    if (!value) return '이메일을 입력해주세요';
    if (!value.includes('@')) return '유효한 이메일 형식이 아닙니다';
    return null;
  },

  password: (value: string): string | null => {
    if (!value) return '비밀번호를 입력해주세요';
    if (value.length < 8) return '최소 8자 이상이어야 합니다';
    return null;
  },

  required: (value: string): string | null => {
    if (!value.trim()) return '필수 항목입니다';
    return null;
  },

  minLength: (min: number) => (value: string): string | null => {
    if (value && value.length < min) return `최소 ${min}자 이상이어야 합니다`;
    return null;
  },
};
