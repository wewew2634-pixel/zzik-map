/**
 * Place Scoring Library - Phase 2
 *
 * 단골지수 & 이득 점수 계산 로직
 * Phase 3에서 백엔드로 이동할 예정
 *
 * GOLD 기준 (초기 PoV):
 * - N (검증 방문 수): 20 이상
 * - X (재방문율): 30% 이상
 * - Y (리워드/미션 재사용률): 50% 이상
 *
 * 이득 점수 가중치:
 * - 혜택: 40%
 * - 거리: 30%
 * - 신호등: 20%
 * - GOLD: 10%
 */

import type { PlaceSummary, Place60DaysWindow } from '@/types/place'

/**
 * 단골지수 계산 (0-100)
 *
 * 백엔드가 loyaltyScore를 주면 그대로 사용,
 * 없으면 프론트에서 임시 계산
 */
export function deriveLoyaltyScore(place: PlaceSummary): number {
  // 백엔드에서 이미 계산된 값이 있으면 우선 사용
  if (place.loyaltyScore !== undefined) {
    return place.loyaltyScore
  }

  // 프론트 임시 계산 로직
  const missions = place.metrics?.missions ?? 0
  const successRate = place.metrics?.successRate ?? 0 // 0~100
  const isGold = place.isGold
  const signal = place.trafficSignal

  let base = 40

  // 신호등 기여도
  if (signal === 'green') base += 20
  if (signal === 'yellow') base += 5
  if (signal === 'red') base -= 10

  // 방문 횟수 기여도 (최대 50회까지만 반영)
  base += Math.min(missions, 50) * 0.3

  // 성공률 기여도
  base += successRate * 0.2

  // GOLD 보너스
  if (isGold) base += 15

  return Math.max(0, Math.min(100, Math.round(base)))
}

/**
 * 이득 점수 계산 (0-100)
 *
 * 구성 요소:
 * - 혜택(금액/체험) 40%
 * - 거리/접근성 30%
 * - 신호등 20%
 * - GOLD 10%
 */
export function computeBenefitScore(place: PlaceSummary): number {
  // 백엔드에서 이미 계산된 값이 있으면 우선 사용
  if (place.benefitScore !== undefined) {
    return place.benefitScore
  }

  // 1) 혜택 금액 추출 (예: "8,000원 상당 리워드")
  const benefitValueKRW = parseBenefitValue(place.benefitValue)
  const benefitScore = Math.min(1, benefitValueKRW / 10000) // 1만 원 이상이면 1

  // 2) 거리 점수 (0~2km 기준)
  const distance = place.distanceMeters ?? 0
  const distanceScore = Math.max(0, 1 - distance / 2000) // 0m → 1, 2km → 0

  // 3) 신호등 점수
  const signalScore =
    place.trafficSignal === 'green' ? 1 : place.trafficSignal === 'yellow' ? 0.6 : 0.2

  // 4) GOLD 보너스
  const goldBonus = place.isGold ? 1 : 0

  // 가중치
  const wBenefit = 0.4
  const wDistance = 0.3
  const wSignal = 0.2
  const wGold = 0.1

  const raw =
    wBenefit * benefitScore + wDistance * distanceScore + wSignal * signalScore + wGold * goldBonus

  return Math.max(0, Math.min(100, Math.round(raw * 100)))
}

/**
 * 혜택 금액 파싱 (KRW)
 *
 * 예시:
 * - "8,000원" → 8000
 * - "10% 할인" → 0 (금액으로 변환 불가)
 * - undefined → 0
 */
function parseBenefitValue(value?: string): number {
  if (!value) return 0

  // "8,000원", "8000원" 같은 패턴 추출
  const match = value.match(/[\d,]+/)
  if (!match) return 0

  const numStr = match[0].replace(/,/g, '')
  const num = parseInt(numStr, 10)

  return isNaN(num) ? 0 : num
}

/**
 * 재방문율 표시용 계산
 */
export function computeDisplayRevisitRate(place: PlaceSummary): number | null {
  // 백엔드 값 우선
  if (place.revisitRate !== undefined) {
    return Math.round(place.revisitRate * 100) // 0-1 → 0-100%
  }

  // 60일 윈도우 데이터가 있으면
  if (place.last60DaysWindow) {
    const { visits, revisits } = place.last60DaysWindow
    if (visits > 0) {
      return Math.round((revisits / visits) * 100)
    }
  }

  // metrics에서 추정 (missions를 방문으로 가정)
  const missions = place.metrics?.missions ?? 0
  const successRate = place.metrics?.successRate ?? 0

  if (missions >= 10) {
    // 성공률이 높으면 재방문도 어느 정도 있다고 가정
    return Math.round(successRate * 0.5) // 임시 추정
  }

  return null
}

/**
 * GOLD 상태 계산 (Phase 3에서 백엔드 구현)
 *
 * 기준:
 * - 최근 60일 검증 방문 수 ≥ 20
 * - 재방문율 ≥ 30%
 * - 리워드 사용률 ≥ 50%
 */
export function computeIsGold(window: Place60DaysWindow): boolean {
  const { visits, revisits, rewards, rewardIssued } = window

  if (visits < 20) return false

  const revisitRate = visits > 0 ? revisits / visits : 0
  const rewardUseRate = rewardIssued > 0 ? rewards / rewardIssued : 0

  return revisitRate >= 0.3 && rewardUseRate >= 0.5
}

/**
 * Traffic Signal 계산 (Phase 3에서 백엔드 구현)
 *
 * - GREEN: 데이터 충분 + 단골지수 우수
 * - YELLOW: 데이터는 있으나 아직 평가 중
 * - RED: 최근 활동 적음 / 데이터 부족
 */
export function computeTrafficSignal(window: Place60DaysWindow): 'green' | 'yellow' | 'red' {
  const { visits, revisits } = window
  const revisitRate = visits > 0 ? revisits / visits : 0

  if (visits >= 30 && revisitRate >= 0.3) return 'green'
  if (visits >= 10) return 'yellow'
  return 'red'
}
