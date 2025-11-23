'use client'

import { useMemo } from 'react'
import { PlaceCard, PlaceCardSkeleton } from '@zzik/ui'
import { WalletPanel } from '@/components/linear/WalletPanel'
import { useWallet } from '@/hooks/useWallet'
import { usePlaces } from '@/hooks/usePlaces'
import { deriveLoyaltyScore, computeBenefitScore } from '@/lib/place-scoring'
import { useRouter } from 'next/navigation'

/**
 * HomePageContent - Client component for Home page
 *
 * Features:
 * - WalletPanel with balance + transactions
 * - Recommended places (top 5 by loyalty score)
 * - Error states for wallet/places
 * - Loading skeletons
 * - WCAG 2.2 compliant
 */
export function HomePageContent() {
  const router = useRouter()
  const { balance, transactions, loading: walletLoading, error: walletError } = useWallet()
  const { places, loading: placesLoading, error: placesError } = usePlaces()

  // Recommended places: Top 5 by loyalty score
  const recommendedPlaces = useMemo(() => {
    const withScores = places.map((place) => ({
      ...place,
      loyaltyScore: deriveLoyaltyScore(place),
      benefitScore: computeBenefitScore(place),
    }))

    // Sort by loyalty score (descending)
    const sorted = [...withScores].sort((a, b) => {
      return (b.loyaltyScore ?? 0) - (a.loyaltyScore ?? 0)
    })

    return sorted.slice(0, 5)
  }, [places])

  const loading = walletLoading || placesLoading

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-surface pb-24">
        <div className="px-4 py-6 space-y-6">
          {/* Header skeleton */}
          <div className="space-y-2">
            <div className="h-8 w-32 bg-surface-secondary animate-pulse rounded-lg" />
            <div className="h-4 w-48 bg-surface-secondary animate-pulse rounded-lg" />
          </div>

          {/* WalletPanel skeleton */}
          <div className="h-64 bg-surface-secondary animate-pulse rounded-2xl" />

          {/* Recommended places skeleton */}
          <div className="space-y-3">
            <div className="h-6 w-40 bg-surface-secondary animate-pulse rounded-lg" />
            {[1, 2, 3, 4, 5].map((i) => (
              <PlaceCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state for wallet
  if (walletError) {
    return (
      <div className="min-h-screen bg-surface pb-24">
        <div className="px-4 py-6 space-y-6">
          <header className="space-y-1 animate-fade-in">
            <h1 className="text-2xl font-bold text-text-primary">
              홈
            </h1>
          </header>

          <div
            role="alert"
            aria-live="polite"
            className="rounded-2xl border border-accent-red/20 bg-accent-red/10 p-6 space-y-2"
          >
            <p className="text-sm font-semibold text-accent-red">
              지갑 정보를 불러올 수 없습니다
            </p>
            <p className="text-xs text-text-secondary">
              {walletError}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-accent-blue px-4 py-2 text-sm font-semibold text-white shadow-button transition-all hover:bg-accent-blue-dark hover:scale-[1.02] active:scale-[0.98]"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Error state for places
  if (placesError) {
    return (
      <div className="min-h-screen bg-surface pb-24">
        <div className="px-4 py-6 space-y-6">
          <header className="space-y-1 animate-fade-in">
            <h1 className="text-2xl font-bold text-text-primary">
              홈
            </h1>
          </header>

          {/* Show wallet even if places fail */}
          <section className="animate-slide-up">
            <WalletPanel
              balance={balance}
              transactions={transactions}
              onWithdraw={() => {
                router.push('/wallet/withdraw')
              }}
            />
          </section>

          <div
            role="alert"
            aria-live="polite"
            className="rounded-2xl border border-accent-red/20 bg-accent-red/10 p-6 space-y-2"
          >
            <p className="text-sm font-semibold text-accent-red">
              추천 장소를 불러올 수 없습니다
            </p>
            <p className="text-xs text-text-secondary">
              {placesError}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-accent-blue px-4 py-2 text-sm font-semibold text-white shadow-button transition-all hover:bg-accent-blue-dark hover:scale-[1.02] active:scale-[0.98]"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Skip navigation link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:bg-accent-blue focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-elevated"
      >
        메인 콘텐츠로 건너뛰기
      </a>

      <div id="main-content" className="px-4 py-6 space-y-6">
        {/* Header */}
        <header className="space-y-1 animate-fade-in">
          <h1 className="text-2xl font-bold text-text-primary">
            홈
          </h1>
          <p className="text-sm text-text-secondary">
            단골 데이터로 고르는 로컬 이득 맵
          </p>
        </header>

        {/* WalletPanel */}
        <section aria-labelledby="wallet-heading" className="animate-slide-up">
          <h2 id="wallet-heading" className="sr-only">
            내 지갑
          </h2>
          <WalletPanel
            balance={balance}
            transactions={transactions}
            onWithdraw={() => {
              router.push('/wallet/withdraw')
            }}
          />
        </section>

        {/* Recommended Places */}
        <section aria-labelledby="recommended-heading" className="space-y-3 animate-slide-up">
          <div className="flex items-center justify-between px-2">
            <h2 id="recommended-heading" className="text-base font-semibold text-text-primary">
              추천 단골집
            </h2>
            <span className="text-xs text-text-secondary" aria-label="정렬 순서: 단골지수 높은 순">
              단골지수 높은 순
            </span>
          </div>

          {recommendedPlaces.length > 0 ? (
            <div className="space-y-3">
              {recommendedPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  variant="map"
                  id={place.id}
                  name={place.name}
                  category={place.category}
                  distanceMeters={place.distanceMeters}
                  trafficSignal={place.trafficSignal}
                  isGold={place.isGold}
                  benefitLabel={place.benefitLabel}
                  benefitValue={place.benefitValue}
                  metrics={place.metrics}
                  loyaltyScore={place.loyaltyScore}
                  benefitScore={place.benefitScore}
                  onClick={() => {
                    router.push(`/places/${place.id}`)
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-surface-secondary flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-text-tertiary"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
                  />
                </svg>
              </div>
              <p className="text-sm text-text-primary font-medium mb-1">
                아직 추천할 단골집이 없습니다
              </p>
              <p className="text-xs text-text-secondary">
                Map에서 주변 장소를 탐색해보세요
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
