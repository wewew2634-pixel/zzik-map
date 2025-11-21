'use client'

import clsx from 'clsx'
import React from 'react'

type BottomTabsProps = {
  children: React.ReactNode
  className?: string
}

export function BottomTabs({ children, className }: BottomTabsProps) {
  return (
    <nav
      className={clsx(
        'flex items-center justify-around',
        'border-t border-zinc-800 bg-zinc-900',
        'px-2 pb-safe pt-2',
        className
      )}
    >
      {children}
    </nav>
  )
}

type BottomTabItemProps = {
  icon?: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
  className?: string
}

export function BottomTabItem({ icon, label, active, onClick, className }: BottomTabItemProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-3 py-2',
        'text-xs font-medium transition-colors',
        active
          ? 'text-white'
          : 'text-zinc-400 hover:text-zinc-300',
        className
      )}
    >
      {icon && (
        <div
          className={clsx(
            'flex size-6 items-center justify-center',
            active ? 'text-white' : 'text-zinc-400'
          )}
        >
          {icon}
        </div>
      )}
      <span className="truncate">{label}</span>
    </button>
  )
}
