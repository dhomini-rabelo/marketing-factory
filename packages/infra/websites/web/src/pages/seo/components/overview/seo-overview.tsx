import type { SeoRound } from '@/api/models/seo'
import { ComparisonsOverview } from '@/pages/seo/components/overview/comparisons-overview'
import { GoogleSample } from '@/pages/seo/components/overview/google-sample'
import { EffortTable } from '@/pages/seo/components/overview/effort-table'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import { PageTypesTable } from '@/pages/seo/components/overview/page-types-table'
import { PaidToolsStrip } from '@/pages/seo/components/overview/paid-tools-strip'
import { Readings } from '@/pages/seo/components/overview/readings'
import { RoundDocuments } from '@/pages/seo/components/overview/round-documents'
import { TopicsOverview } from '@/pages/seo/components/overview/topics-overview'
import { formatCount } from '@/pages/seo/utils/format-count'
import { sortSeoCompetitors } from '@/pages/seo/utils/sort-seo-competitors'

type SeoOverviewProps = {
  round: SeoRound
}

export function SeoOverview({ round }: SeoOverviewProps) {
  const collectedCompetitors = sortSeoCompetitors(round.competitors).filter((competitor) => competitor.collected)

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
      <ComparisonsOverview competitors={collectedCompetitors} />
      <TopicsOverview competitors={collectedCompetitors} />
      <Readings competitors={collectedCompetitors} />
      <GoogleSample round={round} />
      <RoundDocuments documents={round.documents} />
    </div>
  )
}
