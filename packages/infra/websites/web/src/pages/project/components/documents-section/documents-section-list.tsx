import type { DocumentSummary } from '@/api/models/document'
import { DocumentItem } from '@/pages/project/components/document-item/document-item'

type DocumentsSectionListProps = {
  projectId: string
  documents: DocumentSummary[]
}

function formatCount(total: number): string {
  return total === 1 ? '1 documento' : `${total} documentos`
}

export function DocumentsSectionList({ projectId, documents }: DocumentsSectionListProps) {
  return (
    <section aria-label="Documentos" className="pt-5">
      <div className="mb-3 flex items-baseline gap-3">
        <h2 className="font-brand text-xl font-extrabold">O que o agente levantou</h2>
        <span className="text-[13px] text-ink-2">{formatCount(documents.length)}</span>
      </div>
      <ul className="overflow-hidden rounded-3 bg-card shadow-1">
        {documents.map((document) => (
          <DocumentItem key={document.slug} projectId={projectId} document={document} />
        ))}
      </ul>
    </section>
  )
}
