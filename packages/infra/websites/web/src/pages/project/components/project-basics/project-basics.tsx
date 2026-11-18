import { ApiError } from '@/api/client'
import { useProjectData } from '@/layout/hooks/api/use-project-data'
import { ProjectBasicsContent } from '@/pages/project/components/project-basics/project-basics-content'
import { ProjectBasicsError } from '@/pages/project/components/project-basics/project-basics-error'
import { ProjectBasicsGone } from '@/pages/project/components/project-basics/project-basics-gone'
import { ProjectBasicsLoading } from '@/pages/project/components/project-basics/project-basics-loading'

type ProjectBasicsProps = {
  projectId: string
}

export function ProjectBasics({ projectId }: ProjectBasicsProps) {
  const projectRequest = useProjectData(projectId)
  const { data, isLoading, isError, error } = projectRequest.state

  if (isLoading) return <ProjectBasicsLoading />
  if (error instanceof ApiError && error.status === 404) return <ProjectBasicsGone />
  if (isError || !data) return <ProjectBasicsError onRetry={() => projectRequest.actions.refetch()} />

  return <ProjectBasicsContent key={data.id} project={data} />
}
