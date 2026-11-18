import { apiFetch } from '@/api/client'
import type { ChannelAnalysis, ChannelSummary } from '@/api/models/channel-analysis'
import { API_ROUTES } from '@/api/routes'
import type { ChannelsResponse } from '@/api/types'

export async function listChannels(projectId: string): Promise<ChannelSummary[]> {
  const response = await apiFetch<ChannelsResponse>(API_ROUTES.channels.list(projectId))
  return response.channels
}

export function getChannelAnalysis(projectId: string, channel: string): Promise<ChannelAnalysis> {
  return apiFetch<ChannelAnalysis>(API_ROUTES.channels.detail(projectId, channel))
}
