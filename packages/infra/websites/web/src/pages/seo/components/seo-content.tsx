import { useParams } from 'react-router'
import { useSeoRoundData } from '@/layout/hooks/api/use-seo-round-data'
import { useSeoRoundsData } from '@/layout/hooks/api/use-seo-rounds-data'
import { SeoEmpty } from '@/pages/seo/components/seo-empty'
import { SeoError } from '@/pages/seo/components/seo-error'
import { SeoLoading } from '@/pages/seo/components/seo-loading'
import { SeoPartialBanner } from '@/pages/seo/components/seo-partial-banner'
import { SeoRoundHeader } from '@/pages/seo/components/seo-round-header'
import { SeoTabs } from '@/pages/seo/components/seo-tabs'
import { SeoWarnings } from '@/pages/seo/components/seo-warnings'
import { useSeoRoundId } from '@/pages/seo/hooks/use-seo-round-id'

export function SeoContent() {
  const { projectId = '' } = useParams()
  const { state: roundIdState } = useSeoRoundId()
  const roundsRequest = useSeoRoundsData(projectId)
  const hasRounds = (roundsRequest.state.data ?? []).length > 0
  const roundRequest = useSeoRoundData({ projectId, roundId: roundIdState.roundId, enabled: hasRounds })
  const round = roundRequest.state.data

  function handleRetry() {
    roundsRequest.actions.refetch()
    if (hasRounds) roundRequest.actions.refetch()
  }

  if (roundsRequest.state.isLoading || roundRequest.state.isLoading) return <SeoLoading />
  if (roundsRequest.state.isError || roundRequest.state.isError) return <SeoError onRetry={handleRetry} />
  if (!hasRounds) return <SeoEmpty />
  if (!round) return null

  return (
    <>
      <SeoTabs competitors={round.competitors} />
      <SeoRoundHeader round={round} />
      <SeoPartialBanner round={round} />
      <SeoWarnings warnings={round.warnings} />
    </>
  )
}
