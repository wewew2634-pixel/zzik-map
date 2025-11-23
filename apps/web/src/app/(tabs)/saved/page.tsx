'use client'

import { useState, useMemo } from 'react'
import { PlaceCard, PlaceCardSkeleton, Button } from '@zzik/ui'
import { usePlaces } from '@/hooks/usePlaces'
import { deriveLoyaltyScore, computeBenefitScore } from '@/lib/place-scoring'

type SortType = 'recent' | 'loyalty'

/**
 * Saved Page - 저장된 단골집 리스트
 *
 * 기능:
 * - 저장된 장소 리스트 표시 (PlaceCard map variant 재사용)
 * - 정렬 옵션: 최근 저장순, 단골지수순
 * - 각 카드에 삭제 버튼
 * - 로딩 상태 (PlaceCardSkeleton)
 * - 빈 상태 처리
 */
export default function SavedPage() {
  const { places, loading, error } = usePlaces()
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([])
  const [sort, setSort] = useState<SortType>('recent')

  // Mock: 처음 2개의 places를 저장된 것으로 표시 (derived state with deferred update)
  useMemo(() => {
    if (places.length > 0 && savedPlaceIds.length === 0) {
      const firstTwo = places.slice(0, 2).map(p => p.id)
      // Defer state update to avoid setState during render
      queueMicrotask(() => setSavedPlaceIds(firstTwo))
    }
  }, [places, savedPlaceIds])

  // 저장된 장소 필터링 & 점수 계산 & 정렬
  const savedPlaces = useMemo(() => {
    const filtered = places.filter(p => savedPlaceIds.includes(p.id))

    // 각 place에 점수 계산 추가
    const withScores = filtered.map(place => ({
      ...place,
      loyaltyScore: deriveLoyaltyScore(place),
      benefitScore: computeBenefitScore(place),
    }))

    // 정렬 적용
    const sorted = [...withScores].sort((a, b) => {
      switch (sort) {
        case 'recent':
          // 최근 저장순: savedPlaceIds의 순서대로
          return savedPlaceIds.indexOf(a.id) - savedPlaceIds.indexOf(b.id)
        case 'loyalty':
          // 단골지수순: 높은 순
          return (b.loyaltyScore ?? 0) - (a.loyaltyScore ?? 0)
        default:
          return 0
      }
    })

    return sorted
  }, [places, savedPlaceIds, sort])

  const handleRemove = (placeId: string) => {
    setSavedPlaceIds(prev => prev.filter(id => id !== placeId))
  }

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-surface">
        {/* 헤더 */}
        <div className="sticky top-0 z-10 bg-surface border-b border-border">
          <div className="px-4 py-4">
            <h1 className="text-lg font-bold text-text-primary">저장한 단골집</h1>
            <p className="mt-1 text-sm text-text-secondary">
              나만의 단골집 컬렉션
            </p>
          </div>
        </div>

        {/* 스켈레톤 리스트 */}
        <div className="flex-1 overflow-auto px-4 py-4 space-y-3">
          {[1, 2, 3, 4].map(i => (
            <PlaceCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-col h-screen bg-surface">
        <div className="sticky top-0 z-10 bg-surface border-b border-border">
          <div className="px-4 py-4">
            <h1 className="text-lg font-bold text-text-primary">저장한 단골집</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 px-4">
          <p className="text-sm text-accent-red">오류가 발생했습니다</p>
          <p className="mt-2 text-xs text-text-secondary">{error}</p>
        </div>
      </div>
    )
  }

  // 빈 상태
  const isEmpty = savedPlaces.length === 0

  return (
    <div className="flex flex-col h-screen bg-surface">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-surface border-b border-border">
        <div className="px-4 py-4">
          <h1 className="text-lg font-bold text-text-primary">저장한 단골집</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {isEmpty ? '아직 저장한 단골집이 없습니다' : `${savedPlaces.length}개의 단골집`}
          </p>

          {/* 정렬 옵션 */}
          {!isEmpty && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setSort('recent')}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  sort === 'recent'
                    ? 'bg-surface-secondary text-text-primary shadow-sm'
                    : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-secondary'
                }`}
              >
                최근 저장순
              </button>
              <button
                onClick={() => setSort('loyalty')}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  sort === 'loyalty'
                    ? 'bg-surface-secondary text-text-primary shadow-sm'
                    : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-secondary'
                }`}
              >
                단골지수순
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 overflow-auto">
        {isEmpty ? (
          // 빈 상태
          <div className="flex flex-col items-center justify-center h-full px-4 py-8">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto text-text-tertiary"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                />
              </svg>
              <h2 className="mt-4 text-base font-semibold text-text-primary">
                아직 저장한 단골집이 없습니다
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Map에서 마음에 드는 곳을 저장해보세요
              </p>
              <div className="mt-6">
                <Button
                  variant="solid"
                  className="px-6"
                  onClick={() => {
                    // Navigate to map page
                    window.location.href = '/map'
                  }}
                >
                  Map에서 찾아보기
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // 저장된 장소 리스트
          <div className="px-4 py-4 space-y-3 animate-slide-up">
            {savedPlaces.map((place) => (
              <div
                key={place.id}
                className="relative group"
              >
                <PlaceCard
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
                    // Navigate to place detail
                    window.location.href = `/places/${place.id}`
                  }}
                />

                {/* 삭제 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(place.id)
                  }}
                  className="absolute top-2 right-2 p-2 rounded-full bg-surface-secondary text-text-secondary hover:text-accent-red hover:bg-surface-tertiary transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                  aria-label="삭제"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
