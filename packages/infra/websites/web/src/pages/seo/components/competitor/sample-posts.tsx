import { CompetitorEmpty } from '@/pages/seo/components/competitor/competitor-empty'
import { ItemNumberCell } from '@/pages/seo/components/competitor/item-number-cell'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import { formatSeoDate } from '@/pages/seo/utils/format-seo-date'
import type { SeoSampleItem } from '@/pages/seo/utils/seo-items'
import { CELL_CLASS, HEAD_CELL_CLASS, NUMBER_HEAD_CELL_CLASS } from '@/pages/seo/utils/table-styles'

type SamplePostsProps = {
  items: SeoSampleItem[]
  limits: string
}

export function SamplePosts({ items, limits }: SamplePostsProps) {
  return (
    <OverviewSection position={14} title="Posts da amostra" note={`${items.length} páginas lidas · título, tipo, data, palavras e link`}>
      {items.length === 0 ? (
        <CompetitorEmpty message="Nenhuma página lida na amostra." limits={limits} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th scope="col" className={HEAD_CELL_CLASS}>Título</th>
                <th scope="col" className={HEAD_CELL_CLASS}>Tipo</th>
                <th scope="col" className={HEAD_CELL_CLASS}>Data</th>
                <th scope="col" className={NUMBER_HEAD_CELL_CLASS}>Palavras</th>
                <th scope="col" className={HEAD_CELL_CLASS}>Link</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.url} data-item={item.url}>
                  <td className={`${CELL_CLASS} font-semibold`}>{item.title}</td>
                  <td className={CELL_CLASS}>{item.pageTypeLabel}</td>
                  <td className={CELL_CLASS}>{item.publishedAt ? formatSeoDate(item.publishedAt) : 'sem data real'}</td>
                  <ItemNumberCell item={item} field="words" reasonKey="paragraphs" limits={limits} />
                  <td className={CELL_CLASS}>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand">abrir</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </OverviewSection>
  )
}
