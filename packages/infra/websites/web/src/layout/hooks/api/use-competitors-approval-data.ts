import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/api/query-keys'
import { setCompetitorsApproval } from '@/api/requests/competitor'

export function useCompetitorsApprovalData(projectId: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (approved: boolean) => setCompetitorsApproval(projectId, approved),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.competitors(projectId) }),
  })

  return {
    state: {
      isPending: mutation.isPending,
      error: mutation.error,
    },
    actions: {
      mutateAsync: mutation.mutateAsync,
      reset: mutation.reset,
    },
  }
}
