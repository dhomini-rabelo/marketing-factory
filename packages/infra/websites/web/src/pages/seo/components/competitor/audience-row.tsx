import type { ReactNode } from 'react'
import { cn } from '@/layout/utils/styles'
import { describeAudienceRole, describeAudienceSize, hasTierDivergence, type SeoAudience } from '@/pages/seo/utils/seo-audiences'

type AudienceRowProps = {
  audience: SeoAudience
  children: ReactNode
}

export function AudienceRow({ audience, children }: AudienceRowProps) {
  const isDivergent = hasTierDivergence(audience)

  return (
    <li
      data-audience={audience.role}
      data-divergent={isDivergent}
      className={cn('grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] items-start gap-2 border-t border-line px-1 py-1.5 text-[13px]', isDivergent && 'bg-attention/10')}
    >
      <div>
        <b>{describeAudienceRole(audience.role)}</b>
        {audience.size !== 'any' && <small className="ml-1 text-ink-3">{describeAudienceSize(audience.size)}</small>}
      </div>
      <div className="min-w-0">{children}</div>
    </li>
  )
}
