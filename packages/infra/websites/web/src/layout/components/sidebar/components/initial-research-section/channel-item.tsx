import { NavLink } from 'react-router'
import type { ChannelSummary } from '@/api/models/channel-analysis'
import { ChannelBadge } from '@/layout/components/sidebar/components/initial-research-section/channel-badge'
import { Seal } from '@/layout/components/sidebar/components/seal'
import { getNavItemClassName } from '@/layout/components/sidebar/utils/nav-item-class-names'
import { CHANNEL_KEYS } from '@/layout/utils/competitor-analysis/keys'

type ChannelItemProps = {
  projectId: string
  summary: ChannelSummary
  isDimmed: boolean
}

export function ChannelItem({ projectId, summary, isDimmed }: ChannelItemProps) {
  const channelName = CHANNEL_KEYS.find((item) => item.key === summary.channel)?.label ?? summary.channel

  return (
    <NavLink
      to={`/projects/${projectId}/channels/${summary.channel}`}
      className={({ isActive }) => getNavItemClassName(isActive, isDimmed)}
    >
      <ChannelBadge score={summary.score} />
      <span className="grid gap-[3px]">
        <span>{channelName}</span>
        {(summary.partial || !summary.collected) && (
          <span className="flex flex-wrap gap-1">
            {summary.partial && <Seal tone="attention">parcial sem login</Seal>}
            {!summary.collected && <Seal tone="muted">sem coleta</Seal>}
          </span>
        )}
      </span>
    </NavLink>
  )
}
