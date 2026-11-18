import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/api/query-keys'
import { listCompetitors } from '@/api/requests/competitor'

export function useCompetitorsData(projectId: string) {
  const query = useQuery({
    queryKey: QUERY_KEYS.competitors(projectId),
    queryFn: () => listCompetitors(projectId),
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
