import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/api/query-keys'
import { getChannelAnalysis } from '@/api/requests/channel'

type UseChannelDataInput = {
  projectId: string
  channel: string
  enabled: boolean
}

export function useChannelData({ projectId, channel, enabled }: UseChannelDataInput) {
  const query = useQuery({
    queryKey: QUERY_KEYS.channel(projectId, channel),
    queryFn: () => getChannelAnalysis(projectId, channel),
    enabled,
  })

  return {
    state: {
      data: query.data,
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error,
    },
    actions: {
      refetch: query.refetch,
    },
  }
}
