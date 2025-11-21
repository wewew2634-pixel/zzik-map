'use client'

import { useState, useMemo, useEffect } from 'react'
import { MapShell, MapOverlay, PlaceCard } from '@zzik/ui'
import { MapboxCanvas } from '@/components/zzik-map/MapboxCanvas'
import type { PlaceSummary } from '@/types/place'
import { trackMapEvent, MapEventTypes } from '@/lib/analytics/map-events'

const MOCK_PLACES: PlaceSummary[] = [
  {
    id: '1',
    name: 'ZZIK LAB COFFEE',
    category: '카페 · 스페셜티',
    lng: 127.0565,
    lat: 37.5446,
    distanceMeters: 180,
    trafficSignal: 'green',
    isGold: true,
    benefitLabel: '현장 릴스 미션',
    benefitValue: '최대 5,000원 캐시백',
    metrics: {
      missions: 42,
      successRate: 93,
      likes: 128,
    },
  },
  {
    id: '2',
    name: '언더그라운드 이자카야',
    category: '이자카야 · 야간',
    lng: 127.0595,
    lat: 37.5456,
    distanceMeters: 420,
    trafficSignal: 'yellow',
    isGold: false,
    benefitLabel: '야간 방문 인증',
    benefitValue: '2인 방문시 1잔 무료',
    metrics: {
      missions: 21,
      successRate: 81,
      likes: 64,
    },
  },
  {
    id: '3',
    name: '성수 베이글 팩토리',
    category: '베이커리 · 브런치',
    lng: 127.0545,
    lat: 37.5435,
    distanceMeters: 520,
    trafficSignal: 'green',
    isGold: true,
    benefitLabel: '아침 방문 인증',
    benefitValue: '아메리카노 무료',
    metrics: {
      missions: 67,
      successRate: 88,
      likes: 203,
    },
  },
  {
    id: '4',
    name: '서울숲 공원 산책로',
    category: '공원 · 야외',
    lng: 127.0375,
    lat: 37.5445,
    distanceMeters: 1850,
    trafficSignal: 'red',
    isGold: false,
    benefitLabel: '산책 인증',
    benefitValue: '없음',
    metrics: {
      missions: 15,
      successRate: 72,
      likes: 38,
    },
  },
]

const DEFAULT_CENTER: [number, number] = [127.0565, 37.5446] // 강남 기본 좌표

type FilterType = 'all' | 'gold' | 'active'

/**
 * 필터 로직 (임시 규칙)
 * - 'all': 모든 장소
 * - 'gold': isGold === true
 * - 'active': 임시 규칙으로 successRate >= 80 또는 missions >= 10
 *   (추후 백엔드/비즈니스 로직에 맞춰 교체)
 */
function applyFilter(places: PlaceSummary[], filter: FilterType): PlaceSummary[] {
  switch (filter) {
    case 'all':
      return places
    case 'gold':
      return places.filter((p) => p.isGold)
    case 'active':
      // 임시 active 규칙: 성공률 80% 이상 또는 미션 10회 이상
      return places.filter((p) => {
        const metrics = p.metrics
        if (!metrics) return false
        return metrics.successRate >= 80 || metrics.missions >= 10
      })
    default:
      return places
  }
}

export default function MapPage() {
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER)
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(MOCK_PLACES[0]?.id ?? null)

  // (B) Geolocation: 현재 위치 가져오기
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCenter([longitude, latitude])

        trackMapEvent(MapEventTypes.GEOLOCATION_SUCCESS, {
          lat: latitude,
          lng: longitude,
        })
      },
      (error) => {
        console.warn('Geolocation error:', error.message)
        trackMapEvent(MapEventTypes.GEOLOCATION_ERROR, {
          code: error.code,
          message: error.message,
        })
        // 실패 시 DEFAULT_CENTER 유지 (이미 초기값이므로 별도 처리 불필요)
      },
      {
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }, [])

  // 첫 진입 이벤트
  useEffect(() => {
    trackMapEvent(MapEventTypes.MAP_VIEWED)
  }, [])

  // (C) 필터링된 장소 목록
  const filteredPlaces = useMemo(
    () => applyFilter(MOCK_PLACES, filter),
    [filter]
  )

  // 필터 변경 시 selectedPlaceId 조정
  useEffect(() => {
    if (filteredPlaces.length === 0) {
      setSelectedPlaceId(null)
      return
    }

    // 현재 선택된 place가 filteredPlaces에 없으면 첫 번째로 변경
    const isSelectedInFiltered = filteredPlaces.some((p) => p.id === selectedPlaceId)
    if (!isSelectedInFiltered) {
      setSelectedPlaceId(filteredPlaces[0].id)
    }
  }, [filteredPlaces, selectedPlaceId])

  const selectedPlace = useMemo(
    () => filteredPlaces.find((p) => p.id === selectedPlaceId) ?? filteredPlaces[0],
    [filteredPlaces, selectedPlaceId]
  )

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter)
    trackMapEvent(MapEventTypes.FILTER_CHANGED, { filter: newFilter })
  }

  const handlePlaceClick = (placeId: string) => {
    setSelectedPlaceId(placeId)
    trackMapEvent(MapEventTypes.CARD_CLICKED, { placeId })
  }

  return (
    <MapShell
      map={
        <MapboxCanvas
          center={center}
          zoom={14}
          places={filteredPlaces}
          onPlaceClick={setSelectedPlaceId}
          selectedPlaceId={selectedPlaceId}
        />
      }
      overlay={
        <MapOverlay>
          <div className="space-y-3 py-2">
            {/* (C) 필터 UI - 독립 버튼 그룹 (2026 모노톤 디자인) */}
            <div className="flex gap-2 pb-3 border-b border-zinc-800">
              <button
                onClick={() => handleFilterChange('all')}
                className={`flex-1 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-zinc-50 text-zinc-900'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => handleFilterChange('gold')}
                className={`flex-1 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                  filter === 'gold'
                    ? 'bg-zinc-50 text-zinc-900'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                GOLD
              </button>
              <button
                onClick={() => handleFilterChange('active')}
                className={`flex-1 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                  filter === 'active'
                    ? 'bg-zinc-50 text-zinc-900'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                활성
              </button>
            </div>

            {/* 헤더 */}
            <div className="mb-4">
              <h2 className="text-base font-semibold text-white">주변 미션</h2>
              <p className="mt-1 text-xs text-zinc-400">
                {filteredPlaces.length > 0 ? (
                  <>
                    총 {filteredPlaces.length}개
                    {selectedPlace && <span> · 선택: {selectedPlace.name}</span>}
                  </>
                ) : (
                  '조건에 맞는 미션이 없습니다'
                )}
              </p>
            </div>

            {/* 장소 리스트 */}
            {filteredPlaces.length > 0 ? (
              <div className="space-y-2">
                {filteredPlaces.map((place) => (
                  <div
                    key={place.id}
                    className={
                      place.id === selectedPlaceId
                        ? 'ring-1 ring-zinc-600 rounded-xl'
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
                      onClick={() => handlePlaceClick(place.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-sm text-zinc-400">
                필터 조건을 변경해보세요
              </div>
            )}
          </div>
        </MapOverlay>
      }
    />
  )
}
