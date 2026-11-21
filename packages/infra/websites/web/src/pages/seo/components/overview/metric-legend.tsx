import type { SeoRoundCompetitor } from '@/api/models/seo'
import { ConfidenceMark } from '@/pages/seo/components/overview/confidence-mark'
import type { OverviewColumn } from '@/pages/seo/utils/overview-columns'
import { listNotMeasured } from '@/pages/seo/utils/overview-metrics'

type MetricLegendProps = {
  competitors: SeoRoundCompetitor[]
  columns: OverviewColumn[]
}

export function MetricLegend({ competitors, columns }: MetricLegendProps) {
  const notMeasured = listNotMeasured(competitors, columns)
  const canCompare = competitors.length > 1

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 border-t border-line bg-hover px-4 py-2 text-xs leading-normal text-ink-3">
      {canCompare && (
        <span>
          <b className="text-support">Verde</b> = melhor valor da coluna
        </span>
      )}
      <span>
        Confiança: <ConfidenceMark level="high" /> alta, leitura direta <ConfidenceMark level="medium" /> média, regra de URL ou
        amostra <ConfidenceMark level="low" /> baixa, julgamento
      </span>
      {notMeasured.length > 0 && (
        <span className="basis-full">
          Não medido nunca vira 0:{' '}
          {notMeasured.map((entry) => (
            <span key={entry.competitorName} title={entry.limits} className="mr-2">
              <b className="font-semibold text-ink-2">{entry.competitorName}</b> {entry.columnNames.join(', ')}
            </span>
          ))}
          Passe o mouse para ver o motivo.
        </span>
      )}
    </div>
  )
}
