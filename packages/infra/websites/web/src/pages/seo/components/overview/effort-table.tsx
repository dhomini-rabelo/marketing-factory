import type { SeoRoundCompetitor } from '@/api/models/seo'
import { MetricBlock } from '@/pages/seo/components/overview/metric-block'
import { EFFORT_COLUMNS } from '@/pages/seo/utils/overview-columns'

type EffortTableProps = {
  competitors: SeoRoundCompetitor[]
}

export function EffortTable({ competitors }: EffortTableProps) {
  return (
    <MetricBlock
      title="Esforço de publicação"
      subtitle="o esforço do concorrente, contexto e não meta"
      competitors={competitors}
      columns={EFFORT_COLUMNS}
    />
  )
}
