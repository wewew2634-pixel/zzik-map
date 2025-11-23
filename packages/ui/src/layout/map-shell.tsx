'use client'

import clsx from 'clsx'
import React from 'react'

type MapShellProps = {
  map?: React.ReactNode
  searchBar?: React.ReactNode
  bottomPanel?: React.ReactNode
  className?: string
}

/**
 * MapShell - Map page layout following zzik.depth design system
 *
 * Structure:
 * - Map Layer (L0/L1 - absolute inset-0)
 * - Search Bar (L2 - absolute top, z-zzik-depth-03)
 * - Bottom Panel (L2 - absolute bottom, z-zzik-depth-02)
 */
export function MapShell({ map, searchBar, bottomPanel, className }: MapShellProps) {
  return (
    <div className={clsx('relative h-full', className)}>
      {/* Map Layer - Full background */}
      <div className="absolute inset-0">
        {map || (
          <div className="h-full w-full bg-[#0B0F1A] flex items-center justify-center text-zzik-text-secondary">
            Map placeholder
          </div>
        )}
      </div>

      {/* Search Bar - Top floating */}
      {searchBar && (
        <div
          className={clsx(
            'absolute inset-x-4 top-3 z-zzik-depth-03',
            'rounded-zzik-depth-md border border-zzik-border-base',
            'bg-zzik-surface-base/95 shadow-zzik-depth-elevation-02',
            'px-3 py-2 flex items-center gap-2 text-[11px]'
          )}
        >
          {searchBar}
        </div>
      )}

      {/* Bottom Panel - List panel */}
      {bottomPanel && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-zzik-depth-02 flex justify-center">
          <div
            className={clsx(
              'pointer-events-auto w-full max-w-md',
              'bg-zzik-surface-base/95 border-t border-zzik-border-base',
              'shadow-zzik-depth-elevation-02',
              'rounded-t-zzik-depth-xl',
              'px-4 pt-3 pb-4'
            )}
          >
            {/* Drag handle */}
            <div className="mb-2 h-1 w-12 mx-auto rounded-full bg-white/14" />
            {bottomPanel}
          </div>
        </div>
      )}
    </div>
  )
}
