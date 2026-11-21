import { CompetitorEmpty } from '@/pages/seo/components/competitor/competitor-empty'
import { ItemNumberCell } from '@/pages/seo/components/competitor/item-number-cell'
import { SampleItemLabel } from '@/pages/seo/components/competitor/sample-item-label'
import { NotMeasured } from '@/pages/seo/components/overview/not-measured'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import type { SeoSampleItem } from '@/pages/seo/utils/seo-items'
import { describeMissingReason } from '@/pages/seo/utils/seo-limits'
import { readProfileNumber, readProfileText } from '@/pages/seo/utils/seo-profile'
import { CELL_CLASS, HEAD_CELL_CLASS, NUMBER_HEAD_CELL_CLASS } from '@/pages/seo/utils/table-styles'

const MAX_SCHEMA_TYPES = 6

type FaqAndLinksProps = {
  items: SeoSampleItem[]
  limits: string
}

export function FaqAndLinks({ items, limits }: FaqAndLinksProps) {
  const missing = (key: 'faq' | 'paragraphs') => <NotMeasured label="não coletado" reason={describeMissingReason(limits, key)} />

  return (
    <OverviewSection position={8} title="FAQ, chamadas para o produto e links" note="perguntas de FAQ, links de chamada e links internos · tipos de JSON-LD e destinos">
      {items.length === 0 ? (
        <CompetitorEmpty message="Nenhuma página lida na amostra." limits={limits} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th scope="col" className={HEAD_CELL_CLASS}>Página</th>
                <th scope="col" className={NUMBER_HEAD_CELL_CLASS}>Perguntas de FAQ</th>
                <th scope="col" className={HEAD_CELL_CLASS}>Tipos de JSON-LD</th>
                <th scope="col" className={NUMBER_HEAD_CELL_CLASS}>Links de chamada</th>
                <th scope="col" className={HEAD_CELL_CLASS}>Destinos</th>
                <th scope="col" className={NUMBER_HEAD_CELL_CLASS}>Links internos</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const schemaTypes = [...new Set(readProfileText(item.record, 'ldTypes').split(',').map((type) => type.trim()).filter(Boolean))]
                const targets = readProfileText(item.record, 'ctaTargets')
                return (
                  <tr key={item.url} data-item={item.url}>
                    <td className={CELL_CLASS}><SampleItemLabel item={item} /></td>
                    <ItemNumberCell item={item} field="faqQuestions" reasonKey="faq" limits={limits} />
                    <td className={CELL_CLASS}>{schemaTypes.length > 0 ? schemaTypes.slice(0, MAX_SCHEMA_TYPES).join(', ') : missing('faq')}</td>
                    <ItemNumberCell item={item} field="ctaLinks" reasonKey="paragraphs" limits={limits} />
                    <td className={CELL_CLASS}>{targets || (readProfileNumber(item.record, 'ctaLinks') === 0 ? 'nenhum' : missing('paragraphs'))}</td>
                    <ItemNumberCell item={item} field="internalLinks" reasonKey="paragraphs" limits={limits} />
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </OverviewSection>
  )
}
