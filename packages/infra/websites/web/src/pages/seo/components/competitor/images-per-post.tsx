import { CompetitorEmpty } from '@/pages/seo/components/competitor/competitor-empty'
import { ItemNumberCell } from '@/pages/seo/components/competitor/item-number-cell'
import { SampleItemLabel } from '@/pages/seo/components/competitor/sample-item-label'
import { NotMeasured } from '@/pages/seo/components/overview/not-measured'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import type { SeoSampleItem } from '@/pages/seo/utils/seo-items'
import { describeMissingReason } from '@/pages/seo/utils/seo-limits'
import { readProfileNumber } from '@/pages/seo/utils/seo-profile'
import { CELL_CLASS, HEAD_CELL_CLASS, NUMBER_CELL_CLASS, NUMBER_HEAD_CELL_CLASS } from '@/pages/seo/utils/table-styles'

type AltShareCellProps = {
  item: SeoSampleItem
  limits: string
}

function AltShareCell({ item, limits }: AltShareCellProps) {
  const altPercentage = readProfileNumber(item.record, 'imagesAltPct')
  const imageCount = readProfileNumber(item.record, 'images')

  if (altPercentage !== null) {
    return (
      <td className={NUMBER_CELL_CLASS}>
        {altPercentage}%
        <span className="ml-1.5 inline-block h-1.5 w-12 overflow-hidden rounded-full bg-line align-middle">
          <i className="block h-full bg-brand" style={{ width: `${altPercentage}%` }} />
        </span>
      </td>
    )
  }
  return (
    <td className={NUMBER_CELL_CLASS}>
      {imageCount === 0 ? <NotMeasured label="sem imagens" reason="sem imagens" /> : <NotMeasured reason={describeMissingReason(limits, 'images')} />}
    </td>
  )
}

type ImagesPerPostProps = {
  items: SeoSampleItem[]
  limits: string
}

export function ImagesPerPost({ items, limits }: ImagesPerPostProps) {
  return (
    <OverviewSection position={7} title="Imagens por post" note="imagens do texto e % com texto alternativo · logotipo, ícone e avatar ficam de fora">
      {items.length === 0 ? (
        <CompetitorEmpty message="Nenhuma página lida na amostra." limits={limits} />
      ) : (
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th scope="col" className={HEAD_CELL_CLASS}>Página</th>
              <th scope="col" className={NUMBER_HEAD_CELL_CLASS}>Imagens</th>
              <th scope="col" className={NUMBER_HEAD_CELL_CLASS}>Com texto alternativo</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.url} data-item={item.url}>
                <td className={CELL_CLASS}><SampleItemLabel item={item} /></td>
                <ItemNumberCell item={item} field="images" reasonKey="images" limits={limits} />
                <AltShareCell item={item} limits={limits} />
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </OverviewSection>
  )
}
