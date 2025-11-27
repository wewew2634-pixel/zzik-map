'use client';

import clsx from 'clsx';
import type React from 'react';
import Link from 'next/link';

/**
 * Breadcrumb Navigation Component (Phase 4)
 *
 * Provides hierarchical navigation context showing current page position
 * WCAG 2.1 Success Criterion 2.4.8: Location information
 *
 * Usage:
 *   <Breadcrumbs items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Explore', href: '/explore' },
 *     { label: 'Tokyo', current: true }
 *   ]} />
 */

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  ariaLabel?: string;
}

export function Breadcrumbs({
  items,
  className,
  ariaLabel = 'Breadcrumb'
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={clsx(className, 'flex items-center gap-2')}
    >
      <ol className="flex items-center gap-2 list-none">
        {items.map((item, index) => (
          <li key={`breadcrumb-${index}`} className="flex items-center gap-2">
            {/* Previous items are links */}
            {!item.current && item.href ? (
              <Link
                href={item.href}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              /* Current item is plain text */
              <span
                className="text-sm text-gray-700 dark:text-gray-300"
                aria-current={item.current ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}

            {/* Separator (not on last item) */}
            {index < items.length - 1 && (
              <span
                aria-hidden="true"
                className="text-gray-400 dark:text-gray-600"
              >
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Breadcrumb with schema.org structured data
 * Helps search engines understand page hierarchy
 */
export function BreadcrumbsWithSchema({
  items,
  className,
}: BreadcrumbsProps) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.label,
      'item': item.href ? `${typeof window !== 'undefined' ? window.location.origin : ''}${item.href}` : undefined,
    }))
  };

  return (
    <>
      <Breadcrumbs items={items} className={className} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </>
  );
}
