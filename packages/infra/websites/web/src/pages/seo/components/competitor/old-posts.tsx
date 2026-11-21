import { CompetitorEmpty } from '@/pages/seo/components/competitor/competitor-empty'
import { SampleItemLabel } from '@/pages/seo/components/competitor/sample-item-label'
import { NotMeasured } from '@/pages/seo/components/overview/not-measured'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import { formatSeoDate } from '@/pages/seo/utils/format-seo-date'
import { describeAge, describeRefresh, type SeoSampleItem } from '@/pages/seo/utils/seo-items'
import { describeMissingReason, findLimitReason, type LimitReasonKey } from '@/pages/seo/utils/seo-limits'
import { CELL_CLASS, HEAD_CELL_CLASS, NUMBER_CELL_CLASS, NUMBER_HEAD_CELL_CLASS } from '@/pages/seo/utils/table-styles'

type OldPostsProps = {
  items: SeoSampleItem[]
  collectedAt: string
  limits: string
}

export function OldPosts({ items, collectedAt, limits }: OldPostsProps) {
  const oldItems = items.filter((item) => item.role === 'old')
  const valueOrReason = (value: string | null, key: LimitReasonKey) =>
    value || <NotMeasured label="não coletado" reason={describeMissingReason(limits, key)} />

  return (
    <OverviewSection position={11} title="Posts antigos" note="idade e última atualização de posts com mais de 180 dias">
      {oldItems.length === 0 ? (
        <CompetitorEmpty message="Sem post antigo na amostra." limits={findLimitReason(limits, 'old') ?? ''} />
      ) : (
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th scope="col" className={HEAD_CELL_CLASS}>Post</th>
              <th scope="col" className={NUMBER_HEAD_CELL_CLASS}>Publicado</th>
              <th scope="col" className={NUMBER_HEAD_CELL_CLASS}>Idade</th>
              <th scope="col" className={NUMBER_HEAD_CELL_CLASS}>Modificado</th>
              <th scope="col" className={HEAD_CELL_CLASS}>Atualizou?</th>
            </tr>
          </thead>
          <tbody>
            {oldItems.map((item) => (
              <tr key={item.url} data-item={item.url}>
                <td className={CELL_CLASS}><SampleItemLabel item={item} /></td>
                <td className={NUMBER_CELL_CLASS}>{valueOrReason(item.publishedAt && formatSeoDate(item.publishedAt), 'date')}</td>
                <td className={NUMBER_CELL_CLASS}>{valueOrReason(item.publishedAt && describeAge(item.publishedAt, collectedAt), 'date')}</td>
                <td className={NUMBER_CELL_CLASS}>{valueOrReason(item.modifiedAt && formatSeoDate(item.modifiedAt), 'modifiedAt')}</td>
                <td className={CELL_CLASS}>{valueOrReason(describeRefresh(item), 'modifiedAt')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </OverviewSection>
  )
}
