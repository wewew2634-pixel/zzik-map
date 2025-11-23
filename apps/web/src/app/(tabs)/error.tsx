'use client'

import { useEffect } from 'react'
import { Button } from '@zzik/ui'

/**
 * Tab-Specific Error Boundary
 *
 * Catches errors within tab pages (Map, Search, Saved, Profile)
 * Preserves navigation bar so users can navigate to other tabs
 */
export default function TabError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Tab error caught:', error)
  }, [error])

  return (
    <div className="flex flex-col h-screen bg-zzik-bg">
      {/* Error Content - takes available space, navigation stays at bottom */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          {/* Error Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-zzik-accent-red/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-zzik-accent-red"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <h2 className="text-xl font-bold text-zzik-text-primary mb-2">
            페이지 로드 실패
          </h2>
          <p className="text-sm text-zzik-text-secondary mb-6">
            이 페이지를 불러오는 중 문제가 발생했습니다.
          </p>

          {/* Error Details (dev only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-3 bg-zzik-surface-base border border-zzik-border-content rounded-zzik-depth-sm text-left">
              <p className="text-xs font-mono text-zzik-accent-red break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-zzik-text-muted mt-1">
                  ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={reset}
              size="md"
              fullWidth
              className="bg-zzik-accent-gold text-zzik-bg font-semibold"
            >
              다시 시도
            </Button>
            <p className="text-xs text-zzik-text-muted mt-4">
              또는 다른 탭으로 이동할 수 있습니다
            </p>
          </div>
        </div>
      </div>

      {/* Navigation stays accessible - rendered by layout */}
    </div>
  )
}
