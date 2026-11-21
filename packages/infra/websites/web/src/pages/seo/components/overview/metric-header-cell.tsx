import { ConfidenceMark } from '@/pages/seo/components/overview/confidence-mark'
import { cn } from '@/layout/utils/styles'
import type { OverviewColumn } from '@/pages/seo/utils/overview-columns'
import type { SortDirection } from '@/pages/seo/utils/overview-metrics'

type MetricHeaderCellProps = {
  column: OverviewColumn
  sortDirection: SortDirection | null
  isSortable: boolean
  onSort: () => void
}

const SORT_ARROWS: Record<SortDirection, string> = { asc: '↑', desc: '↓' }
const ARIA_SORT: Record<SortDirection, 'ascending' | 'descending'> = { asc: 'ascending', desc: 'descending' }

export function MetricHeaderCell({ column, sortDirection, isSortable, onSort }: MetricHeaderCellProps) {
  return (
    <th
      scope="col"
      aria-sort={sortDirection ? ARIA_SORT[sortDirection] : undefined}
      className={cn('bg-code-bg px-2 py-1 text-right align-bottom text-[11.5px] font-bold leading-tight text-ink-3', column.hasSeparator && 'border-l border-l-line')}
    >
      {isSortable ? (
        <button type="button" title="Clique para ordenar" onClick={onSort} className="cursor-pointer font-bold text-ink-2">
          {column.label}
          {sortDirection ? ` ${SORT_ARROWS[sortDirection]}` : ' ↕'}
        </button>
      ) : (
        column.label
      )}
      <ConfidenceMark level={column.confidence} />
    </th>
  )
}
