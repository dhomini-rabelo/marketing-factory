import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Project } from '@/api/models/project'
import { QUERY_KEYS } from '@/api/query-keys'
import { createProject } from '@/api/requests/project'

type UseCreateProjectDataOptions = {
  onSuccess?: (project: Project) => void
  onError?: (error: Error) => void
}

export function useCreateProjectData({ onSuccess, onError }: UseCreateProjectDataOptions = {}) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: async (project) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects() })
      onSuccess?.(project)
    },
    onError,
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
