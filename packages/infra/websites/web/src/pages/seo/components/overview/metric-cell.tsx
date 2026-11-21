import type { SeoRoundCompetitor } from '@/api/models/seo'
import { NotMeasured } from '@/pages/seo/components/overview/not-measured'
import { cn } from '@/layout/utils/styles'
import type { OverviewColumn } from '@/pages/seo/utils/overview-columns'
import { buildNotMeasuredReason } from '@/pages/seo/utils/overview-metrics'
import { readProfileNumber } from '@/pages/seo/utils/seo-profile'

type MetricCellProps = {
  column: OverviewColumn
  competitor: SeoRoundCompetitor
  isBest: boolean
}

export function MetricCell({ column, competitor, isBest }: MetricCellProps) {
  const value = readProfileNumber(competitor.profile, column.metricKey)
  const cellClassName = cn(
    'border-t border-line px-2 py-1.5 text-right tabular-nums',
    column.hasSeparator && 'border-l border-l-line',
    isBest && 'bg-support-soft',
  )

  if (value === null) {
    return (
      <td className={cellClassName} data-value="">
        <NotMeasured reason={buildNotMeasuredReason(column, competitor)} />
      </td>
    )
  }

  const content = column.describe(competitor.profile, value)

  return (
    <td className={cellClassName} data-value={value} data-best={isBest ? 'true' : undefined}>
      <b title={content.hint ?? undefined} className={cn('text-[15px] font-extrabold', isBest && 'text-support')}>
        {content.main}
        {content.badge && (
          <span className="ml-1 rounded-1 bg-support-soft px-1 text-[10.5px] font-bold text-support">{content.badge}</span>
        )}
      </b>
      {content.detail && <small className="ml-1.5 text-[11px] font-medium text-ink-3">{content.detail}</small>}
      {content.siteShare !== null && (
        <span title={content.hint ?? undefined} className="ml-2 inline-block h-1 w-14 overflow-hidden rounded-full bg-line align-middle">
          <i className="block h-full min-w-0.5 bg-brand" style={{ width: `${content.siteShare}%` }} />
        </span>
      )}
    </td>
  )
}
