import type { Metadata } from 'next'
import { ErrorBoundary } from '@/components/error-boundary'
import { HomePageContent } from './home-page-content'

/**
 * Page Metadata - SEO Optimization
 *
 * Following Next.js 16 best practices:
 * - Descriptive title for search engines
 * - Clear description under 160 characters
 * - OpenGraph tags for social sharing
 */
export const metadata: Metadata = {
  title: '홈 - ZZIK Map',
  description: '단골지수 기반 추천 장소와 포인트 잔액을 확인하세요. ZZIK Map으로 로컬 이득을 발견하세요.',
  openGraph: {
    title: '홈 - ZZIK Map',
    description: '단골지수 기반 추천 장소와 포인트 잔액을 확인하세요',
  },
}

/**
 * Home Page - Server Component
 *
 * Professional structure:
 * - Server component wrapper for metadata
 * - ErrorBoundary for production error handling
 * - Client component (HomePageContent) for interactive features
 *
 * This follows Next.js 16 + React 19 best practices.
 */
export default function HomePage() {
  return (
    <ErrorBoundary>
      <HomePageContent />
    </ErrorBoundary>
  )
}
