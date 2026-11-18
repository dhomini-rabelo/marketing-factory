import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/api/query-keys'
import { getDocument } from '@/api/requests/document'

type UseDocumentDataInput = {
  projectId: string
  slug: string
  enabled: boolean
}

export function useDocumentData({ projectId, slug, enabled }: UseDocumentDataInput) {
  const query = useQuery({
    queryKey: QUERY_KEYS.document(projectId, slug),
    queryFn: () => getDocument(projectId, slug),
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
