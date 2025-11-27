/**
 * V7 State Machine: Photo Upload Flow
 *
 * State transitions:
 *   idle → validation → uploading → success → results
 *   ↓                      ↓
 *   ├─ error (retry or cancel)
 *   └─ abandoned (user leaves)
 *
 * Psychology: Clear progression through predictable states reduces cognitive load
 */

'use client';

import { useCallback, useReducer, useRef } from 'react';
import { logger } from '@/lib/logger';

type UploadState =
  | 'idle'
  | 'validation'
  | 'validating'
  | 'uploading'
  | 'processing'
  | 'success'
  | 'results'
  | 'error'
  | 'retry'
  | 'abandoned';

type ErrorType =
  | 'validation_failed'
  | 'network_error'
  | 'server_error'
  | 'timeout'
  | 'permission_denied'
  | 'file_too_large'
  | 'unknown';

interface UploadStateContext {
  currentState: UploadState;
  previousState: UploadState;
  progress: number; // 0-100
  error: ErrorType | null;
  errorMessage: string | null;
  metadata: {
    fileName?: string;
    fileSize?: number;
    uploadedBytes?: number;
    startTime?: number;
    endTime?: number;
    retryCount: number;
  };
}

type UploadAction =
  | { type: 'START_VALIDATION'; payload: { fileName: string; fileSize: number } }
  | { type: 'VALIDATION_COMPLETE' }
  | { type: 'VALIDATION_FAILED'; payload: { error: ErrorType; message: string } }
  | { type: 'START_UPLOAD' }
  | { type: 'UPLOAD_PROGRESS'; payload: number }
  | { type: 'UPLOAD_COMPLETE' }
  | { type: 'PROCESSING_START' }
  | { type: 'PROCESSING_COMPLETE' }
  | { type: 'PROCESSING_FAILED'; payload: { error: ErrorType; message: string } }
  | { type: 'UPLOAD_ERROR'; payload: { error: ErrorType; message: string } }
  | { type: 'RETRY' }
  | { type: 'RESET' }
  | { type: 'ABANDON' };

const initialState: UploadStateContext = {
  currentState: 'idle',
  previousState: 'idle',
  progress: 0,
  error: null,
  errorMessage: null,
  metadata: {
    retryCount: 0,
  },
};

/**
 * V7 State Reducer: Manages upload flow with clear state transitions
 *
 * Cognitive Impact:
 *   - User always knows: where are they in the process?
 *   - Psychology: Progress visibility → reduced anxiety
 *   - Behavior: Clear error states → better error recovery
 */
function uploadReducer(
  state: UploadStateContext,
  action: UploadAction,
): UploadStateContext {
  const previousState = state.currentState;

  switch (action.type) {
    case 'START_VALIDATION':
      return {
        ...state,
        currentState: 'validating',
        previousState,
        progress: 10,
        error: null,
        errorMessage: null,
        metadata: {
          ...state.metadata,
          fileName: action.payload.fileName,
          fileSize: action.payload.fileSize,
          startTime: Date.now(),
        },
      };

    case 'VALIDATION_COMPLETE':
      return {
        ...state,
        currentState: 'validation',
        previousState,
        progress: 20,
      };

    case 'VALIDATION_FAILED':
      return {
        ...state,
        currentState: 'error',
        previousState,
        error: action.payload.error,
        errorMessage: action.payload.message,
        progress: 0,
      };

    case 'START_UPLOAD':
      return {
        ...state,
        currentState: 'uploading',
        previousState,
        progress: 30,
        error: null,
        errorMessage: null,
      };

    case 'UPLOAD_PROGRESS':
      return {
        ...state,
        progress: Math.min(90, 30 + (action.payload * 0.6)), // 30-90%
        metadata: {
          ...state.metadata,
          uploadedBytes: action.payload,
        },
      };

    case 'UPLOAD_COMPLETE':
      return {
        ...state,
        currentState: 'processing',
        previousState,
        progress: 90,
      };

    case 'PROCESSING_START':
      return {
        ...state,
        currentState: 'processing',
        previousState,
        progress: 90,
      };

    case 'PROCESSING_COMPLETE':
      return {
        ...state,
        currentState: 'success',
        previousState,
        progress: 100,
        metadata: {
          ...state.metadata,
          endTime: Date.now(),
        },
      };

    case 'PROCESSING_FAILED':
      return {
        ...state,
        currentState: 'error',
        previousState,
        error: action.payload.error,
        errorMessage: action.payload.message,
        progress: 0,
      };

    case 'UPLOAD_ERROR':
      return {
        ...state,
        currentState: 'error',
        previousState,
        error: action.payload.error,
        errorMessage: action.payload.message,
        progress: 0,
      };

    case 'RETRY':
      return {
        ...state,
        currentState: 'retry',
        previousState,
        progress: 0,
        error: null,
        errorMessage: null,
        metadata: {
          ...state.metadata,
          retryCount: state.metadata.retryCount + 1,
        },
      };

    case 'RESET':
      return initialState;

    case 'ABANDON':
      return {
        ...state,
        currentState: 'abandoned',
        previousState,
      };

    default:
      return state;
  }
}

export interface UseUploadStateMachineReturn {
  state: UploadStateContext;
  startValidation: (fileName: string, fileSize: number) => void;
  completeValidation: () => void;
  failValidation: (error: ErrorType, message: string) => void;
  startUpload: () => void;
  updateProgress: (percentage: number) => void;
  completeUpload: () => void;
  startProcessing: () => void;
  completeProcessing: () => void;
  failProcessing: (error: ErrorType, message: string) => void;
  failUpload: (error: ErrorType, message: string) => void;
  retry: () => void;
  reset: () => void;
  abandon: () => void;
  // Derived state helpers
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  canRetry: boolean;
  elapsedTime: number;
}

