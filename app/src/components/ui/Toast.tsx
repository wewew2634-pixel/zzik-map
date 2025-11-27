'use client';

/**
 * ZZIK MAP - Toast Notification Component
 * V3: Animated toast system with Zustand
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore, type Toast, type ToastType } from '@/stores/app';

const toastStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: '✕',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: '⚠',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'ℹ',
  },
};

const iconColors: Record<ToastType, string> = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
};

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const styles = toastStyles[toast.type];
  const iconColor = iconColors[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-3 p-4 rounded-xl border ${styles.bg} ${styles.border} backdrop-blur-sm shadow-lg max-w-sm`}
    >
      {/* Icon */}
      <span className={`text-lg ${iconColor} flex-shrink-0`}>{styles.icon}</span>

      {/* Content */}
      <div className="flex-grow min-w-0">
        <p className="text-white font-medium text-sm">{toast.title}</p>
        {toast.message && (
          <p className="text-zinc-400 text-xs mt-0.5">{toast.message}</p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="flex-shrink-0 text-zinc-500 hover:text-white transition-colors"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onClose={() => removeToast(toast.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for using toast
export function useToast() {
  const { addToast, removeToast, clearToasts } = useToastStore();

  return {
    toast: {
      success: (title: string, message?: string) =>
        addToast({ type: 'success', title, message }),
      error: (title: string, message?: string) =>
        addToast({ type: 'error', title, message }),
      warning: (title: string, message?: string) =>
        addToast({ type: 'warning', title, message }),
      info: (title: string, message?: string) =>
        addToast({ type: 'info', title, message }),
    },
    removeToast,
    clearToasts,
  };
}
