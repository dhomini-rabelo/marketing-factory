import type { ComponentProps } from 'react'
import { Link } from 'react-router'
import { cn } from '@/layout/utils/styles'

export function CreateProjectButton({ className, ...linkProps }: Omit<ComponentProps<typeof Link>, 'to'>) {
  return (
    <Link
      to="/projects/new"
      className={cn(
        'mt-1.5 flex w-full items-center gap-2 rounded-2 border border-dashed border-white/40 px-3 py-2.5 font-semibold text-white',
        className,
      )}
      {...linkProps}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M7 1v12M1 7h12" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      Novo projeto
    </Link>
  )
}
