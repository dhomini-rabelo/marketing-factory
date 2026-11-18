import type { ComponentProps } from 'react'
import { cn } from '@/layout/utils/styles'

type ButtonVariant = 'primary' | 'secondary'

type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand font-bold text-on-brand',
  secondary: 'bg-card font-semibold shadow-1',
}

export function Button({ variant = 'primary', className, ...buttonProps }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2 px-5.5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...buttonProps}
    />
  )
}
