'use client';

import { forwardRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { VibeScore } from '../vibe/VibeScore';
import { VibeBadge } from '../vibe/VibeBadge';
import type { VibeCategory } from '../core/ZzikBadge';

export interface MapPopupProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  image?: string;
  vibeScore?: number;
  vibe?: VibeCategory;
  showArrow?: boolean;
  onClose?: () => void;
}

export const MapPopup = forwardRef<HTMLDivElement, MapPopupProps>(
  (
    {
      className,
      title,
      subtitle,
      image,
      vibeScore,
      vibe,
      showArrow = true,
      onClose,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('map-popup', className)}
        role="dialog"
        aria-label={title}
        {...props}
      >
        {/* Header with image */}
        <div className="map-popup-header">
          {image && (
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src={image}
                alt={title}
                fill
                placeholder="blur"
                blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect fill='%23e5e7eb' width='48' height='48'/%3E%3C/svg%3E"
                className="map-popup-image object-cover"
                sizes="48px"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="map-popup-title truncate">{title}</h4>
            {subtitle && (
              <p className="map-popup-subtitle truncate">{subtitle}</p>
            )}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-[var(--interactive-ghost-hover)] transition-colors"
              aria-label="Close popup"
            >
              <svg
                className="w-4 h-4 text-[var(--text-tertiary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        {children && <div className="map-popup-content">{children}</div>}

        {/* Footer with vibe info */}
        {(vibeScore !== undefined || vibe) && (
          <div className="map-popup-footer">
            {vibe && <VibeBadge vibe={vibe} size="sm" />}
            {vibeScore !== undefined && (
              <VibeScore score={vibeScore} size="sm" />
            )}
          </div>
        )}

        {/* Arrow */}
        {showArrow && <div className="map-popup-arrow" />}
      </div>
    );
  }
);

MapPopup.displayName = 'MapPopup';
