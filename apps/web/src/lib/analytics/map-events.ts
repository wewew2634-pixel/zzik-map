// apps/web/src/lib/analytics/map-events.ts
// 클라이언트 이벤트 트래킹 헬퍼
// 현재는 console.log 기반이며, 추후 Amplitude/GA4 등 실제 SDK로 교체 예정

/**
 * /map 페이지 관련 이벤트를 트래킹합니다.
 *
 * @param event - 이벤트 이름 (snake_case 권장)
 * @param payload - 이벤트에 첨부할 메타데이터
 *
 * @example
 * trackMapEvent('map_viewed')
 * trackMapEvent('place_marker_clicked', { placeId: '123' })
 */
export function trackMapEvent(
  event: string,
  payload?: Record<string, unknown>
) {
  // 개발 환경에서만 콘솔 출력
  if (process.env.NODE_ENV === 'development') {
    console.log('[map_event]', event, payload)
  }

  // TODO: 실제 Analytics SDK 통합
  // 예시:
  // amplitude.track(event, payload)
  // gtag('event', event, payload)
}

/**
 * Map 이벤트 타입 정의 (타입 안정성을 위한 명시적 선언)
 */
export const MapEventTypes = {
  // 페이지 진입
  MAP_VIEWED: 'map_viewed',

  // Geolocation
  GEOLOCATION_SUCCESS: 'map_geolocation_success',
  GEOLOCATION_ERROR: 'map_geolocation_error',

  // 필터링
  FILTER_CHANGED: 'map_filter_changed',

  // 인터랙션
  MARKER_CLICKED: 'place_marker_clicked',
  CARD_CLICKED: 'place_card_clicked',
  CLUSTER_CLICKED: 'place_cluster_clicked',
} as const
