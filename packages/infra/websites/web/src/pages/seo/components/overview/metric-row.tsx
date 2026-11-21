import type { SeoRoundCompetitor } from '@/api/models/seo'
import { MetricCell } from '@/pages/seo/components/overview/metric-cell'
import type { OverviewColumn } from '@/pages/seo/utils/overview-columns'
import { readProfileDomain, readProfileNumber } from '@/pages/seo/utils/seo-profile'

type MetricRowProps = {
  competitor: SeoRoundCompetitor
  columns: OverviewColumn[]
  bestValues: Record<string, number | null>
}

export function MetricRow({ competitor, columns, bestValues }: MetricRowProps) {
  return (
    <tr data-competitor={competitor.name}>
      <td className="border-t border-line py-1.5 pl-4 pr-2 text-left">
        <b className="block text-[13.5px] font-bold">{competitor.name}</b>
        <small className="text-[11px] text-ink-3">{readProfileDomain(competitor.profile)}</small>
      </td>
      {columns.map((column) => {
        const value = readProfileNumber(competitor.profile, column.metricKey)
        const isBest = value !== null && value === bestValues[column.id]
        return <MetricCell key={column.id} column={column} competitor={competitor} isBest={isBest} />
      })}
    </tr>
  )
}
