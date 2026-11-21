import { useParams } from 'react-router'
import type { SeoRound, SeoRoundCompetitor } from '@/api/models/seo'
import { useSeoCompetitorData } from '@/layout/hooks/api/use-seo-competitor-data'
import { Audiences } from '@/pages/seo/components/competitor/audiences'
import { AgentReading } from '@/pages/seo/components/competitor/agent-reading'
import { AuthorsAndTone } from '@/pages/seo/components/competitor/authors-and-tone'
import { CategoriesRhythm } from '@/pages/seo/components/competitor/categories-rhythm'
import { CommunicationPerPost } from '@/pages/seo/components/competitor/communication-per-post'
import { CompetitorComparisons } from '@/pages/seo/components/competitor/competitor-comparisons'
import { CompetitorDocuments } from '@/pages/seo/components/competitor/competitor-documents'
import { CompetitorTabError } from '@/pages/seo/components/competitor/competitor-tab-error'
import { CompetitorTabHeader } from '@/pages/seo/components/competitor/competitor-tab-header'
import { CompetitorTabLoading } from '@/pages/seo/components/competitor/competitor-tab-loading'
import { CompetitorTabNotCollected } from '@/pages/seo/components/competitor/competitor-tab-not-collected'
import { CompetitorTopics } from '@/pages/seo/components/competitor/competitor-topics'
import { EffortAndPageTypes } from '@/pages/seo/components/competitor/effort-and-page-types'
import { FaqAndLinks } from '@/pages/seo/components/competitor/faq-and-links'
import { FormatAndFunnel } from '@/pages/seo/components/competitor/format-and-funnel'
import { GooglePosition } from '@/pages/seo/components/competitor/google-position'
import { ImagesPerPost } from '@/pages/seo/components/competitor/images-per-post'
import { OldPosts } from '@/pages/seo/components/competitor/old-posts'
import { SamplePosts } from '@/pages/seo/components/competitor/sample-posts'
import { SeriesFolders } from '@/pages/seo/components/competitor/series-folders'
import { TopicExamples } from '@/pages/seo/components/competitor/topic-examples'
import { useSeoRoundId } from '@/pages/seo/hooks/use-seo-round-id'
import { readAudiences } from '@/pages/seo/utils/seo-audiences'
import { readCategories } from '@/pages/seo/utils/seo-categories'
import { groupExamplesByTopic } from '@/pages/seo/utils/seo-examples'
import { readFolders, readSampleItems } from '@/pages/seo/utils/seo-items'
import { readProfileDomain, readProfileText } from '@/pages/seo/utils/seo-profile'

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
  const items = readSampleItems(data.items)

  return (
    <div data-secao="aba-concorrente" data-competitor={competitor.name}>
      <CompetitorTabHeader competitor={competitor} round={round} />
      <EffortAndPageTypes competitor={{ ...competitor, profile: data.profile }} />
      <CategoriesRhythm categories={categories} limits={limits} />
      <FormatAndFunnel categories={categories} limits={limits} />
      <Audiences audiences={readAudiences(data.audiences)} limits={limits} />
      <TopicExamples groups={groupExamplesByTopic(categories, data.examples)} limits={limits} />
      <CommunicationPerPost items={items} limits={limits} />
      <ImagesPerPost items={items} limits={limits} />
      <FaqAndLinks items={items} limits={limits} />
      <AuthorsAndTone profile={data.profile} limits={limits} />
      <SeriesFolders folders={readFolders(data.folders)} />
      <OldPosts items={items} collectedAt={round.collectedAt} limits={limits} />
      <CompetitorComparisons comparisons={data.comparisons} profile={data.profile} limits={limits} />
      <CompetitorTopics clusters={data.clusters} profile={data.profile} limits={limits} />
      <SamplePosts items={items} limits={limits} />
      <AgentReading competitor={{ ...competitor, profile: data.profile }} />
      <GooglePosition
        name={competitor.name}
        domain={readProfileDomain(data.profile)}
        searches={round.searches}
        note={round.note}
        collectedAt={round.collectedAt}
      />
      <CompetitorDocuments name={competitor.name} documents={data.documents} hasBlog={items.length > 0} limits={limits} />
    </div>
  )
}
