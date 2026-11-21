import type { SeoRoundCompetitor } from '@/api/models/seo'
import { ConfidenceMark } from '@/pages/seo/components/overview/confidence-mark'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import { ReadingCard } from '@/pages/seo/components/overview/reading-card'

type ReadingsProps = {
  competitors: SeoRoundCompetitor[]
}

export function Readings({ competitors }: ReadingsProps) {
  return (
    <OverviewSection position={4} title="Leitura do agente" note="o que cada blog trata, em texto">
      <div className="grid grid-cols-3 gap-3.5 px-5 pb-5 pt-1">
        {competitors.map((competitor) => (
          <ReadingCard key={competitor.name} competitor={competitor} />
        ))}
      </div>
      <p className="px-5 pb-4 text-[12px] text-ink-3">
        Confiança <ConfidenceMark level="low" /> baixa: julgamento do agente.
      </p>
    </OverviewSection>
  )
}
