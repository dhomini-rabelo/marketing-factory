import { ProjectListEmpty } from '@/layout/components/sidebar/components/project-list/project-list-empty'
import { ProjectListError } from '@/layout/components/sidebar/components/project-list/project-list-error'
import { ProjectListItem } from '@/layout/components/sidebar/components/project-list/project-list-item'
import { ProjectListLoading } from '@/layout/components/sidebar/components/project-list/project-list-loading'
import { useProjectsData } from '@/layout/hooks/api/use-projects-data'

export function ProjectListContent() {
  const projectsRequest = useProjectsData()
  const { data, isLoading, isError } = projectsRequest.state

  if (isLoading) return <ProjectListLoading />
  if (isError) return <ProjectListError />
  if (!data || data.length === 0) return <ProjectListEmpty />

  return (
    <ul>
      {data.map((project) => (
        <li key={project.id}>
          <ProjectListItem project={project} />
        </li>
      ))}
    </ul>
  )
}
