import { CompetitorEmpty } from '@/pages/seo/components/competitor/competitor-empty'
import { LowConfidenceBadge } from '@/pages/seo/components/competitor/low-confidence-badge'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import { formatSeoDate } from '@/pages/seo/utils/format-seo-date'
import { findNoSearchReason, findPositionOf, formatSearchDate, readSearches } from '@/pages/seo/utils/seo-searches'
import { CELL_CLASS, HEAD_CELL_CLASS, NUMBER_CELL_CLASS, NUMBER_HEAD_CELL_CLASS } from '@/pages/seo/utils/table-styles'

type GooglePositionProps = {
  name: string
  domain: string
  searches: object[]
  note: string
  collectedAt: string
}

export function GooglePosition({ name, domain, searches, note, collectedAt }: GooglePositionProps) {
  const rows = readSearches(searches).map((search) => ({ search, position: findPositionOf(search, [name, domain]) }))

  return (
    <OverviewSection position={16} title="Posição no Google" note={`amostra datada de ${formatSeoDate(collectedAt)}: muda com local, idioma e personalização`}>
      <p className="px-4 pb-2 text-[12px] font-semibold text-attention">
        <LowConfidenceBadge hint="amostra de busca, não ranking" />
      </p>
      {rows.length === 0 ? (
        <CompetitorEmpty message="Posição no Google não coletada nesta rodada." limits={findNoSearchReason(note)} />
      ) : (
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th scope="col" className={HEAD_CELL_CLASS}>Busca</th>
              <th scope="col" className={HEAD_CELL_CLASS}>Mercado</th>
              <th scope="col" className={HEAD_CELL_CLASS}>Data</th>
              <th scope="col" className={NUMBER_HEAD_CELL_CLASS}>Posição</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ search, position }) => (
              <tr key={`${search.query}-${search.searchedAt}`}>
                <td className={CELL_CLASS}>{search.query}</td>
                <td className={CELL_CLASS}>{search.market}</td>
                <td className={CELL_CLASS}>{formatSearchDate(search.searchedAt)}</td>
                <td className={NUMBER_CELL_CLASS}>{position === null ? 'fora da amostra' : `${position}º`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </OverviewSection>
  )
}
