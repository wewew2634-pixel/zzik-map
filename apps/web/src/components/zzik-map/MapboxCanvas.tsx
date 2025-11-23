'use client'

import { useEffect, useRef } from 'react'
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

// trafficSignal → 색상 (ZZIK depth tokens)
// Matches tailwind.config.ts zzik-accent-* colors
function getTrafficSignalColor(signal: string): string {
  switch (signal) {
    case 'green':
      // zzik-accent-green: rgba(16,185,129,0.80)
      return 'rgba(16,185,129,0.80)'
    case 'yellow':
      // zzik-accent-yellow: rgba(245,158,11,0.90)
      return 'rgba(245,158,11,0.90)'
    case 'red':
      // zzik-accent-red: rgba(244,63,94,0.80)
      return 'rgba(244,63,94,0.80)'
    default:
      // zzik-text-muted: #6B7280
      return '#6B7280'
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

      // Cluster Layer (Circle) - Linear inspired minimal design
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'places-source',
        filter: ['has', 'point_count'],
        paint: {
          // Linear style: subtle, refined circles with proper sizing
          'circle-color': '#3f3f46', // zinc-700 (darker, more refined)
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            14, // 10개 미만 - reduced from 16
            10, 18, // 10~99개 - reduced from 20
            100, 22, // 100개 이상 - reduced from 24
          ],
          'circle-stroke-width': 1.5, // slightly thicker for definition
          'circle-stroke-color': '#71717a', // zinc-500 (softer contrast)
          'circle-opacity': 0.95, // slight transparency for layering
        },
      })

      // Cluster Count Text - improved readability
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'places-source',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12, // slightly larger for better readability
        },
        paint: {
          'text-color': '#fafafa', // zinc-50 (high contrast)
          'text-halo-color': '#27272a', // zinc-800 (text outline for clarity)
          'text-halo-width': 1,
        },
      })

      // Unclustered Layer (개별 장소) - Linear style refined markers
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'places-source',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 8, // reduced from 10 for cleaner look
          'circle-color': [
            'match',
            ['get', 'trafficSignal'],
            'green', getTrafficSignalColor('green'),
            'yellow', getTrafficSignalColor('yellow'),
            'red', getTrafficSignalColor('red'),
            '#71717a', // 기본값 zinc-500
          ],
          'circle-stroke-width': [
            'case',
            ['==', ['get', 'isGold'], true],
            2.5, // thicker stroke for GOLD emphasis
            1.5, // standard stroke for regular places
          ],
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'isGold'], true],
            '#fbbf24', // amber-400 (GOLD - highly visible)
            'rgba(39, 39, 42, 0.8)', // zinc-800 with transparency
          ],
          'circle-opacity': 0.9, // slight transparency for modern look
        },
      })

      // Hover effect layer for markers
      map.addLayer({
        id: 'unclustered-point-hover',
        type: 'circle',
        source: 'places-source',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 12, // larger hover radius
          'circle-color': 'transparent',
          'circle-stroke-width': 0,
          'circle-opacity': 0, // hidden by default
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

      // 마우스 커서 변경 및 hover 효과
      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer'
        // Cluster hover: slightly scale up
        map.setPaintProperty('clusters', 'circle-radius', [
          'step',
          ['get', 'point_count'],
          16, // 10개 미만 - hover state
          10, 20, // 10~99개 - hover state
          100, 24, // 100개 이상 - hover state
        ])
        map.setPaintProperty('clusters', 'circle-opacity', 1)
      })
      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = ''
        // Reset to normal size
        map.setPaintProperty('clusters', 'circle-radius', [
          'step',
          ['get', 'point_count'],
          14, // 10개 미만
          10, 18, // 10~99개
          100, 22, // 100개 이상
        ])
        map.setPaintProperty('clusters', 'circle-opacity', 0.95)
      })
      map.on('mouseenter', 'unclustered-point', () => {
        map.getCanvas().style.cursor = 'pointer'
        // Marker hover: scale up and increase opacity
        map.setPaintProperty('unclustered-point', 'circle-radius', 10)
        map.setPaintProperty('unclustered-point', 'circle-opacity', 1)
      })
      map.on('mouseleave', 'unclustered-point', () => {
        map.getCanvas().style.cursor = ''
        // Reset to normal size
        map.setPaintProperty('unclustered-point', 'circle-radius', 8)
        map.setPaintProperty('unclustered-point', 'circle-opacity', 0.9)
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
    if (!map || !map.isStyleLoaded()) return

    if (!selectedPlaceId) {
      // Reset all markers to normal state when selection is cleared
      map.setPaintProperty('unclustered-point', 'circle-radius', 8)
      map.setPaintProperty('unclustered-point', 'circle-opacity', 0.9)
      return
    }

    const selectedPlace = places.find((p) => p.id === selectedPlaceId)
    if (!selectedPlace) return

    // flyTo 애니메이션
    map.flyTo({
      center: [selectedPlace.lng, selectedPlace.lat],
      zoom: 15,
      duration: 1000,
    })

    // 선택된 마커 강조: pulse effect with increased size
    // Note: This applies to all markers - for per-marker styling,
    // we'd need feature-state which requires more complex implementation
    setTimeout(() => {
      map.setPaintProperty('unclustered-point', 'circle-radius', 10)
      map.setPaintProperty('unclustered-point', 'circle-opacity', 1)
    }, 1000) // Apply after flyTo animation
  }, [selectedPlaceId, places])

  if (!mapboxgl.accessToken) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zzik-bg text-sm text-zzik-accent-red">
        <div className="text-center">
          <p className="font-semibold">Mapbox 토큰이 설정되지 않았습니다</p>
          <p className="mt-2 text-xs text-zzik-text-muted">
            .env.local 파일에 NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN을 추가하세요
          </p>
        </div>
      </div>
    )
  }

  return <div ref={mapContainerRef} className="h-full w-full" />
}
