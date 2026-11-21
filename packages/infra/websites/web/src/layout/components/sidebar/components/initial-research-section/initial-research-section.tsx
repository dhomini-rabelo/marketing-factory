import { CompetitorApproval } from '@/api/models/competitor'
import { ChannelItem } from '@/layout/components/sidebar/components/initial-research-section/channel-item'
import { InitialResearchEmpty } from '@/layout/components/sidebar/components/initial-research-section/initial-research-empty'
import { InitialResearchError } from '@/layout/components/sidebar/components/initial-research-section/initial-research-error'
import { InitialResearchLoading } from '@/layout/components/sidebar/components/initial-research-section/initial-research-loading'
import { SeoItem } from '@/layout/components/sidebar/components/initial-research-section/seo-item'
import { useChannelsData } from '@/layout/hooks/api/use-channels-data'
import { useCompetitorsData } from '@/layout/hooks/api/use-competitors-data'

type InitialResearchSectionProps = {
  projectId: string
}

export function InitialResearchSection({ projectId }: InitialResearchSectionProps) {
  const channelsRequest = useChannelsData(projectId)
  const competitorsRequest = useCompetitorsData(projectId)
  const { data, isLoading, isError } = channelsRequest.state
  const isDimmed = competitorsRequest.state.data?.approval === CompetitorApproval.PENDING

  function renderChannels() {
    if (isLoading) return <InitialResearchLoading />
    if (isError) return <InitialResearchError onRetry={() => channelsRequest.actions.refetch()} />
    if (!data || data.length === 0) return <InitialResearchEmpty />

    return data.map((summary) => (
      <ChannelItem key={summary.channel} projectId={projectId} summary={summary} isDimmed={isDimmed} />
    ))
  }

  return (
    <section className="grid content-start gap-px">
      <h6 className="mb-1 px-2 text-xs font-medium text-white/62">Pesquisa inicial</h6>
      {isDimmed && (
        <p className="flex items-start gap-[7px] px-2 pb-2 pt-0.5 text-xs leading-snug text-white/70">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="mt-px flex-none">
            <rect x="2.5" y="6.2" width="9" height="6" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4.6 6V4.4a2.4 2.4 0 0 1 4.8 0V6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>Libera depois que você aprovar a lista de concorrentes.</span>
        </p>
      )}
      {renderChannels()}
      <SeoItem projectId={projectId} isDimmed={isDimmed} />
    </section>
  )
}
