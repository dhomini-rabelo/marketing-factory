import type { SeoRoundDocument } from '@/api/models/seo'
import { formatKilobytes } from '@/pages/seo/utils/format-number'

type DocumentsListProps = {
  documents: SeoRoundDocument[]
}

export function DocumentsList({ documents }: DocumentsListProps) {
  return (
    <ul className="grid gap-2.5 px-5 pb-5">
      {documents.map((document) => (
        <li key={document.fileName} className="rounded-2 border border-line text-[13px]">
          <details>
            <summary className="grid cursor-pointer gap-0.5 p-3">
              <b>{document.title}</b>
              <small className="text-[11.5px] text-ink-3">
                {document.fileName} · {formatKilobytes(document.size)}
              </small>
              <span className="text-ink-2">{document.about}</span>
              <span className="text-[11.5px] font-semibold text-brand">ler aqui</span>
            </summary>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap border-t border-line p-3 text-[12px] text-ink-2">
              {document.body}
            </pre>
          </details>
        </li>
      ))}
    </ul>
  )
}