/**
 * Hook: useUploadStateMachine
 * Manages photo upload flow with V7 state machine
 *
 * Usage:
 *   const upload = useUploadStateMachine();
 *
 *   // Start validation
 *   upload.startValidation(file.name, file.size);
 *
 *   // Handle validation errors
 *   if (error) {
 *     upload.failValidation('file_too_large', 'File must be under 10MB');
 *   }
 *
 * Benefits:
 *   1. Type-safe state transitions (impossible states prevented)
 *   2. Clear lifecycle for analytics tracking
 *   3. Automatic error handling paths
 *   4. Built-in progress tracking
 */
export function useUploadStateMachine(): UseUploadStateMachineReturn {
  const [state, dispatch] = useReducer(uploadReducer, initialState);
  const stateHistoryRef = useRef<UploadState[]>(['idle']);

  // Track state transitions for analytics
  const trackStateChange = useCallback((newState: UploadState) => {
    stateHistoryRef.current.push(newState);

    // Log state transition for debugging
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Upload state transition', {
        from: state.currentState,
        to: newState,
        progress: state.progress,
      });
    }
  }, [state.currentState, state.progress]);

  const startValidation = useCallback(
    (fileName: string, fileSize: number) => {
      dispatch({
        type: 'START_VALIDATION',
        payload: { fileName, fileSize },
      });
      trackStateChange('validating');
    },
    [trackStateChange],
  );

  const completeValidation = useCallback(() => {
    dispatch({ type: 'VALIDATION_COMPLETE' });
    trackStateChange('validation');
  }, [trackStateChange]);

  const failValidation = useCallback(
    (error: ErrorType, message: string) => {
      dispatch({
        type: 'VALIDATION_FAILED',
        payload: { error, message },
      });
      trackStateChange('error');
    },
    [trackStateChange],
  );

  const startUpload = useCallback(() => {
    dispatch({ type: 'START_UPLOAD' });
    trackStateChange('uploading');
  }, [trackStateChange]);

  const updateProgress = useCallback((percentage: number) => {
    dispatch({
      type: 'UPLOAD_PROGRESS',
      payload: percentage,
    });
  }, []);

  const completeUpload = useCallback(() => {
    dispatch({ type: 'UPLOAD_COMPLETE' });
    trackStateChange('processing');
  }, [trackStateChange]);

  const startProcessing = useCallback(() => {
    dispatch({ type: 'PROCESSING_START' });
    trackStateChange('processing');
  }, [trackStateChange]);

  const completeProcessing = useCallback(() => {
    dispatch({ type: 'PROCESSING_COMPLETE' });
    trackStateChange('success');
  }, [trackStateChange]);

  const failProcessing = useCallback(
    (error: ErrorType, message: string) => {
      dispatch({
        type: 'PROCESSING_FAILED',
        payload: { error, message },
      });
      trackStateChange('error');
    },
    [trackStateChange],
  );

  const failUpload = useCallback(
    (error: ErrorType, message: string) => {
      dispatch({
        type: 'UPLOAD_ERROR',
        payload: { error, message },
      });
      trackStateChange('error');
    },
    [trackStateChange],
  );

  /**
   * P0 CRITICAL FIX #5: Race Condition Fix
   *
   * BEFORE: Multiple concurrent retries could corrupt state
   * AFTER: Mutex-like pattern prevents concurrent retries
   *
   * Security: Prevents state corruption from concurrent operations
   */
  const retryLockRef = useRef<boolean>(false);

  const retry = useCallback(() => {
    // Prevent concurrent retries
    if (retryLockRef.current) {
      logger.warn('Retry already in progress, ignoring duplicate call');
      return;
    }

    // Acquire lock
    retryLockRef.current = true;

    try {
      dispatch({ type: 'RETRY' });
      trackStateChange('retry');

      // Schedule upload with lock release
      setTimeout(() => {
        try {
          dispatch({ type: 'START_UPLOAD' });
          trackStateChange('uploading');
        } finally {
          // Release lock after state transition
          retryLockRef.current = false;
        }
      }, 500); // 500ms delay for UX feedback
    } catch (error) {
      // Release lock on error
      retryLockRef.current = false;
      throw error;
    }
  }, [trackStateChange]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
    stateHistoryRef.current = ['idle'];
    trackStateChange('idle');
  }, [trackStateChange]);

  const abandon = useCallback(() => {
    dispatch({ type: 'ABANDON' });
    trackStateChange('abandoned');
  }, [trackStateChange]);

  // Derived state helpers
  const isLoading = state.currentState === 'validating' ||
                    state.currentState === 'uploading' ||
                    state.currentState === 'processing';

  const isError = state.currentState === 'error';

  const isSuccess = state.currentState === 'success';

  const canRetry = isError && state.metadata.retryCount < 3;

  const elapsedTime = state.metadata.startTime
    ? (state.metadata.endTime || Date.now()) - state.metadata.startTime
    : 0;

  return {
    state,
    startValidation,
    completeValidation,
    failValidation,
    startUpload,
    updateProgress,
    completeUpload,
    startProcessing,
    completeProcessing,
    failProcessing,
    failUpload,
    retry,
    reset,
    abandon,
    isLoading,
    isError,
    isSuccess,
    canRetry,
    elapsedTime,
  };
}

/**
 * Analytics Helper: Extract metrics from state history
 * Used for A/B testing and performance analysis
 */
export function extractUploadMetrics(
  stateHistory: UploadState[],
  totalTime: number,
) {
  return {
    totalStates: stateHistory.length,
    hadError: stateHistory.includes('error'),
    hadRetry: stateHistory.includes('retry'),
    completed: stateHistory[stateHistory.length - 1] === 'success',
    timeMs: totalTime,
  };
}
