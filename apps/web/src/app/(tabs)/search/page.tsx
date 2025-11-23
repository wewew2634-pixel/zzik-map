'use client'

import { useState, useMemo } from 'react'
import { PlaceCard, PlaceCardSkeleton } from '@zzik/ui'
import { usePlaces } from '@/hooks/usePlaces'
import { deriveLoyaltyScore, computeBenefitScore } from '@/lib/place-scoring'

type CategoryType = 'all' | 'cafe' | 'restaurant' | 'convenience' | 'etc'
type SortType = 'loyalty' | 'benefit' | 'distance'

/**
 * Search Page - ZZIK LIVE v4
 *
 * Features:
 * - Real-time search by place name (loyalty score based)
 * - Category filters (cafe, restaurant, convenience, etc)
 * - Sort by loyalty score, benefit score, or distance
 * - PlaceCard (map variant) reuse
 * - Loading state with PlaceCardSkeleton
 */
export default function SearchPage() {
  const { places, loading, error } = usePlaces()
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState<CategoryType>('all')
  const [sort, setSort] = useState<SortType>('loyalty')

  // Filter and sort places
  const filteredPlaces = useMemo(() => {
    let filtered = places

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((place) =>
        place.name.toLowerCase().includes(query) ||
        place.category.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (category !== 'all') {
      filtered = filtered.filter((place) => {
        const cat = place.category.toLowerCase()
        switch (category) {
          case 'cafe':
            return cat.includes('카페') || cat.includes('cafe')
          case 'restaurant':
            return cat.includes('음식점') || cat.includes('식당') || cat.includes('restaurant')
          case 'convenience':
            return cat.includes('편의점') || cat.includes('convenience')
          case 'etc':
            return !cat.includes('카페') &&
                   !cat.includes('cafe') &&
                   !cat.includes('음식점') &&
                   !cat.includes('식당') &&
                   !cat.includes('restaurant') &&
                   !cat.includes('편의점') &&
                   !cat.includes('convenience')
          default:
            return true
        }
      })
    }

    // Calculate scores for each place
    const withScores = filtered.map((place) => ({
      ...place,
      loyaltyScore: deriveLoyaltyScore(place),
      benefitScore: computeBenefitScore(place),
    }))

    // Apply sorting
    const sorted = [...withScores].sort((a, b) => {
      switch (sort) {
        case 'loyalty':
          return (b.loyaltyScore ?? 0) - (a.loyaltyScore ?? 0)
        case 'benefit':
          return (b.benefitScore ?? 0) - (a.benefitScore ?? 0)
        case 'distance':
          return a.distanceMeters - b.distanceMeters
        default:
          return 0
      }
    })

    return sorted
  }, [places, searchQuery, category, sort])

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-surface">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface border-b border-border">
          <div className="px-4 py-3">
            <h1 className="text-lg font-bold text-text-primary mb-3">검색</h1>
            {/* Search input skeleton */}
            <div className="h-10 bg-surface-secondary animate-pulse rounded-lg mb-3" />
            {/* Category filters skeleton */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-8 w-20 bg-surface-secondary animate-pulse rounded-full flex-shrink-0"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <PlaceCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col h-screen bg-surface">
        <div className="sticky top-0 z-10 bg-surface border-b border-border">
          <div className="px-4 py-3">
            <h1 className="text-lg font-bold text-text-primary">검색</h1>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <p className="text-accent-red text-sm font-medium">오류가 발생했습니다</p>
          <p className="text-text-secondary text-xs mt-2">{error}</p>
        </div>
      </div>
    )
  }

  // Main content
  return (
    <div className="flex flex-col h-screen bg-surface">
      {/* Header with search and filters */}
      <div className="sticky top-0 z-10 bg-surface border-b border-border">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-text-primary mb-3">검색</h1>

          {/* Search Input */}
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="단골집을 검색하세요"
              aria-label="단골집 검색"
              className="w-full px-4 py-2 bg-surface-secondary border border-border rounded-lg text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            <button
              onClick={() => setCategory('all')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all flex-shrink-0 ${
                category === 'all'
                  ? 'bg-text-primary text-white scale-[1.02]'
                  : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary hover:scale-[1.02]'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setCategory('cafe')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all flex-shrink-0 ${
                category === 'cafe'
                  ? 'bg-text-primary text-white scale-[1.02]'
                  : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary hover:scale-[1.02]'
              }`}
            >
              카페
            </button>
            <button
              onClick={() => setCategory('restaurant')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all flex-shrink-0 ${
                category === 'restaurant'
                  ? 'bg-text-primary text-white scale-[1.02]'
                  : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary hover:scale-[1.02]'
              }`}
            >
              음식점
            </button>
            <button
              onClick={() => setCategory('convenience')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all flex-shrink-0 ${
                category === 'convenience'
                  ? 'bg-text-primary text-white scale-[1.02]'
                  : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary hover:scale-[1.02]'
              }`}
            >
              편의점
            </button>
            <button
              onClick={() => setCategory('etc')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all flex-shrink-0 ${
                category === 'etc'
                  ? 'bg-text-primary text-white scale-[1.02]'
                  : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary hover:scale-[1.02]'
              }`}
            >
              기타
            </button>
          </div>
        </div>
      </div>

      {/* Sort Options & Results Count */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setSort('loyalty')}
              className={`rounded-lg px-2 py-1 text-xs transition-all ${
                sort === 'loyalty'
                  ? 'bg-surface-secondary text-text-primary scale-[1.02]'
                  : 'text-text-tertiary hover:text-text-secondary hover:scale-[1.02]'
              }`}
            >
              단골지수 순
            </button>
            <button
              onClick={() => setSort('benefit')}
              className={`rounded-lg px-2 py-1 text-xs transition-all ${
                sort === 'benefit'
                  ? 'bg-surface-secondary text-text-primary scale-[1.02]'
                  : 'text-text-tertiary hover:text-text-secondary hover:scale-[1.02]'
              }`}
            >
              이득 순
            </button>
            <button
              onClick={() => setSort('distance')}
              className={`rounded-lg px-2 py-1 text-xs transition-all ${
                sort === 'distance'
                  ? 'bg-surface-secondary text-text-primary scale-[1.02]'
                  : 'text-text-tertiary hover:text-text-secondary hover:scale-[1.02]'
              }`}
            >
              거리 순
            </button>
          </div>
          <span className="text-xs text-text-secondary">
            {filteredPlaces.length}개
          </span>
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {filteredPlaces.length > 0 ? (
          <div className="space-y-3 animate-fade-in">
            {filteredPlaces.map((place) => (
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
                  // TODO: Navigate to place detail page
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full animate-fade-in">
            {searchQuery || category !== 'all' ? (
              <>
                <div className="w-16 h-16 mb-4 rounded-full bg-surface-secondary flex items-center justify-center">
                  <svg className="w-8 h-8 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-sm text-text-primary font-medium mb-1">검색 결과가 없습니다</p>
                <p className="text-xs text-text-secondary">다른 검색어를 입력하거나 필터를 변경해보세요</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mb-4 rounded-full bg-surface-secondary flex items-center justify-center">
                  <svg className="w-8 h-8 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-sm text-text-primary font-medium mb-1">검색어를 입력하세요</p>
                <p className="text-xs text-text-secondary">단골지수 기반으로 검색할 수 있습니다</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
