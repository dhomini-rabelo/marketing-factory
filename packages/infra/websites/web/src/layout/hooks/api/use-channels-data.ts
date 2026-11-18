import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/api/query-keys'
import { listChannels } from '@/api/requests/channel'

export function useChannelsData(projectId: string) {
  const query = useQuery({
    queryKey: QUERY_KEYS.channels(projectId),
    queryFn: () => listChannels(projectId),
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
