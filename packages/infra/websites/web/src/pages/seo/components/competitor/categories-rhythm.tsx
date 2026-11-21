import { CategoryRow } from '@/pages/seo/components/competitor/category-row'
import { CompetitorEmpty } from '@/pages/seo/components/competitor/competitor-empty'
import { LowConfidenceBadge } from '@/pages/seo/components/competitor/low-confidence-badge'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import { describeCategoriesOrigin, type SeoCategory } from '@/pages/seo/utils/seo-categories'
import { HEAD_CELL_CLASS, NUMBER_HEAD_CELL_CLASS } from '@/pages/seo/utils/table-styles'

const NUMBER_HEADERS = ['Posts em 30 dias', 'Posts em 90 dias', 'Por semana', 'Por mês', 'Post mais novo', 'Cards lidos']

type CategoriesRhythmProps = {
  categories: SeoCategory[]
  limits: string
}

export function CategoriesRhythm({ categories, limits }: CategoriesRhythmProps) {
  const note = (
    <>
      ritmo e contagens · subassuntos
      <LowConfidenceBadge hint="Agrupamento por leitura dos títulos" /> {describeCategoriesOrigin(categories)}
    </>
  )

  return (
    <OverviewSection position={2} title="Categorias com ritmo" note={note}>
      {categories.length === 0 ? (
        <CompetitorEmpty message="Nenhuma categoria registrada para este concorrente." limits={limits} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th scope="col" className={HEAD_CELL_CLASS}>Categoria</th>
                {NUMBER_HEADERS.map((header) => (
                  <th key={header} scope="col" className={NUMBER_HEAD_CELL_CLASS}>{header}</th>
                ))}
                <th scope="col" className={HEAD_CELL_CLASS}>Subassuntos (o que se posta ali)</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <CategoryRow key={category.name} category={category} limits={limits} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </OverviewSection>
  )
}
