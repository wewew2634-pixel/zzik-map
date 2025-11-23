"use client"

import { Badge } from '@/components/catalyst/badge'

type TrafficSignal = 'GREEN' | 'YELLOW' | 'RED'

type PlaceCardProps = {
  name: string
  category: string
  area: string
  reward: number
  distance?: string
  isGold: boolean
  signal: TrafficSignal
  successRate: number
  missionCount: number
  onClick?: () => void
}

export function PlaceCard(props: PlaceCardProps) {
  const { name, category, area, reward, distance, isGold, signal, successRate, missionCount, onClick } = props

  const signalColor = {
    GREEN: 'bg-green-500',
    YELLOW: 'bg-amber-500',
    RED: 'bg-red-500',
  }[signal]

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-white truncate">
              {name}
            </h3>
            {isGold && (
              <Badge color="amber" className="text-[10px] px-1.5 py-0.5">
                Gold
              </Badge>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            {category} · {area}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
            KRW {reward.toLocaleString()}
          </p>
          {distance && (
            <p className="text-xs text-zinc-500 mt-0.5">
              {distance}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
        <span>{successRate}% success</span>
        <span className="w-px h-3 bg-zinc-300 dark:bg-zinc-700" />
        <span>{missionCount} missions</span>
        <span className="w-px h-3 bg-zinc-300 dark:bg-zinc-700" />
        <div className="flex items-center gap-1.5">
          <div className={`h-1.5 w-1.5 rounded-full ${signalColor}`} />
          <span className="text-[10px]">{signal.toLowerCase()}</span>
        </div>
      </div>
    </button>
  )
}
