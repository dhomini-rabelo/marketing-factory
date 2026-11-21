import type { SeoRound } from '@/api/models/seo'
import { ConfidenceMark } from '@/pages/seo/components/overview/confidence-mark'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import { SearchesTable } from '@/pages/seo/components/overview/searches-table'
import { formatSeoDate } from '@/pages/seo/utils/format-seo-date'
import { findNoSearchReason, readSearches } from '@/pages/seo/utils/seo-searches'

type GoogleSampleProps = {
  round: Pick<SeoRound, 'searches' | 'note' | 'collectedAt'>
}

export function GoogleSample({ round }: GoogleSampleProps) {
  const searches = readSearches(round.searches)

  return (
    <OverviewSection
      position={5}
      title="Amostra de posição no Google"
      note={`amostra datada de ${formatSeoDate(round.collectedAt)}: muda com local, idioma e personalização`}
    >
      <p className="px-4 pb-2 text-[12px] font-semibold text-attention">
        <ConfidenceMark level="low" /> baixa confiança
      </p>
      {searches.length === 0 ? (
        <div className="mx-5 mb-5 rounded-2 bg-code-bg p-3.5 text-[13px] text-ink-2">
          <b className="block">Posição no Google não coletada nesta rodada</b>
          {findNoSearchReason(round.note)} Preferimos vazio a uma posição inventada. As colunas de busca na tabela principal ficam de fora até haver uma ferramenta que mostre a ordem.
        </div>
      ) : (
        <SearchesTable searches={searches} />
      )}
    </OverviewSection>
  )
}
