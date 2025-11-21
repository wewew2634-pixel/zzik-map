'use client'

import clsx from 'clsx'
import React from 'react'

type MapShellProps = {
  map?: React.ReactNode
  overlay?: React.ReactNode
  bottomTabs?: React.ReactNode
  className?: string
}

export function MapShell({ map, overlay, bottomTabs, className }: MapShellProps) {
  return (
    <div className={clsx('relative flex h-screen w-full flex-col overflow-hidden', className)}>
      {/* Map Layer - Full screen background */}
      <div className="absolute inset-0 z-0 bg-zinc-900">
        {map || (
          <div className="flex h-full items-center justify-center text-zinc-400">
            <span>Map Placeholder</span>
          </div>
        )}
      </div>

      {/* Overlay Layer - Bottom on mobile, Right on desktop */}
      <div className="pointer-events-none relative z-10 flex h-full flex-col">
        {/* Spacer to push overlay to bottom on mobile */}
        <div className="flex-1" />

        {/* Overlay Content */}
        <div
          className={clsx(
            'pointer-events-auto',
            'flex flex-col',
            // Mobile: bottom sheet
            'max-h-[60vh] rounded-t-2xl bg-zinc-900 shadow-md',
            // Desktop: right panel
            'md:ml-auto md:h-full md:max-h-full md:w-96 md:rounded-none md:rounded-l-2xl'
          )}
        >
          {overlay}
        </div>
      </div>

      {/* Bottom Tabs - Mobile only */}
      {bottomTabs && (
        <div className="pointer-events-auto absolute bottom-0 left-0 right-0 z-20 md:hidden">
          {bottomTabs}
        </div>
      )}
    </div>
  )
}

type MapOverlayProps = {
  children: React.ReactNode
  className?: string
}

export function MapOverlay({ children, className }: MapOverlayProps) {
  return (
    <div className={clsx('flex flex-1 flex-col overflow-hidden', className)}>
      {/* Drag Handle - Mobile only */}
      <div className="flex items-center justify-center py-2 md:hidden">
        <div className="h-1 w-8 rounded-full bg-zinc-700/80" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
    </div>
  )
}
