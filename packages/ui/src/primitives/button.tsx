import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, { forwardRef } from 'react'

const styles = {
  base: [
    'relative isolate inline-flex items-center justify-center gap-x-2 rounded-lg border text-sm/6 font-semibold',
    'px-3 py-1.5 sm:px-2.5 sm:py-1',
    'focus:outline-2 focus:outline-offset-2 focus:outline-zinc-500',
    'disabled:opacity-50',
  ],
  solid: [
    'border-transparent bg-zinc-900 text-white',
    'before:absolute before:inset-0 before:-z-10 before:rounded-lg before:bg-zinc-900',
    'before:shadow-sm',
    'hover:bg-zinc-800',
    'dark:bg-zinc-700 dark:hover:bg-zinc-600',
  ],
  outline: [
    'border-zinc-950/10 text-zinc-950',
    'hover:bg-zinc-950/2.5',
    'dark:border-white/15 dark:text-white dark:hover:bg-white/5',
  ],
  ghost: [
    'border-transparent text-zinc-950',
    'hover:bg-zinc-950/5',
    'dark:text-white dark:hover:bg-white/10',
  ],
}

type ButtonProps = {
  variant?: 'solid' | 'outline' | 'ghost'
  className?: string
  children: React.ReactNode
} & Headless.ButtonProps

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'solid', className, children, ...props },
  ref
) {
  const variantStyles = variant === 'outline' ? styles.outline : variant === 'ghost' ? styles.ghost : styles.solid

  const classes = clsx(className, styles.base, variantStyles)

  return (
    <Headless.Button {...props} className={classes} ref={ref}>
      {children}
    </Headless.Button>
  )
})
