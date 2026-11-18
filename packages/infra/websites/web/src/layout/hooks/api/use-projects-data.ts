import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/api/query-keys'
import { listProjects } from '@/api/requests/project'

export function useProjectsData() {
  const query = useQuery({
    queryKey: QUERY_KEYS.projects(),
    queryFn: listProjects,
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
