'use client'

import { useEffect } from 'react'
import { Button } from '@zzik/ui'
import * as Sentry from '@sentry/nextjs'

/**
 * Global Error Boundary for App Router
 *
 * Catches unhandled React errors and provides graceful fallback UI
 * Integrates with Sentry for error tracking
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Capture error in Sentry
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'global',
      },
      extra: {
        digest: error.digest,
      },
    })

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error caught:', error)
    }
  }, [error])

  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen bg-zzik-bg flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-zzik-accent-red/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-zzik-accent-red"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-zzik-text-primary mb-2">
              문제가 발생했습니다
            </h1>
            <p className="text-sm text-zzik-text-secondary mb-6">
              예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>

            {/* Error Details (dev only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-zzik-surface-base border border-zzik-border-content rounded-zzik-depth-sm text-left">
                <p className="text-xs font-mono text-zzik-accent-red break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-zzik-text-muted mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={reset}
                size="lg"
                fullWidth
                className="bg-zzik-accent-gold text-zzik-bg font-semibold"
              >
                다시 시도
              </Button>
              <Button
                variant="ghost"
                onClick={() => (window.location.href = '/')}
                size="lg"
                fullWidth
                className="text-zzik-text-secondary"
              >
                홈으로 돌아가기
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
