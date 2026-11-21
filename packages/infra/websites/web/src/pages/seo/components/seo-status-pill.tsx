import { SeoRoundStatus } from '@/api/models/seo'
import { SEO_STATUS_LABELS } from '@/pages/seo/utils/seo-labels'

type SeoStatusPillProps = {
  status: SeoRoundStatus
}

const PILL_CLASSES: Record<SeoRoundStatus, string> = {
  [SeoRoundStatus.COMPLETE]: 'bg-brand-soft text-support',
  [SeoRoundStatus.PARTIAL]: 'bg-code-bg text-attention',
}

export function SeoStatusPill({ status }: SeoStatusPillProps) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PILL_CLASSES[status]}`}>
      {SEO_STATUS_LABELS[status]}
    </span>
  )
}
