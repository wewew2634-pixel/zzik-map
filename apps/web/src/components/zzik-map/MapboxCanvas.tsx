'use client'

import { useEffect, useRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { PlaceSummary } from '@/types/place'
import { trackMapEvent, MapEventTypes } from '@/lib/analytics/map-events'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ''

export type MapboxCanvasProps = {
  center: [number, number] // [lng, lat]
  zoom?: number
  places?: PlaceSummary[]
  onPlaceClick?: (placeId: string) => void
  selectedPlaceId?: string | null
}

// PlaceSummary[] → GeoJSON FeatureCollection 변환
function placesToGeoJSON(places: PlaceSummary[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: places.map((place) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [place.lng, place.lat],
      },
      properties: {
        placeId: place.id,
        name: place.name,
        category: place.category,
        trafficSignal: place.trafficSignal,
        isGold: place.isGold,
      },
    })),
  }
}

// trafficSignal → 색상 (채도 낮춤, 2026 모노톤 원칙)
function getTrafficSignalColor(signal: string): string {
  switch (signal) {
    case 'green':
      return '#10b981' // emerald-500 (기존 green-500보다 절제됨)
    case 'yellow':
      return '#f59e0b' // amber-500 (기존 yellow-400보다 덜 튐)
    case 'red':
      return '#ef4444' // red-500 유지 (경고는 명확해야 함)
    default:
      return '#71717a' // zinc-500
  }
}

export function MapboxCanvas({
  center,
  zoom = 14,
  places = [],
  onPlaceClick,
  selectedPlaceId,
}: MapboxCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const initializedRef = useRef(false)

  // 맵 초기화 (한 번만)
  useEffect(() => {
    if (!mapContainerRef.current || initializedRef.current) return
    if (!mapboxgl.accessToken) {
      console.warn('Missing NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN')
      return
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center,
      zoom,
    })

    mapRef.current = map
    initializedRef.current = true

    map.on('load', () => {
      // Source 추가
      map.addSource('places-source', {
        type: 'geojson',
        data: placesToGeoJSON([]),
        cluster: true,
        clusterRadius: 40,
        clusterMaxZoom: 14,
      })

      // Cluster Layer (Circle)
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'places-source',
        filter: ['has', 'point_count'],
        paint: {
          // 2026 디자인: 과도한 그라디언트 제거, 단순한 원
          'circle-color': '#52525b', // zinc-600 (모노톤)
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            16, // 10개 미만
            10, 20, // 10~99개
            100, 24, // 100개 이상
          ],
          'circle-stroke-width': 1,
          'circle-stroke-color': '#a1a1aa', // zinc-400
        },
      })

      // Cluster Count Text
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'places-source',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 11,
        },
        paint: {
          'text-color': '#fafafa', // zinc-50
        },
      })

      // Unclustered Layer (개별 장소)
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'places-source',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 10,
          'circle-color': [
            'match',
            ['get', 'trafficSignal'],
            'green', getTrafficSignalColor('green'),
            'yellow', getTrafficSignalColor('yellow'),
            'red', getTrafficSignalColor('red'),
            '#71717a', // 기본값 zinc-500
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'isGold'], true],
            '#fbbf24', // amber-400 (GOLD 강조)
            '#27272a', // zinc-800 (일반)
          ],
        },
      })

      // Unclustered Label (★ for GOLD, ₩ for normal)
      map.addLayer({
        id: 'unclustered-label',
        type: 'symbol',
        source: 'places-source',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['case', ['==', ['get', 'isGold'], true], '★', '₩'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 11,
        },
        paint: {
          'text-color': '#fafafa',
        },
      })

      // Cluster 클릭 → zoom in
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        })
        if (!features.length) return

        const clusterId = features[0].properties?.cluster_id
        const source = map.getSource('places-source') as mapboxgl.GeoJSONSource

        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return

          trackMapEvent(MapEventTypes.CLUSTER_CLICKED, {
            clusterId,
            zoomTo: zoom,
          })

          map.easeTo({
            center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
            zoom: zoom || 15,
            duration: 800,
          })
        })
      })

      // Unclustered 클릭 → onPlaceClick
      map.on('click', 'unclustered-point', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['unclustered-point'],
        })
        if (!features.length) return

        const placeId = features[0].properties?.placeId
        if (placeId) {
          trackMapEvent(MapEventTypes.MARKER_CLICKED, { placeId })
          onPlaceClick?.(placeId)
        }
      })

      // 마우스 커서 변경
      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = ''
      })
      map.on('mouseenter', 'unclustered-point', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'unclustered-point', () => {
        map.getCanvas().style.cursor = ''
      })
    })

    return () => {
      map.remove()
      mapRef.current = null
      initializedRef.current = false
    }
  }, [center, zoom, onPlaceClick])

  // places 변경 시 GeoJSON 데이터 업데이트
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return

    const source = map.getSource('places-source') as mapboxgl.GeoJSONSource
    if (source) {
      source.setData(placesToGeoJSON(places))
    }
  }, [places])

  // selectedPlaceId 변경 시 flyTo + 시각적 강조
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded() || !selectedPlaceId) return

    const selectedPlace = places.find((p) => p.id === selectedPlaceId)
    if (!selectedPlace) return

    // flyTo 애니메이션
    map.flyTo({
      center: [selectedPlace.lng, selectedPlace.lat],
      zoom: 15,
      duration: 1000,
    })

    // 선택된 마커 강조 (stroke 두껍게)
    // 현재는 circle-stroke-width로 전역 설정되어 있으므로
    // data-driven styling으로 개선 가능 (추후 확장)
  }, [selectedPlaceId, places])

  if (!mapboxgl.accessToken) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-sm text-red-400">
        <div className="text-center">
          <p className="font-semibold">Mapbox 토큰이 설정되지 않았습니다</p>
          <p className="mt-2 text-xs text-zinc-600">
            .env.local 파일에 NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN을 추가하세요
          </p>
        </div>
      </div>
    )
  }

  return <div ref={mapContainerRef} className="h-full w-full" />
}
