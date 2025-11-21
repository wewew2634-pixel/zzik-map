import clsx from 'clsx'
import React from 'react'

type CardProps = {
  className?: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={clsx(
        'rounded-xl bg-zinc-900 shadow-sm ring-1 ring-white/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
