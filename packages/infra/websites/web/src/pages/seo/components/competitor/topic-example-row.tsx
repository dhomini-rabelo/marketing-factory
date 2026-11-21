import { formatSeoDate } from '@/pages/seo/utils/format-seo-date'
import { describeAudienceRole } from '@/pages/seo/utils/seo-audiences'
import type { SeoExample } from '@/pages/seo/utils/seo-examples'
import { CELL_CLASS, NUMBER_CELL_CLASS } from '@/pages/seo/utils/table-styles'

type TopicExampleRowProps = {
  example: SeoExample
}

export function TopicExampleRow({ example }: TopicExampleRowProps) {
  return (
    <tr data-example={example.url}>
      <td className={CELL_CLASS}>
        <a href={example.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand">
          {example.title}
        </a>
        {example.cardSummary && (
          <span className="mt-0.5 line-clamp-2 block text-xs text-ink-2">
            <em className="mr-1 text-[10.5px] font-bold not-italic text-ink-3">resumo do card</em>
            {example.cardSummary}
          </span>
        )}
      </td>
      <td className={NUMBER_CELL_CLASS}>{example.publishedAt && formatSeoDate(example.publishedAt)}</td>
      <td className={CELL_CLASS}>{example.author}</td>
      <td className={CELL_CLASS}>
        {example.audienceRole && (
          <span className="rounded-full bg-brand-soft px-2 py-px text-[11px] font-semibold text-brand-deep">
            {describeAudienceRole(example.audienceRole)}
          </span>
        )}
      </td>
    </tr>
  )
}
