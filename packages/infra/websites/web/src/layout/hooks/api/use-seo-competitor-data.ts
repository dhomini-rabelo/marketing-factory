import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/api/query-keys'
import { getSeoCompetitor } from '@/api/requests/seo'

type UseSeoCompetitorDataInput = {
  projectId: string
  roundId: string
  competitorName: string
  enabled: boolean
}

export function useSeoCompetitorData({
  projectId,
  roundId,
  competitorName,
  enabled,
}: UseSeoCompetitorDataInput) {
  const query = useQuery({
    queryKey: QUERY_KEYS.seoCompetitor(projectId, roundId, competitorName),
    queryFn: () => getSeoCompetitor(projectId, roundId, competitorName),
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
