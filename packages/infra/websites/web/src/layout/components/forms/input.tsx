import type { ComponentProps } from 'react'
import { cn } from '@/layout/utils/styles'

export function Input({ className, ...inputProps }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'w-full rounded-2 border border-field-border bg-card px-3.5 py-3 text-[15px] outline-brand focus:outline-2 focus:outline-offset-1',
        className,
      )}
      {...inputProps}
    />
  )
}
