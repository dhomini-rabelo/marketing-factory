import type { SeoRoundCompetitor } from '@/api/models/seo'
import { MetricLegend } from '@/pages/seo/components/overview/metric-legend'
import { MetricTable } from '@/pages/seo/components/overview/metric-table'
import type { OverviewColumn } from '@/pages/seo/utils/overview-columns'

type MetricBlockProps = {
  title: string
  subtitle: string
  competitors: SeoRoundCompetitor[]
  columns: OverviewColumn[]
}

export function MetricBlock({ title, subtitle, competitors, columns }: MetricBlockProps) {
  return (
    <div className="border-t border-line first:border-t-0">
      <div className="flex items-baseline gap-2.5 px-4 pb-1.5 pt-3">
        <b className="text-[13.5px]">{title}</b>
        <span className="text-xs text-ink-3">{subtitle}</span>
      </div>
      <MetricTable competitors={competitors} columns={columns} />
      <MetricLegend competitors={competitors} columns={columns} />
    </div>
  )
}
