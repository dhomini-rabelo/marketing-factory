import type { SeoRoundCompetitor } from '@/api/models/seo'
import { NotMeasured } from '@/pages/seo/components/overview/not-measured'
import { readProfileText } from '@/pages/seo/utils/seo-profile'

const NO_READING_REASON = 'sem sitemap'

type ReadingCardProps = {
  competitor: SeoRoundCompetitor
}

export function ReadingCard({ competitor }: ReadingCardProps) {
  const reading = readProfileText(competitor.profile, 'dominantTopics')
  const limits = readProfileText(competitor.profile, 'limits')

  return (
    <article data-competitor={competitor.name} className="grid min-w-0 content-start gap-2 rounded-2 border border-line p-3.5">
      <h4 className="text-[13px] font-bold">{competitor.name}</h4>
      <p className="text-[13px] leading-relaxed">{reading || <NotMeasured reason={NO_READING_REASON} />}</p>
      {limits && (
        <p className="rounded-1 bg-code-bg px-2.5 py-2 text-[12px] text-ink-2">
          <b>Limites da coleta.</b> {limits}
        </p>
      )}
    </article>
  )
}
