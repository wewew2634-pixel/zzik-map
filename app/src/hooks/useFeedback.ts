'use client';

import { useState, useCallback, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';
import type {
  FeedbackMessage,
  FeedbackType,
  MotionIntensity,
  MicrointeractionConfig,
} from '@/lib/microinteractions';
import { MICROINTERACTION_PRESETS, getMotionConfig } from '@/lib/microinteractions';

/**
 * Unified Feedback Hook (Phase 6)
 *
 * Provides centralized feedback system for:
 * - Success/error/warning/info messages
 * - Loading states
 * - Form validation
 * - Button feedback
 * - Page transitions
 * - Gesture feedback
 *
 * Automatically respects prefers-reduced-motion
 * Manages feedback queue and dismissal
 */

export interface UseFeedbackReturn {
  // Feedback triggers
  success: (message: string | FeedbackMessage) => void;
  error: (message: string | FeedbackMessage) => void;
  warning: (message: string | FeedbackMessage) => void;
  info: (message: string | FeedbackMessage) => void;
  show: (feedback: FeedbackMessage) => void;

  // Loading states
  setLoading: (isLoading: boolean, message?: string) => void;
  isLoading: boolean;

  // State accessors
  feedback: FeedbackMessage | null;
  isVisible: boolean;
  dismiss: () => void;
  clear: () => void;

  // Motion configuration
  getConfig: (type: FeedbackType, intensity?: MotionIntensity) => MicrointeractionConfig;
  respectsReducedMotion: boolean;
}

export function useFeedback(): UseFeedbackReturn {
  const prefersReducedMotion = useReducedMotion();
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [isLoading, setIsLoadingState] = useState(false);
  const dismissTimeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Normalize string or object feedback to FeedbackMessage
   */
  const normalizeFeedback = (
    message: string | FeedbackMessage,
    type: FeedbackType
  ): FeedbackMessage => {
    if (typeof message === 'string') {
      return {
        type,
        message,
        autoDismiss: type === 'success' ? 3000 : type === 'error' ? 4000 : 3000,
      };
    }
    return {
      ...message,
      type,
      autoDismiss: message.autoDismiss !== undefined ? message.autoDismiss : 3000,
    };
  };

  /**
   * Show feedback with optional auto-dismiss
   */
  const show = useCallback(
    (feedbackMessage: FeedbackMessage) => {
      // Clear existing timeout
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
      }

      // Set new feedback
      setFeedback(feedbackMessage);

      // Auto-dismiss if configured
      if (feedbackMessage.autoDismiss && feedbackMessage.autoDismiss > 0) {
        dismissTimeoutRef.current = setTimeout(() => {
          setFeedback(null);
        }, feedbackMessage.autoDismiss);
      }
    },
    []
  );

  /**
   * Dismiss feedback immediately
   */
  const dismiss = useCallback(() => {
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
    }
    setFeedback(null);
  }, []);

  /**
   * Clear all feedback
   */
  const clear = useCallback(() => {
    dismiss();
    setIsLoadingState(false);
  }, [dismiss]);

  /**
   * Success feedback
   */
  const success = useCallback(
    (message: string | FeedbackMessage) => {
      show(normalizeFeedback(message, 'success'));
    },
    [show]
  );

  /**
   * Error feedback
   */
  const error = useCallback(
    (message: string | FeedbackMessage) => {
      show(normalizeFeedback(message, 'error'));
    },
    [show]
  );

  /**
   * Warning feedback
   */
  const warning = useCallback(
    (message: string | FeedbackMessage) => {
      show(normalizeFeedback(message, 'warning'));
    },
    [show]
  );

  /**
   * Info feedback
   */
  const info = useCallback(
    (message: string | FeedbackMessage) => {
      show(normalizeFeedback(message, 'info'));
    },
    [show]
  );

  /**
   * Loading state
   */
  const setLoading = useCallback((isLoading: boolean, message?: string) => {
    setIsLoadingState(isLoading);
    if (isLoading && message) {
      show({
        type: 'loading',
        message,
        autoDismiss: 0, // Don't auto-dismiss loading
      });
    } else if (!isLoading) {
      dismiss();
    }
  }, [show, dismiss]);

  /**
   * Get motion configuration
   */
  const getConfig = useCallback(
    (type: FeedbackType, intensity?: MotionIntensity): MicrointeractionConfig => {
      if (prefersReducedMotion) {
        return getMotionConfig(type, 'reduced');
      }
      return getMotionConfig(type, intensity);
    },
    [prefersReducedMotion]
  );

  return {
    // Feedback triggers
    success,
    error,
    warning,
    info,
    show,

    // Loading states
    setLoading,
    isLoading,

    // State accessors
    feedback,
    isVisible: feedback !== null,
    dismiss,
    clear,

    // Motion configuration
    getConfig,
    respectsReducedMotion: prefersReducedMotion,
  };
}
