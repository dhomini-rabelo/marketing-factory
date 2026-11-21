import type { SeoRoundDocument } from '@/api/models/seo'
import { DocumentsList } from '@/pages/seo/components/overview/documents-list'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import { formatCount } from '@/pages/seo/utils/format-count'

type RoundDocumentsProps = {
  documents: SeoRoundDocument[]
}

export function RoundDocuments({ documents }: RoundDocumentsProps) {
  return (
    <OverviewSection
      position={6}
      title="Documentos anexados à rodada"
      note={`${formatCount(documents.length, 'documento', 'documentos')} · o que não cabe em campo do JSON`}
    >
      {documents.length === 0 ? (
        <p className="px-5 pb-5 text-[13px] text-ink-3">O agente não anexou nada nesta rodada.</p>
      ) : (
        <DocumentsList documents={documents} />
      )}
    </OverviewSection>
  )
}
