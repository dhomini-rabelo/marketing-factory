import { CompetitorEmpty } from '@/pages/seo/components/competitor/competitor-empty'
import { ItemNumberCell } from '@/pages/seo/components/competitor/item-number-cell'
import { SampleItemLabel } from '@/pages/seo/components/competitor/sample-item-label'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import type { SeoSampleItem } from '@/pages/seo/utils/seo-items'
import { CELL_CLASS, HEAD_CELL_CLASS, NUMBER_HEAD_CELL_CLASS } from '@/pages/seo/utils/table-styles'

const COLUMNS = [
  { field: 'words', label: 'Palavras' },
  { field: 'paragraphs', label: 'Parágrafos' },
  { field: 'wordsPerParagraph', label: 'Palavras por parágrafo', isDecimal: true },
  { field: 'lists', label: 'Listas' },
  { field: 'tables', label: 'Tabelas' },
  { field: 'h2Count', label: 'H2' },
  { field: 'h3Count', label: 'H3' },
  { field: 'iWePer1000', label: 'eu/nós por mil', isDecimal: true },
  { field: 'youPer1000', label: 'você por mil', isDecimal: true },
]

type CommunicationPerPostProps = {
  items: SeoSampleItem[]
  limits: string
}

export function CommunicationPerPost({ items, limits }: CommunicationPerPostProps) {
  return (
    <OverviewSection position={6} title="Comunicação por post" note={`medidas de script nas ${items.length} páginas da amostra · eu/nós e você por mil palavras`}>
      {items.length === 0 ? (
        <CompetitorEmpty message="Nenhuma página lida na amostra." limits={limits} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th scope="col" className={HEAD_CELL_CLASS}>Página</th>
                {COLUMNS.map((column) => (
                  <th key={column.field} scope="col" className={NUMBER_HEAD_CELL_CLASS}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.url} data-item={item.url}>
                  <td className={CELL_CLASS}><SampleItemLabel item={item} /></td>
                  {COLUMNS.map((column) => (
                    <ItemNumberCell key={column.field} item={item} field={column.field} reasonKey="paragraphs" limits={limits} isDecimal={column.isDecimal} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </OverviewSection>
  )
}
