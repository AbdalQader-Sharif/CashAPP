import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-md transition dark:border-slate-700 dark:bg-slate-900/80',
        className
      )}
      {...props}
    />
  )
}
