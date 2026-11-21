import type { SeoRoundDocument } from '@/api/models/seo'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import { formatCount } from '@/pages/seo/utils/format-count'
import { formatKilobytes } from '@/pages/seo/utils/format-number'

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
        <ul className="grid gap-2.5 px-5 pb-5">
          {documents.map((document) => (
            <li key={document.fileName} className="grid gap-0.5 rounded-2 border border-line p-3 text-[13px]">
              <b>{document.title}</b>
              <small className="text-[11.5px] text-ink-3">
                {document.fileName} · {formatKilobytes(document.size)}
              </small>
              <span className="text-ink-2">{document.about}</span>
            </li>
          ))}
        </ul>
      )}
    </OverviewSection>
  )
}
