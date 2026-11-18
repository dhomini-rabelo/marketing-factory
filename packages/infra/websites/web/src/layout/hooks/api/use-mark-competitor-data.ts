import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/api/query-keys'
import { markCompetitor } from '@/api/requests/competitor'

type MarkCompetitorInput = {
  competitorId: string
  incorrect: boolean
}

export function useMarkCompetitorData(projectId: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ competitorId, incorrect }: MarkCompetitorInput) =>
      markCompetitor(projectId, competitorId, incorrect),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.competitors(projectId) }),
  })

  return {
    state: {
      isPending: mutation.isPending,
      error: mutation.error,
    },
    actions: {
      mutateAsync: mutation.mutateAsync,
    },
  }
}
