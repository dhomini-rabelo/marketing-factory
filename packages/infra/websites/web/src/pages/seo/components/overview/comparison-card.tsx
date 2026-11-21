import type { SeoRoundCompetitor } from '@/api/models/seo'
import { formatCount } from '@/pages/seo/utils/format-count'
import { formatNumber } from '@/pages/seo/utils/format-number'
import {
  buildNoComparisonsMessage,
  formatComparisonFormat,
  formatRivals,
  MAX_VISIBLE_COMPARISONS,
  readComparisons,
} from '@/pages/seo/utils/seo-comparisons'
import { readProfileNumber } from '@/pages/seo/utils/seo-profile'

type ComparisonCardProps = {
  competitor: SeoRoundCompetitor
  onShowAll: (competitorName: string) => void
}

export function ComparisonCard({ competitor, onShowAll }: ComparisonCardProps) {
  const comparisons = readComparisons(competitor.comparisons)
  const totalPages = readProfileNumber(competitor.profile, 'pagesComparison')

  return (
    <article data-competitor={competitor.name} className="grid min-w-0 content-start gap-2.5 rounded-2 border border-line p-3.5">
      <header className="flex items-baseline gap-2">
        <b className="text-[26px] font-extrabold leading-none tabular-nums">{totalPages === null ? 'não medido' : formatNumber(totalPages)}</b>
        <span className="text-[12.5px] text-ink-3">
          {competitor.name}
          {totalPages === null ? '' : ` · ${formatCount(totalPages, 'página', 'páginas')}`}
        </span>
      </header>
      {comparisons.length === 0 ? (
        <p className="text-[13px] text-ink-3">{buildNoComparisonsMessage(competitor.profile)}</p>
      ) : (
        <>
          <ul className="grid gap-1.5">
            {comparisons.slice(0, MAX_VISIBLE_COMPARISONS).map((comparison) => (
              <li key={comparison.url} className="grid min-w-0 gap-px text-[13px]">
                <b>{comparison.slug}</b>
                <small className="text-[11.5px] text-ink-3">
                  {formatComparisonFormat(comparison.format)}
                  {comparison.rivals.length > 0 && ` · ${formatRivals(comparison.rivals)}`}
                </small>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="justify-self-start text-[12.5px] font-semibold text-brand"
            onClick={() => onShowAll(competitor.name)}
          >
            ver todas ({formatNumber(comparisons.length)})
          </button>
        </>
      )}
    </article>
  )
}
