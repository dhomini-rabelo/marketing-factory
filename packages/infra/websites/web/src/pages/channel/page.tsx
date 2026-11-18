import { useParams } from 'react-router'
import { ApiError } from '@/api/client'
import { useChannelData } from '@/layout/hooks/api/use-channel-data'
import { useCompetitorsData } from '@/layout/hooks/api/use-competitors-data'
import { CHANNEL_KEYS } from '@/layout/utils/competitor-analysis/keys'
import { BestContent } from '@/pages/channel/components/best-content'
import { ChannelError } from '@/pages/channel/components/channel-error'
import { ChannelHeader } from '@/pages/channel/components/channel-header'
import { ChannelLoading } from '@/pages/channel/components/channel-loading'
import { ChannelNotCollected } from '@/pages/channel/components/channel-not-collected'
import { ChannelNotFound } from '@/pages/channel/components/channel-not-found'
import { ChannelScore } from '@/pages/channel/components/channel-score'
import { FindingsByAspect } from '@/pages/channel/components/findings-by-aspect'
import { PartialNotice } from '@/pages/channel/components/partial-notice'
import { groupFindingsByAspect } from '@/pages/channel/utils/group-findings-by-aspect'

const CHANNEL_NOT_FOUND_CODE = 'CHANNEL_NOT_FOUND'
const ANALYSIS_NOT_FOUND_CODE = 'ANALYSIS_NOT_FOUND'

export function ChannelPage() {
  const { projectId = '', channel = '' } = useParams()
  const channelRequest = useChannelData({ projectId, channel, enabled: true })
  const competitorsRequest = useCompetitorsData(projectId)
  const { data: analysis, isLoading, isError, error } = channelRequest.state
  const channelName = CHANNEL_KEYS.find((item) => item.key === channel)?.label ?? channel

  if (isLoading || competitorsRequest.state.isLoading) return <ChannelLoading />

  if (isError) {
    const code = error instanceof ApiError ? error.code : null
    if (code === CHANNEL_NOT_FOUND_CODE) return <ChannelNotFound />
    if (code === ANALYSIS_NOT_FOUND_CODE) return <ChannelNotCollected channelName={channelName} projectId={projectId} />
    return <ChannelError onRetry={() => channelRequest.actions.refetch()} />
  }

  if (!analysis) return <ChannelLoading />

  const findingsByAspect = groupFindingsByAspect(analysis.findings, competitorsRequest.state.data?.competitors ?? [])

  return (
    <div className="grid content-start gap-5 px-9 pb-10 pt-7">
      <ChannelHeader
        projectId={projectId}
        channelName={channelName}
        collectedAt={analysis.collectedAt}
        findingsByAspect={findingsByAspect}
      />
      {analysis.partial && <PartialNotice />}
      <div className="grid grid-cols-2 gap-4">
        <ChannelScore score={analysis.score} rationale={analysis.rationale} />
        <BestContent bestContent={analysis.bestContent} />
      </div>
      <FindingsByAspect findingsByAspect={findingsByAspect} />
    </div>
  )
}
