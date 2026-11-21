import { useDismissOnOutsideClick } from '@/layout/hooks/use-dismiss-on-outside-click'
import { formatCount } from '@/pages/seo/utils/format-count'
import { formatSeoDate } from '@/pages/seo/utils/format-seo-date'
import { describeAudienceRole, describeAudienceSize } from '@/pages/seo/utils/seo-audiences'
import { listExamplesOfAudience, type SeoExample } from '@/pages/seo/utils/seo-examples'
import { CELL_CLASS, HEAD_CELL_CLASS, NUMBER_CELL_CLASS, NUMBER_HEAD_CELL_CLASS } from '@/pages/seo/utils/table-styles'

type AudienceExamplesDialogProps = {
  competitorName: string
  audienceRole: string
  examples: SeoExample[]
  onClose: () => void
}

export function AudienceExamplesDialog({ competitorName, audienceRole, examples, onClose }: AudienceExamplesDialogProps) {
  const panelRef = useDismissOnOutsideClick(true, onClose)
  const audienceExamples = listExamplesOfAudience(examples, audienceRole)
  const title = `Exemplos de ${describeAudienceRole(audienceRole)} em ${competitorName}`

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-6">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col rounded-3 bg-card shadow-2"
      >
        <header className="flex items-start justify-between gap-3 px-5 py-4">
          <div>
            <h3 className="text-[15px] font-bold">{title}</h3>
            <p className="text-xs text-ink-3">{formatCount(audienceExamples.length, 'exemplo', 'exemplos')}, todos os portes</p>
          </div>
          <button type="button" aria-label="Fechar" className="text-lg font-bold text-ink-3" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="min-h-0 overflow-y-auto px-5 pb-5">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className={HEAD_CELL_CLASS}>Título</th>
                <th className={NUMBER_HEAD_CELL_CLASS}>Data</th>
                <th className={HEAD_CELL_CLASS}>Tema</th>
                <th className={HEAD_CELL_CLASS}>Porte</th>
              </tr>
            </thead>
            <tbody>
              {audienceExamples.map((example) => (
                <tr key={example.url} data-example={example.url}>
                  <td className={CELL_CLASS}>
                    <a href={example.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand">
                      {example.title}
                    </a>
                  </td>
                  <td className={NUMBER_CELL_CLASS}>{example.publishedAt ? formatSeoDate(example.publishedAt) : 'sem data'}</td>
                  <td className={CELL_CLASS}>{example.category}</td>
                  <td className={`${CELL_CLASS} whitespace-nowrap`}>{describeAudienceSize(example.audienceSize)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
