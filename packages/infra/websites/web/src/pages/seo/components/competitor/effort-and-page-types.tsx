import type { SeoRoundCompetitor } from '@/api/models/seo'
import { EffortTable } from '@/pages/seo/components/overview/effort-table'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import { PageTypesTable } from '@/pages/seo/components/overview/page-types-table'

type EffortAndPageTypesProps = {
  competitor: SeoRoundCompetitor
}

export function EffortAndPageTypes({ competitor }: EffortAndPageTypesProps) {
  const competitors = [competitor]

  return (
    <OverviewSection position={1} title="Esforço e tipos de página" note="os números só dele">
      <EffortTable competitors={competitors} />
      <PageTypesTable competitors={competitors} />
    </OverviewSection>
  )
}
