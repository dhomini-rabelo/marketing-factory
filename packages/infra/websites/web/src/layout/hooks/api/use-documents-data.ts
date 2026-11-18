import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/api/query-keys'
import { listDocuments } from '@/api/requests/document'

export function useDocumentsData(projectId: string) {
  const query = useQuery({
    queryKey: QUERY_KEYS.documents(projectId),
    queryFn: () => listDocuments(projectId),
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
