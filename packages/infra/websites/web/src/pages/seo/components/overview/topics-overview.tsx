import type { SeoRoundCompetitor } from '@/api/models/seo'
import { ConfidenceMark } from '@/pages/seo/components/overview/confidence-mark'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import { TopicCard } from '@/pages/seo/components/overview/topic-card'
import { MAX_VISIBLE_TOPICS } from '@/pages/seo/utils/seo-topics'

type TopicsOverviewProps = {
  competitors: SeoRoundCompetitor[]
}

export function TopicsOverview({ competitors }: TopicsOverviewProps) {
  return (
    <OverviewSection
      position={3}
      title="Temas do blog"
      note={`até ${MAX_VISIBLE_TOPICS} por concorrente, os demais na aba dele · páginas do blog cujo endereço contém o termo`}
    >
      <div className="grid grid-cols-3 gap-3.5 px-5 pb-5 pt-1">
        {competitors.map((competitor) => (
          <TopicCard key={competitor.name} competitor={competitor} />
        ))}
      </div>
      <p className="px-5 pb-4 text-[12px] text-ink-3">
        Confiança <ConfidenceMark level="medium" /> média: contagem exata, agrupamento por julgamento.
      </p>
    </OverviewSection>
  )
}
