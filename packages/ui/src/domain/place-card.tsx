import clsx from 'clsx'
import React from 'react'
import { Card } from '../primitives/card'

// Feed variant (기존)
type PlaceCardFeedProps = {
  variant?: 'feed'
  image?: string
  title: string
  description?: string
  tags?: string[]
  rating?: number
  distance?: string
  onClick?: () => void
  className?: string
}

// Map variant (Mapbox 통합용)
export type PlaceMetrics = {
  missions: number
  successRate: number // 0~100 (%)
  likes: number
}

type PlaceCardMapProps = {
  variant: 'map'
  id: string
  name: string
  category: string
  distanceMeters: number
  trafficSignal: 'green' | 'yellow' | 'red'
  isGold: boolean
  benefitLabel?: string
  benefitValue?: string
  metrics?: PlaceMetrics
  onClick?: () => void
  className?: string
}

export type PlaceCardProps = PlaceCardFeedProps | PlaceCardMapProps

export function PlaceCard(props: PlaceCardProps) {
  // Map variant
  if (props.variant === 'map') {
    const distanceKm = (props.distanceMeters / 1000).toFixed(1)

    // 2026 디자인: trafficSignal 색상 채도 낮춤 (emerald/amber/rose)
    const signalColor =
      props.trafficSignal === 'green'
        ? 'bg-emerald-500/80'
        : props.trafficSignal === 'yellow'
        ? 'bg-amber-500/90'
        : 'bg-rose-500/80'

    return (
      <Card
        className={clsx(
          'overflow-hidden transition-colors',
          'hover:bg-zinc-800/50',
          props.onClick && 'cursor-pointer',
          props.className
        )}
        onClick={props.onClick}
      >
        <div className="flex items-center gap-3 p-3">
          {/* 좌측 신호/골드 뱃지 */}
          <div className="flex flex-col items-center gap-2">
            <span className={clsx('h-2 w-2 rounded-full', signalColor)} />
            {props.isGold && (
              <span className="rounded-full border border-amber-500/80 px-2 text-xs font-semibold text-amber-500">
                GOLD
              </span>
            )}
          </div>

          {/* 중앙 텍스트 */}
          <div className="flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{props.name}</span>
                <span className="text-xs text-zinc-400">{props.category}</span>
              </div>
              <span className="text-xs text-zinc-400">{distanceKm}km</span>
            </div>

            {(props.benefitLabel || props.benefitValue) && (
              <div className="mt-1 rounded-lg bg-zinc-800 px-2 py-1 text-xs text-zinc-100">
                <span className="font-medium">{props.benefitLabel}</span>
                {props.benefitValue && <span className="ml-1">· {props.benefitValue}</span>}
              </div>
            )}

            {props.metrics && (
              <div className="mt-1 flex gap-3 text-xs text-zinc-400">
                <span>미션 {props.metrics.missions}회</span>
                <span>성공률 {props.metrics.successRate}%</span>
                <span>좋아요 {props.metrics.likes}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }

  // Feed variant (기존 로직 유지)
  const { image, title, description, tags, rating, distance, onClick, className } = props

  return (
    <Card
      className={clsx('overflow-hidden transition-shadow hover:shadow-md', onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      <div className="flex gap-3 p-3">
        {/* Image */}
        {image && (
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-800">
            <img src={image} alt={title} className="h-full w-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {/* Title & Distance */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-white">{title}</h3>
            {distance && <span className="text-xs text-zinc-400">{distance}</span>}
          </div>

          {/* Description */}
          {description && (
            <p className="line-clamp-2 text-xs text-zinc-400">{description}</p>
          )}

          {/* Tags & Rating */}
          <div className="flex items-center gap-2">
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 2).map((tag, i) => (
                  <span
                    key={i}
                    className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {rating !== undefined && (
              <div className="ml-auto flex items-center gap-1">
                <span className="text-amber-500">★</span>
                <span className="text-xs font-medium text-white">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
