'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOTION_TOKENS } from '@/lib/microinteractions';
import type { FeedbackMessage } from '@/lib/microinteractions';

/**
 * Unified Feedback Provider (Phase 6)
 *
 * Global feedback context for:
 * - Toast notifications
 * - Modal alerts
 * - Inline messages
 * - Loading states
 *
 * Manages feedback stack, animations, and dismissal
 */

interface FeedbackMessageWithId extends FeedbackMessage {
  id: string;
}

export interface FeedbackContextType {
  queue: FeedbackMessageWithId[];
  current: FeedbackMessageWithId | null;
  show: (feedback: FeedbackMessage) => void;
  dismiss: () => void;
  clear: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function useFeedbackContext(): FeedbackContextType {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedbackContext must be used within FeedbackProvider');
  }
  return context;
}

interface FeedbackProviderProps {
  children: ReactNode;
  maxQueue?: number; // Default: 3 concurrent feedbacks
}

export function FeedbackProvider({
  children,
  maxQueue = 3,
}: FeedbackProviderProps) {
  const [queue, setQueue] = useState<FeedbackMessageWithId[]>([]);
  const dismissTimeoutRef = React.useRef<NodeJS.Timeout>();

  const current = queue[0] || null;

  const show = useCallback((feedback: FeedbackMessage) => {
    setQueue((prev) => {
      const updated = [...prev, { ...feedback, id: Date.now().toString() } as FeedbackMessageWithId];
      return updated.slice(-maxQueue); // Keep only last N messages
    });
  }, [maxQueue]);

  const dismiss = useCallback(() => {
    setQueue((prev) => prev.slice(1));
  }, []);

  const clear = useCallback(() => {
    setQueue([]);
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
    }
  }, []);

  // Auto-dismiss feedback based on autoDismiss duration
  React.useEffect(() => {
    if (!current) return;

    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
    }

    if (current.autoDismiss && current.autoDismiss > 0) {
      dismissTimeoutRef.current = setTimeout(() => {
        dismiss();
      }, current.autoDismiss);
    }

    return () => {
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
      }
    };
  }, [current, dismiss]);

  return (
    <FeedbackContext.Provider value={{ queue, current, show, dismiss, clear }}>
      {children}
      <FeedbackRenderer />
    </FeedbackContext.Provider>
  );
}

/**
 * Feedback Renderer Component
 * Displays current feedback with animations
 */
function FeedbackRenderer() {
  const { current } = useFeedbackContext();

  if (!current) return null;

  return (
    <AnimatePresence mode="wait">
      <FeedbackDisplay key={current.id} feedback={current} />
    </AnimatePresence>
  );
}

interface FeedbackDisplayProps {
  feedback: FeedbackMessageWithId;
}

function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  const { dismiss } = useFeedbackContext();

  // Color schemes by type
  const colorSchemes = {
    success: {
      bg: 'bg-green-500/20',
      border: 'border-green-500/50',
      text: 'text-green-300',
      icon: '✓',
    },
    error: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      text: 'text-red-300',
      icon: '✕',
    },
    warning: {
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/50',
      text: 'text-amber-300',
      icon: '!',
    },
    info: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/50',
      text: 'text-blue-300',
      icon: 'ℹ',
    },
    loading: {
      bg: 'bg-cyan-500/20',
      border: 'border-cyan-500/50',
      text: 'text-cyan-300',
      icon: '⟳',
    },
  };

  const colors = colorSchemes[feedback.type];

  // Position based on feedback config
  const positionClasses = {
    top: 'top-4',
    bottom: 'bottom-4',
    center: 'top-1/2 -translate-y-1/2',
    inline: 'inline',
  };

  const position = feedback.position || (feedback.type === 'error' ? 'top' : 'bottom');

  return (
    <motion.div
      initial={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
      transition={{
        duration: MOTION_TOKENS.duration.normal / 1000,
        ease: MOTION_TOKENS.easing.easeOut,
      }}
      className={`fixed left-4 right-4 ${positionClasses[position]} z-50 flex items-start gap-3 p-4 rounded-lg border ${colors.bg} ${colors.border} ${colors.text} max-w-md mx-auto`}
    >
      {/* Icon */}
      <motion.div
        animate={feedback.type === 'loading' ? { rotate: 360 } : {}}
        transition={feedback.type === 'loading' ? { repeat: Infinity, duration: 1 } : {}}
        className="flex-shrink-0 text-lg"
      >
        {feedback.icon || colors.icon}
      </motion.div>

      {/* Content */}
      <div className="flex-1">
        {feedback.title && (
          <h3 className="font-semibold text-sm">{feedback.title}</h3>
        )}
        <p className="text-sm">{feedback.message}</p>
      </div>

      {/* Action Button */}
      {feedback.action && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={feedback.action.callback}
          className="flex-shrink-0 text-sm font-semibold hover:opacity-80 transition-opacity"
        >
          {feedback.action.label}
        </motion.button>
      )}

      {/* Close Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={dismiss}
        className="flex-shrink-0 text-lg opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        ✕
      </motion.button>
    </motion.div>
  );
}
