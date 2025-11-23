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
        // v4 Design: L2 Content layer with depth tokens
        'rounded-zzik-depth-md bg-zzik-surface-content',
        'border border-zzik-border-content',
        'shadow-zzik-depth-elevation-02',
        'z-zzik-depth-02',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
