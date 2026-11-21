import { CompetitorEmpty } from '@/pages/seo/components/competitor/competitor-empty'
import { ComparisonsTable } from '@/pages/seo/components/overview/comparisons-table'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import { formatCount } from '@/pages/seo/utils/format-count'
import { buildNoComparisonsMessage, readComparisons } from '@/pages/seo/utils/seo-comparisons'

type CompetitorComparisonsProps = {
  comparisons: object[]
  profile: Record<string, unknown>
  limits: string
}

export function CompetitorComparisons({ comparisons, profile, limits }: CompetitorComparisonsProps) {
  const rows = readComparisons(comparisons)

  return (
    <OverviewSection position={12} title="Comparações" note={`tabela completa · ${formatCount(rows.length, 'página', 'páginas')} de comparação e alternativas`}>
      {rows.length === 0 ? (
        <CompetitorEmpty message={buildNoComparisonsMessage(profile)} limits={limits} />
      ) : (
        <div className="px-5 pb-4">
          <ComparisonsTable comparisons={rows} />
        </div>
      )}
    </OverviewSection>
  )
}
