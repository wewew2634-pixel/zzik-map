/**
 * V7 Upload Progress Flow
 * Integrates State Machine + Phase 3 Microinteractions
 *
 * State transitions with animations:
 *   idle → validating (FormValidation feedback)
 *        → uploading (LoadingShimmer progress)
 *        → processing (LoadingSpinner)
 *        → success (SuccessCelebration)
 *        → results (PageTransition fade-in)
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useUploadStateMachine } from '@/hooks/useUploadStateMachine';
import type { UseUploadStateMachineReturn } from '@/hooks/useUploadStateMachine';
import { PageTransition } from '@/components/microinteractions/PageTransition';
import { SuccessCelebration } from '@/components/microinteractions/SuccessCelebration';
import { ButtonFeedback } from '@/components/microinteractions/ButtonFeedback';
import { ReactNode } from 'react';

interface UploadProgressFlowProps {
  onSuccess: (result: unknown) => void;
  onError?: (error: unknown) => void;
  children?: ReactNode;
}

/**
 * Progress bar component with state-based coloring
 */
function ProgressBar({
  progress,
  currentState,
}: {
  progress: number;
  currentState: string;
}) {
  const colorMap = {
    validating: 'from-yellow-500 to-yellow-600',
    uploading: 'from-blue-500 to-blue-600',
    processing: 'from-cyan-500 to-cyan-600',
    success: 'from-green-500 to-green-600',
    error: 'from-red-500 to-red-600',
  };

  const color = colorMap[currentState as keyof typeof colorMap] || 'from-zinc-500 to-zinc-600';

  return (
    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
      <motion.div
        className={`h-full bg-gradient-to-r ${color}`}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      />
    </div>
  );
}

/**
 * State label with dynamic messaging
 */
function StateLabel({
  currentState,
  errorMessage,
}: {
  currentState: string;
  errorMessage: string | null;
}) {

  const labels = {
    idle: 'Ready to upload',
    validating: 'Validating file...',
    validation: 'File validated',
    uploading: 'Uploading photo...',
    processing: 'Processing recommendations...',
    success: 'Upload complete!',
    error: errorMessage || 'Upload failed',
    retry: 'Retrying...',
    abandoned: 'Upload cancelled',
  };

  return (
    <motion.p
      key={currentState}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`text-sm font-medium ${
        currentState === 'error' ? 'text-red-400' :
        currentState === 'success' ? 'text-green-400' :
        'text-zinc-400'
      }`}
    >
      {labels[currentState as keyof typeof labels]}
    </motion.p>
  );
}

/**
 * Error recovery UI
 */
function ErrorRecovery({
  upload,
}: {
  upload: UseUploadStateMachineReturn;
}) {

  return (
    <PageTransition variant="slideUp">
      <div className="space-y-4">
        <p className="text-red-400 text-sm font-medium">
          {upload.state.errorMessage}
        </p>

        <div className="flex gap-3">
          {upload.canRetry && (
            <ButtonFeedback
              variant="primary"
              onClick={upload.retry}
              className="flex-1"
            >
              Retry
            </ButtonFeedback>
          )}
          <ButtonFeedback
            variant="ghost"
            onClick={upload.reset}
            className="flex-1"
          >
            Cancel
          </ButtonFeedback>
        </div>

        {!upload.canRetry && (
          <p className="text-zinc-500 text-xs">
            Maximum retries exceeded. Please try again later.
          </p>
        )}
      </div>
    </PageTransition>
  );
}

/**
 * Main Upload Progress Flow Component
 */
export function UploadProgressFlow({
  onSuccess,
  onError: _onError,
  children,
}: UploadProgressFlowProps) {
  const upload = useUploadStateMachine();

  return (
    <div className="space-y-6">
      {/* State-based content rendering */}
      <AnimatePresence mode="wait">
        {upload.state.currentState === 'idle' && children}

        {upload.state.currentState === 'validating' && (
          <PageTransition key="validating" variant="slideUp">
            <div className="space-y-3">
              <StateLabel
                currentState={upload.state.currentState}
                errorMessage={upload.state.errorMessage}
              />
              <ProgressBar
                progress={upload.state.progress}
                currentState={upload.state.currentState}
              />
            </div>
          </PageTransition>
        )}

        {upload.state.currentState === 'uploading' && (
          <PageTransition key="uploading" variant="slideUp">
            <div className="space-y-4">
              <div>
                <StateLabel
                  currentState={upload.state.currentState}
                  errorMessage={upload.state.errorMessage}
                />
              </div>

              <ProgressBar
                progress={upload.state.progress}
                currentState={upload.state.currentState}
              />

              {/* Show file info during upload */}
              {upload.state.metadata.fileName && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-zinc-500"
                >
                  <p>{upload.state.metadata.fileName}</p>
                  {upload.state.metadata.fileSize && (
                    <p>
                      {(upload.state.metadata.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </PageTransition>
        )}

        {upload.state.currentState === 'processing' && (
          <PageTransition key="processing" variant="slideUp">
            <div className="space-y-4">
              <div>
                <StateLabel
                  currentState={upload.state.currentState}
                  errorMessage={upload.state.errorMessage}
                />
              </div>
              <ProgressBar
                progress={upload.state.progress}
                currentState={upload.state.currentState}
              />
            </div>
          </PageTransition>
        )}

        {upload.state.currentState === 'success' && (
          <SuccessCelebration
            key="success"
            show={true}
            title="Photo uploaded!"
            message="Getting personalized recommendations..."
            icon="🎉"
            autoHideDuration={2000}
            onAction={() => {
              onSuccess({
                state: upload.state,
                metrics: {
                  elapsedTime: upload.elapsedTime,
                  retryCount: upload.state.metadata.retryCount,
                },
              });
            }}
          />
        )}

        {upload.state.currentState === 'error' && (
          <ErrorRecovery key="error" upload={upload} />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Minimal progress indicator (for compact spaces)
 */
export function UploadProgressIndicator({
  progress,
  currentState,
  showLabel = false,
}: {
  progress: number;
  currentState: string;
  showLabel?: boolean;
}) {
  return (
    <div className="space-y-2">
      <ProgressBar progress={progress} currentState={currentState} />
      {showLabel && (
        <StateLabel currentState={currentState} errorMessage={null} />
      )}
    </div>
  );
}
