import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProjectInput } from '@/api/models/project'
import { QUERY_KEYS } from '@/api/query-keys'
import { updateProject } from '@/api/requests/project'

export function useUpdateProjectData(projectId: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (input: ProjectInput) => updateProject(projectId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects() }),
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
