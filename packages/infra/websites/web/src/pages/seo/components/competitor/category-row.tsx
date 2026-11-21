import { NotMeasured } from '@/pages/seo/components/overview/not-measured'
import { formatDecimal, formatNumber } from '@/pages/seo/utils/format-number'
import { formatSeoDate } from '@/pages/seo/utils/format-seo-date'
import { describeCategorySource, type SeoCategory } from '@/pages/seo/utils/seo-categories'
import { describeMissingReason } from '@/pages/seo/utils/seo-limits'
import { CELL_CLASS, NUMBER_CELL_CLASS } from '@/pages/seo/utils/table-styles'

const MINIMUM_HINT = 'A última página lida veio toda dentro de 90 dias: o ritmo real é igual ou maior que este valor'

type CategoryRowProps = {
  category: SeoCategory
  limits: string
}

type CountCellProps = {
  value: number | null
  isMinimum?: boolean
  isDecimal?: boolean
}

function CountCell({ value, isMinimum = false, isDecimal = false }: CountCellProps) {
  if (value === null) {
    return (
      <td className={NUMBER_CELL_CLASS}>
        <NotMeasured label="sem data" reason="nenhum card com data" />
      </td>
    )
  }
  return (
    <td className={NUMBER_CELL_CLASS}>
      {isDecimal ? formatDecimal(value) : formatNumber(value)}
      {isMinimum && (
        <span title={MINIMUM_HINT} className="ml-1 cursor-help rounded-1 border border-attention/30 bg-attention/10 px-1 text-[10px] font-bold text-attention">
          mín.
        </span>
      )}
    </td>
  )
}

export function CategoryRow({ category, limits }: CategoryRowProps) {
  const sourceLabel = describeCategorySource(category.source)

  return (
    <tr data-category={category.name}>
      <td className={CELL_CLASS}>
        <b>{category.url ? <a href={category.url} target="_blank" rel="noopener noreferrer" className="text-brand">{category.name}</a> : category.name}</b>
        <span className="block text-[11px] text-ink-3">
          {category.term ? `${sourceLabel} · termo ${category.term}` : sourceLabel}
        </span>
      </td>
      <CountCell value={category.posts30d} />
      <CountCell value={category.posts90d} />
      <CountCell value={category.postsPerWeek} isDecimal isMinimum={category.isMinimumRate} />
      <CountCell value={category.postsPerMonth} isDecimal isMinimum={category.isMinimumRate} />
      <td className={NUMBER_CELL_CLASS}>
        {category.newestPostDate ? formatSeoDate(category.newestPostDate) : <NotMeasured label="sem data" reason="nenhum card com data" />}
      </td>
      <td className={NUMBER_CELL_CLASS}>{formatNumber(category.postsListed)}</td>
      <td className={CELL_CLASS}>
        {category.subtopics.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {category.subtopics.map((subtopic) => (
              <span key={subtopic.label} className="rounded-full bg-code-bg px-2 py-px text-xs text-ink-2">
                {subtopic.label} <b className="tabular-nums text-ink">{subtopic.count}</b>
              </span>
            ))}
          </div>
        ) : (
          <NotMeasured label="não coletado" reason={describeMissingReason(limits, 'subtopics')} />
        )}
      </td>
    </tr>
  )
}
