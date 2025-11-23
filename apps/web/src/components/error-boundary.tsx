'use client'

import React, { Component, ReactNode } from 'react'
import { trackEvent } from '@/lib/analytics/track-event'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary - Production-ready error catching component
 *
 * Features:
 * - Catches React errors in child components
 * - Logs errors to analytics (trackEvent)
 * - Provides reset functionality
 * - Customizable fallback UI
 * - WCAG 2.2 Level AA compliant error messages
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to analytics
    trackEvent('error_boundary_triggered', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary] Caught error:', error, errorInfo)
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }

      // Default fallback UI
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="flex min-h-screen items-center justify-center bg-zzik-bg p-6"
        >
          <div className="max-w-md space-y-6 rounded-zzik-depth-xl border border-zzik-border-content bg-zzik-surface-content p-8 shadow-zzik-depth-elevation-04">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-zzik-text-primary">
                문제가 발생했습니다
              </h1>
              <p className="text-sm text-zzik-text-secondary">
                예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="space-y-2 rounded-zzik-depth-md bg-zzik-bg p-4">
                <p className="text-xs font-semibold text-zzik-accent-red">
                  개발 모드 에러 정보:
                </p>
                <pre className="overflow-x-auto text-xs text-zzik-text-secondary">
                  {this.state.error.message}
                </pre>
              </div>
            )}

            <button
              type="button"
              onClick={this.reset}
              className="w-full rounded-zzik-depth-lg bg-zzik-accent-gold px-6 py-3 text-sm font-bold text-zzik-bg shadow-zzik-depth-elevation-02 transition-all duration-zzik-fast hover:scale-zzik-hover hover:shadow-zzik-depth-elevation-03 active:scale-zzik-press focus:outline-none focus-visible:ring-2 focus-visible:ring-zzik-accent-gold focus-visible:ring-offset-2"
              aria-label="다시 시도하기"
            >
              다시 시도
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
