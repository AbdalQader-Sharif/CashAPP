import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}
