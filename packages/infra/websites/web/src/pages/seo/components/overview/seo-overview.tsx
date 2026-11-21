import type { SeoRoundCompetitor } from '@/api/models/seo'
import { EffortTable } from '@/pages/seo/components/overview/effort-table'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import { PageTypesTable } from '@/pages/seo/components/overview/page-types-table'
import { PaidToolsStrip } from '@/pages/seo/components/overview/paid-tools-strip'
import { formatCount } from '@/pages/seo/utils/format-count'
import { sortSeoCompetitors } from '@/pages/seo/utils/sort-seo-competitors'

type SeoOverviewProps = {
  competitors: SeoRoundCompetitor[]
}

export function SeoOverview({ competitors }: SeoOverviewProps) {
  const collectedCompetitors = sortSeoCompetitors(competitors).filter((competitor) => competitor.collected)

  return (
    <div data-secao="visao-geral">
      <OverviewSection
        position={1}
        title="Comparativo dos concorrentes"
        note={`${formatCount(collectedCompetitors.length, 'concorrente', 'concorrentes')} · clique no título de uma coluna para ordenar`}
      >
        <EffortTable competitors={collectedCompetitors} />
        <PageTypesTable competitors={collectedCompetitors} />
      </OverviewSection>
      <PaidToolsStrip />
    </div>
  )
}
