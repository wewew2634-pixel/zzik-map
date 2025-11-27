'use client';

import { forwardRef, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ZzikBadge, type VibeCategory } from '../core/ZzikBadge';

export interface RecommendationCardProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  location: string;
  image: string;
  vibeScore?: number;
  vibe?: VibeCategory;
  travelerCount?: number;
  matchPercentage?: number;
  href?: string;
}

export const RecommendationCard = forwardRef<HTMLElement, RecommendationCardProps>(
  (
    {
      className,
      title,
      location,
      image,
      vibeScore,
      vibe,
      travelerCount,
      matchPercentage,
      href,
      ...props
    },
    ref
  ) => {
    const content = (
      <>
        {/* Image */}
        <div className="recommendation-card-image">
          <Image
            src={image}
            alt={title}
            fill
            priority={true}
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3C/svg%3E"
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="recommendation-card-overlay" />

          {matchPercentage && (
            <div className="recommendation-card-badge">
              <ZzikBadge color="primary" size="sm">
                {matchPercentage}% match
              </ZzikBadge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="recommendation-card-content">
          <h3 className="recommendation-card-title">{title}</h3>

          <p className="recommendation-card-location">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            {location}
          </p>

          {/* Stats */}
          <div className="recommendation-card-stats">
            {vibe && (
              <ZzikBadge vibe={vibe} size="sm">
                {vibe.charAt(0).toUpperCase() + vibe.slice(1)}
              </ZzikBadge>
            )}

            {vibeScore !== undefined && (
              <span
                className={cn(
                  'vibe-score',
                  vibeScore >= 80
                    ? 'vibe-score-high'
                    : vibeScore >= 50
                    ? 'vibe-score-medium'
                    : 'vibe-score-low'
                )}
              >
                {vibeScore}%
              </span>
            )}

            {travelerCount && (
              <span className="recommendation-card-stat">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                  />
                </svg>
                {travelerCount.toLocaleString()} travelers
              </span>
            )}
          </div>
        </div>
      </>
    );

    if (href) {
      return (
        <Link
          href={href}
          className={cn('recommendation-card block', className)}
        >
          {content}
        </Link>
      );
    }

    return (
      <article
        ref={ref}
        className={cn('recommendation-card', className)}
        {...props}
      >
        {content}
      </article>
    );
  }
);

RecommendationCard.displayName = 'RecommendationCard';

// Memoized version for performance (prevents re-renders with same props)
export const MemoizedRecommendationCard = memo(RecommendationCard);
