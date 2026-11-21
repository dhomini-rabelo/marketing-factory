import type { SeoRoundCompetitor } from '@/api/models/seo'
import { MetricBlock } from '@/pages/seo/components/overview/metric-block'
import { PAGE_TYPE_COLUMNS } from '@/pages/seo/utils/overview-columns'

type PageTypesTableProps = {
  competitors: SeoRoundCompetitor[]
}

export function PageTypesTable({ competitors }: PageTypesTableProps) {
  return (
    <MetricBlock
      title="Tipos de página e idiomas"
      subtitle="barra = parte do site · só o idioma principal"
      competitors={competitors}
      columns={PAGE_TYPE_COLUMNS}
    />
  )
}
