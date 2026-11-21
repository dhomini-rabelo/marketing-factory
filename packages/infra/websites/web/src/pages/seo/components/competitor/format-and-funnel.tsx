import { CompetitorEmpty } from '@/pages/seo/components/competitor/competitor-empty'
import { StackedBar } from '@/pages/seo/components/competitor/stacked-bar'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import { formatCount } from '@/pages/seo/utils/format-count'
import type { SeoCategory } from '@/pages/seo/utils/seo-categories'
import { CELL_CLASS, HEAD_CELL_CLASS } from '@/pages/seo/utils/table-styles'

type FormatAndFunnelProps = {
  categories: SeoCategory[]
  limits: string
}

export function FormatAndFunnel({ categories, limits }: FormatAndFunnelProps) {
  return (
    <OverviewSection position={3} title="Formato e funil por categoria" note="contagem de cards por regra de título">
      {categories.length === 0 ? (
        <CompetitorEmpty message="Nenhuma categoria registrada para este concorrente." limits={limits} />
      ) : (
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th scope="col" className={HEAD_CELL_CLASS}>Categoria</th>
              <th scope="col" className={HEAD_CELL_CLASS}>Formato</th>
              <th scope="col" className={HEAD_CELL_CLASS}>Funil</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.name} data-category={category.name}>
                <td className={CELL_CLASS}>
                  <b>{category.name}</b>
                  <span className="block text-[11px] text-ink-3">{formatCount(category.postsListed, 'card', 'cards')}</span>
                </td>
                <td className={CELL_CLASS}>
                  <StackedBar segments={category.formats} emptyLabel="sem cards" />
                </td>
                <td className={CELL_CLASS}>
                  <StackedBar segments={category.funnel} emptyLabel="sem cards" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </OverviewSection>
  )
}
