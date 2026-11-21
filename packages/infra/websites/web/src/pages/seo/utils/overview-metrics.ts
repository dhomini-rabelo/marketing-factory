import type { SeoRoundCompetitor } from '@/api/models/seo'
import type { OverviewColumn } from '@/pages/seo/utils/overview-columns'
import { readProfileNumber, readProfileText } from '@/pages/seo/utils/seo-profile'

export type SortDirection = 'asc' | 'desc'

export type NotMeasuredEntry = {
  competitorName: string
  limits: string
  columnNames: string[]
}

export function buildNotMeasuredReason(column: OverviewColumn, competitor: SeoRoundCompetitor): string {
  return `${column.rule}. ${readProfileText(competitor.profile, 'limits')}`
}

export function findBestValues(
  competitors: SeoRoundCompetitor[],
  columns: OverviewColumn[],
): Record<string, number | null> {
  return Object.fromEntries(
    columns.map((column) => {
      const values = competitors
        .map((competitor) => readProfileNumber(competitor.profile, column.metricKey))
        .filter((value): value is number => value !== null)
      const hasMoreThanOneValue = values.length > 1
      const bestValue = column.best === 'max' ? Math.max(...values) : Math.min(...values)
      return [column.id, hasMoreThanOneValue ? bestValue : null]
    }),
  )
}

export function sortByColumn(input: {
  competitors: SeoRoundCompetitor[]
  column: OverviewColumn
  direction: SortDirection
}): SeoRoundCompetitor[] {
  const factor = input.direction === 'asc' ? 1 : -1
  return [...input.competitors].sort((first, second) => {
    const firstValue = readProfileNumber(first.profile, input.column.metricKey)
    const secondValue = readProfileNumber(second.profile, input.column.metricKey)
    if (firstValue === null) return 1
    if (secondValue === null) return -1
    return (firstValue - secondValue) * factor
  })
}

export function listNotMeasured(
  competitors: SeoRoundCompetitor[],
  columns: OverviewColumn[],
): NotMeasuredEntry[] {
  return competitors
    .map((competitor) => ({
      competitorName: competitor.name,
      limits: readProfileText(competitor.profile, 'limits'),
      columnNames: columns
        .filter((column) => readProfileNumber(competitor.profile, column.metricKey) === null)
        .map((column) => column.legendName),
    }))
    .filter((entry) => entry.columnNames.length > 0)
}
