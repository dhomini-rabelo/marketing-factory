import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/api/query-keys'
import { listSeoRounds } from '@/api/requests/seo'

export function useSeoRoundsData(projectId: string) {
  const query = useQuery({
    queryKey: QUERY_KEYS.seoRounds(projectId),
    queryFn: () => listSeoRounds(projectId),
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
