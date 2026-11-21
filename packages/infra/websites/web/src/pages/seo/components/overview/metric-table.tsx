import { useState } from 'react'
import type { SeoRoundCompetitor } from '@/api/models/seo'
import { MetricHeaderCell } from '@/pages/seo/components/overview/metric-header-cell'
import { MetricRow } from '@/pages/seo/components/overview/metric-row'
import type { OverviewColumn } from '@/pages/seo/utils/overview-columns'
import { findBestValues, sortByColumn, type SortDirection } from '@/pages/seo/utils/overview-metrics'

type MetricTableProps = {
  competitors: SeoRoundCompetitor[]
  columns: OverviewColumn[]
}

type SortState = {
  columnId: string | null
  direction: SortDirection
}

export function MetricTable({ competitors, columns }: MetricTableProps) {
  const [sortState, setSortState] = useState<SortState>({ columnId: null, direction: 'asc' })
  const isSortable = competitors.length > 1
  const sortedColumn = columns.find((column) => column.id === sortState.columnId)
  const rows = sortedColumn ? sortByColumn({ competitors, column: sortedColumn, direction: sortState.direction }) : competitors
  const bestValues = isSortable ? findBestValues(competitors, columns) : {}

  function handleSort(columnId: string) {
    const isSameColumn = sortState.columnId === columnId
    const nextDirection = isSameColumn && sortState.direction === 'asc' ? 'desc' : 'asc'
    setSortState({ columnId, direction: nextDirection })
  }

  return (
    <table className="w-full table-fixed border-collapse text-[13px]">
      <colgroup>
        <col className="w-[220px]" />
      </colgroup>
      <thead>
        <tr>
          <th scope="col" className="bg-code-bg py-1 pl-4 pr-2 text-left align-bottom text-[11.5px] font-bold text-ink-3">
            Concorrente
          </th>
          {columns.map((column) => (
            <MetricHeaderCell
              key={column.id}
              column={column}
              isSortable={isSortable}
              sortDirection={sortState.columnId === column.id ? sortState.direction : null}
              onSort={() => handleSort(column.id)}
            />
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((competitor) => (
          <MetricRow key={competitor.name} competitor={competitor} columns={columns} bestValues={bestValues} />
        ))}
      </tbody>
    </table>
  )
}
