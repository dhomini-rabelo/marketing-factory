import type { SeoRoundDocument } from '@/api/models/seo'
import { CompetitorEmpty } from '@/pages/seo/components/competitor/competitor-empty'
import { DocumentsList } from '@/pages/seo/components/overview/documents-list'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import { formatCount } from '@/pages/seo/utils/format-count'

type CompetitorDocumentsProps = {
  name: string
  documents: SeoRoundDocument[]
  hasBlog: boolean
  limits: string
}

export function CompetitorDocuments({ name, documents, hasBlog, limits }: CompetitorDocumentsProps) {
  return (
    <OverviewSection position={17} title="Documentos" note={`${formatCount(documents.length, 'documento', 'documentos')} da rodada que citam ${name}`}>
      {documents.length === 0 ? (
        <CompetitorEmpty message={`Nenhum documento da rodada cita ${name}.`} limits={hasBlog ? '' : limits} />
      ) : (
        <DocumentsList documents={documents} />
      )}
    </OverviewSection>
  )
}
