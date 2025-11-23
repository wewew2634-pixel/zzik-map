'use client'

import { useState, useMemo, useEffect } from 'react'
import { MapShell, PlaceCard, PlaceCardSkeleton, MissionDetailSheet } from '@zzik/ui'
import { MapboxCanvas } from '@/components/zzik-map/MapboxCanvas'
import { SearchBar } from '@/components/linear/SearchBar'
import { trackMapEvent, MapEventTypes } from '@/lib/analytics/map-events'
import { usePlaces } from '@/hooks/usePlaces'
import { deriveLoyaltyScore, computeBenefitScore } from '@/lib/place-scoring'

const DEFAULT_CENTER: [number, number] = [127.0565, 37.5446]

export default function MapPage() {
  const { places, loading, error } = usePlaces()
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCenter([longitude, latitude])
        trackMapEvent(MapEventTypes.GEOLOCATION_SUCCESS, { lat: latitude, lng: longitude })
      },
      (error) => {
        console.warn('Geolocation error:', error.message)
        trackMapEvent(MapEventTypes.GEOLOCATION_ERROR, { code: error.code, message: error.message })
      },
      { timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  // Track map viewed
  useEffect(() => {
    trackMapEvent(MapEventTypes.MAP_VIEWED)
  }, [])

  // Compute scores
  const placesWithScores = useMemo(() => {
    return places.map((place) => ({
      ...place,
      loyaltyScore: deriveLoyaltyScore(place),
      benefitScore: computeBenefitScore(place),
    }))
  }, [places])

  // Auto-select first place
  const selectedPlace = useMemo(() => {
    if (placesWithScores.length === 0) return null

    const currentSelection = placesWithScores.find((p) => p.id === selectedPlaceId)
    if (currentSelection) return currentSelection

    const firstPlace = placesWithScores[0]
    if (selectedPlaceId !== firstPlace.id) {
      queueMicrotask(() => setSelectedPlaceId(firstPlace.id))
    }
    return firstPlace
  }, [placesWithScores, selectedPlaceId])

  const handlePlaceClick = (placeId: string) => {
    setSelectedPlaceId(placeId)
    setSheetOpen(true)
    trackMapEvent(MapEventTypes.CARD_CLICKED, { placeId })
  }

  const handleCloseSheet = () => {
    setSheetOpen(false)
  }

  // MissionDetailSheet 데이터 (선택된 장소 기준) - Hook을 early return 전에 호출
  const missionData = useMemo(() => {
    if (!selectedPlace) return null

    return {
      missionTitle: '방문 인증 미션',
      placeName: selectedPlace.name,
      placeCategory: selectedPlace.category,
      placeArea: '성수동', // TODO: Extract from place data
      rewardAmount: 5000, // TODO: Get from actual mission data
      isGold: selectedPlace.isGold,
      missionConditions: 'GPS + QR + 영수증',
      currentStep: 'gps' as const,
    }
  }, [selectedPlace])

  // Loading state
  if (loading) {
    return (
      <div className="h-screen bg-surface">
        <MapShell
          map={<div className="flex items-center justify-center h-full bg-surface-secondary text-text-primary" role="status" aria-live="polite">로딩 중...</div>}
          searchBar={
            <SearchBar
              placeholder="성수동에서 이득인 곳 찾기..."
            />
          }
          bottomPanel={
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-primary">내 주변 미션</span>
              </div>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {[1, 2, 3, 4].map((i) => (
                  <PlaceCardSkeleton key={i} />
                ))}
              </div>
            </div>
          }
        />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen bg-surface">
        <MapShell
          map={<div className="flex items-center justify-center h-full bg-surface-secondary text-text-primary" role="alert">지도 로딩 실패</div>}
          bottomPanel={
            <div className="flex flex-col items-center justify-center py-8 text-sm text-text-secondary" role="alert" aria-live="assertive">
              <p className="text-accent-red">오류가 발생했습니다</p>
              <p className="mt-2" id="error-message">{error}</p>
            </div>
          }
        />
      </div>
    )
  }

  return (
    <>
      <div className="h-screen bg-surface">
        <MapShell
        map={
          <MapboxCanvas
            center={center}
            zoom={14}
            places={placesWithScores}
            onPlaceClick={setSelectedPlaceId}
            selectedPlaceId={selectedPlaceId}
          />
        }
        searchBar={
          <SearchBar
            placeholder="성수동에서 이득인 곳 찾기..."
            onFilterClick={() => {
              // TODO: Open filter modal
              console.log('Filter clicked')
            }}
          />
        }
        bottomPanel={
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-primary">
                내 주변 미션
              </span>
              <span className="text-[11px] text-text-tertiary">
                {placesWithScores.length}개
              </span>
            </div>

            {/* Place list */}
            {placesWithScores.length > 0 ? (
              <div
                data-testid="place-list"
                className="flex flex-col gap-2 max-h-64 overflow-y-auto"
                role="list"
                aria-label="주변 장소 목록"
              >
                {placesWithScores.map((place) => (
                  <div
                    key={place.id}
                    className={
                      place.id === selectedPlaceId
                        ? 'ring-2 ring-accent-blue rounded-lg'
                        : ''
                    }
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
                      onClick={() => handlePlaceClick(place.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div data-testid="empty-state" className="flex items-center justify-center py-8 text-sm text-text-secondary">
                조건에 맞는 가게가 없습니다
              </div>
            )}
          </div>
        }
      />
      </div>

      {/* MissionDetailSheet */}
      {missionData && (
        <MissionDetailSheet
          open={sheetOpen}
          onClose={handleCloseSheet}
          missionTitle={missionData.missionTitle}
          placeName={missionData.placeName}
          placeCategory={missionData.placeCategory}
          placeArea={missionData.placeArea}
          rewardAmount={missionData.rewardAmount}
          isGold={missionData.isGold}
          missionConditions={missionData.missionConditions}
          currentStep={missionData.currentStep}
          onStart={() => {
            // TODO: Start mission
            console.log('Start mission for place:', selectedPlaceId)
          }}
          onVerifyGps={() => {
            // TODO: Verify GPS
            console.log('Verify GPS for place:', selectedPlaceId)
          }}
          onVerifyQr={() => {
            // TODO: Verify QR
            console.log('Verify QR for place:', selectedPlaceId)
          }}
          onVerifyReels={() => {
            // TODO: Verify Reels
            console.log('Verify Reels for place:', selectedPlaceId)
          }}
        />
      )}
    </>
  )
}
