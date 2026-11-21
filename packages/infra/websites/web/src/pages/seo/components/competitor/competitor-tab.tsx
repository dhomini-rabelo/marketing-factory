import { useParams } from 'react-router'
import type { SeoRound, SeoRoundCompetitor } from '@/api/models/seo'
import { useSeoCompetitorData } from '@/layout/hooks/api/use-seo-competitor-data'
import { Audiences } from '@/pages/seo/components/competitor/audiences'
import { CategoriesRhythm } from '@/pages/seo/components/competitor/categories-rhythm'
import { CompetitorTabError } from '@/pages/seo/components/competitor/competitor-tab-error'
import { CompetitorTabHeader } from '@/pages/seo/components/competitor/competitor-tab-header'
import { CompetitorTabLoading } from '@/pages/seo/components/competitor/competitor-tab-loading'
import { CompetitorTabNotCollected } from '@/pages/seo/components/competitor/competitor-tab-not-collected'
import { EffortAndPageTypes } from '@/pages/seo/components/competitor/effort-and-page-types'
import { FormatAndFunnel } from '@/pages/seo/components/competitor/format-and-funnel'
import { TopicExamples } from '@/pages/seo/components/competitor/topic-examples'
import { useSeoRoundId } from '@/pages/seo/hooks/use-seo-round-id'
import { readAudiences } from '@/pages/seo/utils/seo-audiences'
import { readCategories } from '@/pages/seo/utils/seo-categories'
import { groupExamplesByTopic } from '@/pages/seo/utils/seo-examples'
import { readProfileText } from '@/pages/seo/utils/seo-profile'

type CompetitorTabProps = {
  competitor: SeoRoundCompetitor
  round: SeoRound
}

export function CompetitorTab({ competitor, round }: CompetitorTabProps) {
  const { projectId = '' } = useParams()
  const { state: roundIdState } = useSeoRoundId()
  const request = useSeoCompetitorData({
    projectId,
    roundId: roundIdState.roundId,
    competitorName: competitor.name,
    enabled: competitor.collected,
  })
  const data = request.state.data

  if (request.state.isLoading) return <CompetitorTabLoading name={competitor.name} />
  if (request.state.isError) return <CompetitorTabError name={competitor.name} onRetry={() => request.actions.refetch()} />
  if (!competitor.collected) return <CompetitorTabNotCollected name={competitor.name} round={round} />
  if (!data) return null

  const limits = readProfileText(data.profile, 'limits')
  const categories = readCategories(data.categories)

  return (
    <div data-secao="aba-concorrente" data-competitor={competitor.name}>
      <CompetitorTabHeader competitor={competitor} round={round} />
      <EffortAndPageTypes competitor={{ ...competitor, profile: data.profile }} />
      <CategoriesRhythm categories={categories} limits={limits} />
      <FormatAndFunnel categories={categories} limits={limits} />
      <Audiences audiences={readAudiences(data.audiences)} limits={limits} />
      <TopicExamples groups={groupExamplesByTopic(categories, data.examples)} limits={limits} />
    </div>
  )
}
