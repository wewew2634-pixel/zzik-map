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
        // v4 Design: L1 Base layer
        'flex items-center justify-around',
        'border-t border-zzik-border-base bg-zzik-surface-base',
        'shadow-zzik-depth-elevation-01',
        'z-zzik-depth-01',
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
        'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-zzik-depth-sm px-3 py-2',
        'text-xs font-medium transition-colors duration-200',
        active
          ? 'text-zzik-text-primary'
          : 'text-zzik-text-secondary hover:text-zzik-text-primary/80',
        className
      )}
    >
      {icon && (
        <div
          className={clsx(
            'flex size-6 items-center justify-center',
            active ? 'text-zzik-text-primary' : 'text-zzik-text-secondary'
          )}
        >
          {icon}
        </div>
      )}
      <span className="truncate">{label}</span>
    </button>
  )
}
