import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/api/query-keys'
import { getProject } from '@/api/requests/project'

export function useProjectData(projectId: string) {
  const query = useQuery({
    queryKey: QUERY_KEYS.project(projectId),
    queryFn: () => getProject(projectId),
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
