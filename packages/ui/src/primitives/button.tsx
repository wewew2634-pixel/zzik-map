import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, { forwardRef } from 'react'
import { triggerHaptic } from '../lib/haptics'

const styles = {
  base: [
    // v4 Design: Base button styles with depth tokens
    'relative isolate inline-flex items-center justify-center gap-x-2',
    'rounded-zzik-depth-sm border text-sm/6 font-semibold',
    // Linear-grade: fast transitions with scale
    'transition-all duration-zzik-fast ease-zzik-ease',
    'hover:scale-zzik-hover',
    'active:scale-zzik-press',
    'focus:outline-none',
    'focus-visible:ring-2 focus-visible:ring-zzik-accent-gold',
    'focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:hover:scale-100',
  ],
  size: {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  },
  variant: {
    solid: [
      'border-transparent bg-zzik-surface-content text-zzik-text-primary',
      'before:absolute before:inset-0 before:-z-10 before:rounded-zzik-depth-sm before:bg-zzik-surface-content',
      'before:shadow-zzik-depth-elevation-02 before:transition-shadow before:duration-zzik-fast',
      'hover:bg-zzik-surface-base hover:before:shadow-zzik-depth-elevation-03',
    ],
    outline: [
      'border-zzik-border-content text-zzik-text-primary',
      'hover:bg-zzik-surface-base',
    ],
    ghost: [
      'border-transparent text-zzik-text-primary',
      'hover:bg-zzik-surface-base',
    ],
  },
}

type ButtonProps = {
  variant?: 'solid' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  className?: string
  children: React.ReactNode
} & Headless.ButtonProps

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'solid', size = 'md', fullWidth = false, className, children, onClick, ...props },
  ref
) {
  const classes = clsx(
    styles.base,
    styles.size[size],
    styles.variant[variant],
    fullWidth && 'w-full',
    className, // className comes last to allow overrides
  )

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerHaptic('medium')
    onClick?.(e)
  }

  return (
    <Headless.Button {...props} className={classes} ref={ref} onClick={handleClick}>
      {children}
    </Headless.Button>
  )
})
