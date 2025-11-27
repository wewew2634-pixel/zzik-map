/**
 * ZZIK MAP - Catalyst Link Component (Next.js Integration)
 * V3: Properly integrated with Next.js Link component
 */

'use client'

import * as Headless from '@headlessui/react'
import NextLink, { type LinkProps as NextLinkProps } from 'next/link'
import React, { forwardRef } from 'react'

type LinkProps = Omit<NextLinkProps, 'href'> & {
  href: string
} & Omit<React.ComponentPropsWithoutRef<'a'>, 'href'>

export const Link = forwardRef(function Link(
  { href, ...props }: LinkProps,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  return (
    <Headless.DataInteractive>
      <NextLink href={href} {...props} ref={ref} />
    </Headless.DataInteractive>
  )
})
