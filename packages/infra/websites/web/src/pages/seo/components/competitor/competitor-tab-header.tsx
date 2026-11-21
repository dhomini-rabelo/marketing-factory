import type { SeoRound, SeoRoundCompetitor } from '@/api/models/seo'
import { useSeoTab } from '@/pages/seo/contexts/seo-tab-context'
import { formatCount } from '@/pages/seo/utils/format-count'
import { formatSeoDate } from '@/pages/seo/utils/format-seo-date'
import { readProfileDomain } from '@/pages/seo/utils/seo-profile'
import { SEO_OVERVIEW_TAB } from '@/pages/seo/utils/seo-tab'

type CompetitorTabHeaderProps = {
  competitor: SeoRoundCompetitor
  round: SeoRound
}

export function CompetitorTabHeader({ competitor, round }: CompetitorTabHeaderProps) {
  const { actions } = useSeoTab()
  const profileUrl = typeof competitor.profile?.url === 'string' ? competitor.profile.url : ''

  return (
    <div data-secao="cabecalho-concorrente" className="mt-2.5 flex items-center gap-3.5 rounded-3 bg-card px-4 py-2 shadow-1">
      <h2 className="text-[17px] font-bold">{competitor.name}</h2>
      <div className="flex flex-1 flex-wrap gap-x-3 text-xs text-ink-3">
        {profileUrl && (
          <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand">
            {readProfileDomain(competitor.profile)}
          </a>
        )}
        <span>Coletada em <b className="text-ink-2">{formatSeoDate(round.collectedAt)}</b></span>
        {competitor.pagesRead !== null && <span>{formatCount(competitor.pagesRead, 'página lida', 'páginas lidas')}</span>}
      </div>
      <button type="button" className="text-xs font-semibold text-brand" onClick={() => actions.setActiveTab(SEO_OVERVIEW_TAB)}>
        voltar à visão geral
      </button>
    </div>
  )
}
