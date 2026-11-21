import type { SeoRoundCompetitor } from '@/api/models/seo'
import { LowConfidenceBadge } from '@/pages/seo/components/competitor/low-confidence-badge'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import { ReadingCard } from '@/pages/seo/components/overview/reading-card'

type AgentReadingProps = {
  competitor: SeoRoundCompetitor
}

export function AgentReading({ competitor }: AgentReadingProps) {
  return (
    <OverviewSection position={15} title="Leitura do agente" note="o que o blog trata, em texto">
      <p className="px-4 pb-2 text-[12px] font-semibold text-attention">
        <LowConfidenceBadge hint="julgamento do agente" />
      </p>
      <div className="px-5 pb-5 pt-1">
        <ReadingCard competitor={competitor} />
      </div>
    </OverviewSection>
  )
}
