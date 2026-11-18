import type { ComponentProps } from 'react'
import { cn } from '@/layout/utils/styles'

export function Textarea({ className, ...textareaProps }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'w-full resize-y rounded-2 border border-field-border bg-card px-3.5 py-3 text-[15px] outline-brand focus:outline-2 focus:outline-offset-1',
        className,
      )}
      {...textareaProps}
    />
  )
}
