import type { ComponentProps } from 'react'
import { Link } from 'react-router'
import { cn } from '@/layout/utils/styles'

type CreateProjectButtonVariant = 'dashed' | 'menu'

type CreateProjectButtonProps = Omit<ComponentProps<typeof Link>, 'to'> & {
  variant?: CreateProjectButtonVariant
}

const VARIANT_CLASSES: Record<CreateProjectButtonVariant, string> = {
  dashed: 'mt-1.5 gap-2 rounded-2 border border-dashed border-white/40 px-3 py-2.5 font-semibold text-white',
  menu: 'min-h-[38px] gap-2.5 rounded-[8px] px-2 py-1.5 text-sm font-medium text-ink hover:bg-bg',
}

export function CreateProjectButton({ variant = 'dashed', className, ...linkProps }: CreateProjectButtonProps) {
  return (
    <Link to="/projects/new" className={cn('flex w-full items-center', VARIANT_CLASSES[variant], className)} {...linkProps}>
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      Novo projeto
    </Link>
  )
}
