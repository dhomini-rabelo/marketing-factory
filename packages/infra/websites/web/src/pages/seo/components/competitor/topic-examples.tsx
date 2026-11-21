import { CompetitorEmpty } from '@/pages/seo/components/competitor/competitor-empty'
import { TopicExampleGroup } from '@/pages/seo/components/competitor/topic-example-group'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import type { TopicExamples as TopicExamplesGroup } from '@/pages/seo/utils/seo-examples'

const OPEN_GROUPS = 2

type TopicExamplesProps = {
  groups: TopicExamplesGroup[]
  limits: string
}

export function TopicExamples({ groups, limits }: TopicExamplesProps) {
  return (
    <OverviewSection
      position={5}
      title="Exemplos por tema"
      note={'cópia do card, até 25 por tema, os primeiros 5 à vista · o "resumo do card" não é a meta description'}
    >
      {groups.length === 0 ? (
        <CompetitorEmpty message="Sem temas, sem exemplos." limits={limits} />
      ) : (
        groups.map((group, index) => <TopicExampleGroup key={group.topic} group={group} isOpenByDefault={index < OPEN_GROUPS} />)
      )}
    </OverviewSection>
  )
}
