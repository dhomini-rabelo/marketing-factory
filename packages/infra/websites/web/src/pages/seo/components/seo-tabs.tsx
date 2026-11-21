import type { SeoRoundCompetitor } from '@/api/models/seo'
import { SeoTabButton } from '@/pages/seo/components/seo-tab-button'
import { SEO_OVERVIEW_TAB } from '@/pages/seo/utils/seo-tab'
import { sortSeoCompetitors } from '@/pages/seo/utils/sort-seo-competitors'

type SeoTabsProps = {
  competitors: SeoRoundCompetitor[]
}

export function SeoTabs({ competitors }: SeoTabsProps) {
  return (
    <nav aria-label="Visão geral ou um concorrente" data-secao="abas-concorrentes" className="mt-3 flex flex-wrap gap-1.5">
      <SeoTabButton tab={SEO_OVERVIEW_TAB}>Visão geral</SeoTabButton>
      {sortSeoCompetitors(competitors).map((competitor) => (
        <SeoTabButton key={competitor.name} tab={competitor.name}>
          {competitor.name}
        </SeoTabButton>
      ))}
    </nav>
  )
}
