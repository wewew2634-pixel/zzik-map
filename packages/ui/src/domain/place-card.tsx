import clsx from 'clsx'
import React from 'react'
import { Card } from '../primitives/card'
import { Skeleton } from '../primitives/skeleton'
import { triggerHaptic } from '../lib/haptics'

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
  // Phase 2: 단골지수 & 이득 점수
  loyaltyScore?: number
  benefitScore?: number
  onClick?: () => void
  className?: string
}

export type PlaceCardProps = PlaceCardFeedProps | PlaceCardMapProps

export function PlaceCard(props: PlaceCardProps) {
  // Map variant
  if (props.variant === 'map') {
    const distanceKm = (props.distanceMeters / 1000).toFixed(1)

    // Linear 2025: zinc palette with semantic colors
    const signalColor =
      props.trafficSignal === 'green'
        ? 'bg-green-500'
        : props.trafficSignal === 'yellow'
        ? 'bg-amber-500'
        : 'bg-red-500'

    const handleClick = () => {
      if (props.onClick) {
        triggerHaptic('light')
        props.onClick()
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (props.onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        triggerHaptic('light')
        props.onClick()
      }
    }

    return (
      <Card
        data-testid="place-card"
        data-id={props.id}
        role={props.onClick ? 'button' : undefined}
        tabIndex={props.onClick ? 0 : undefined}
        className={clsx(
          'overflow-hidden',
          // Linear 2025: subtle hover without scale
          'transition-all duration-200 ease-out',
          'hover:bg-zinc-50 dark:hover:bg-zinc-900/50',
          'hover:border-zinc-300 dark:hover:border-zinc-700',
          'focus:outline-none',
          'focus-visible:ring-2 focus-visible:ring-blue-500',
          'focus-visible:ring-offset-2',
          props.onClick && 'cursor-pointer',
          props.className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 p-3">
          {/* 좌측 신호/골드 뱃지 */}
          <div className="flex flex-col items-center gap-2">
            <span
              data-testid={`traffic-dot-${props.trafficSignal === 'green' ? 'success' : props.trafficSignal === 'yellow' ? 'warning' : 'danger'}`}
              className={clsx('h-3 w-3 rounded-full', signalColor)}
            />
            {props.isGold && (
              <span
                data-testid="badge-gold"
                className="rounded-full bg-amber-500/10 border border-amber-500/40 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400"
              >
                GOLD
              </span>
            )}
          </div>

          {/* 중앙 텍스트 */}
          <div className="flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex flex-col">
                <span data-testid="place-name" className="text-sm font-semibold text-zinc-900 dark:text-white">{props.name}</span>
                <span data-testid="place-meta" className="text-xs text-zinc-500">{props.category}</span>
              </div>
              <span className="text-xs text-zinc-500">{distanceKm}km</span>
            </div>

            {/* Phase 2: 단골지수 & 이득 점수 표시 */}
            {(props.loyaltyScore !== undefined || props.benefitScore !== undefined) && (
              <div className="mt-1.5 flex gap-3 text-xs">
                {props.loyaltyScore !== undefined && (
                  <span className="text-zinc-500">
                    단골지수 <span className="font-bold text-base text-amber-600 dark:text-amber-400">{props.loyaltyScore}</span>
                  </span>
                )}
                {props.benefitScore !== undefined && (
                  <span className="text-zinc-500">
                    이득 <span className="font-bold text-zinc-900 dark:text-white">{props.benefitScore}</span>
                  </span>
                )}
              </div>
            )}

            {(props.benefitLabel || props.benefitValue) && (
              <div data-testid="place-reward" className="mt-1 rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs text-zinc-900 dark:text-white">
                <span className="font-medium">{props.benefitLabel}</span>
                {props.benefitValue && <span className="ml-1">· {props.benefitValue}</span>}
              </div>
            )}

            {/* 검증 데이터 - 단골지수가 없을 때만 표시 */}
            {!props.loyaltyScore && props.metrics && (
              <div className="mt-1 flex gap-3 text-xs text-zinc-500">
                <span>검증 방문 {props.metrics.missions}회</span>
                <span>성공률 {props.metrics.successRate}%</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }

  // Feed variant (v4 design with zzik tokens)
  const { image, title, description, tags, rating, distance, onClick, className } = props

  const handleClick = () => {
    if (onClick) {
      triggerHaptic('light')
      onClick()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      triggerHaptic('light')
      onClick()
    }
  }

  return (
    <Card
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={clsx(
        'overflow-hidden transition-colors duration-200',
        'hover:bg-zinc-50 dark:hover:bg-zinc-900/50',
        'focus:outline-none',
        'focus-visible:ring-2 focus-visible:ring-blue-500',
        'focus-visible:ring-offset-2',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="flex gap-3 p-3">
        {/* Image */}
        {image && (
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <img src={image} alt={title} className="h-full w-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {/* Title & Distance */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>
            {distance && <span className="text-xs text-zinc-500">{distance}</span>}
          </div>

          {/* Description */}
          {description && (
            <p className="line-clamp-2 text-xs text-zinc-500">{description}</p>
          )}

          {/* Tags & Rating */}
          <div className="flex items-center gap-2">
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 2).map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {rating !== undefined && (
              <div className="ml-auto flex items-center gap-1">
                <svg className="h-3.5 w-3.5 fill-amber-500" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span className="text-xs font-medium text-zinc-900 dark:text-white">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

/**
 * PlaceCardSkeleton - Loading skeleton for PlaceCard (map variant)
 *
 * Matches the structure of PlaceCard map variant with Linear-grade pulse animation
 */
export function PlaceCardSkeleton({ className }: { className?: string }) {
  return (
    <Card
      data-testid="place-card-skeleton"
      className={clsx('overflow-hidden', className)}
    >
      <div className="flex items-center gap-3 p-3">
        {/* 좌측 신호/골드 뱃지 skeleton */}
        <div className="flex flex-col items-center gap-2">
          <Skeleton variant="circular" width={8} height={8} />
          <Skeleton variant="rectangular" width={50} height={20} className="rounded-full" />
        </div>

        {/* 중앙 텍스트 skeleton */}
        <div className="flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex flex-1 flex-col gap-1">
              <Skeleton variant="text" width="60%" height={14} />
              <Skeleton variant="text" width="40%" height={12} />
            </div>
            <Skeleton variant="text" width={40} height={12} />
          </div>

          {/* 단골지수 & 이득 점수 skeleton */}
          <div className="mt-1 flex gap-2">
            <Skeleton variant="text" width={80} height={12} />
            <Skeleton variant="text" width={60} height={12} />
          </div>
        </div>
      </div>
    </Card>
  )
}
