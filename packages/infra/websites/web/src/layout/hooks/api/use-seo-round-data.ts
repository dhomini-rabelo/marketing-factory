import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/api/query-keys'
import { getSeoRound } from '@/api/requests/seo'

type UseSeoRoundDataInput = {
  projectId: string
  roundId: string
  enabled: boolean
}

export function useSeoRoundData({ projectId, roundId, enabled }: UseSeoRoundDataInput) {
  const query = useQuery({
    queryKey: QUERY_KEYS.seoRound(projectId, roundId),
    queryFn: () => getSeoRound(projectId, roundId),
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
