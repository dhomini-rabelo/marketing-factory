import { useCallback, useState } from 'react'
import { useParams } from 'react-router'
import { ProjectSelectEmpty } from '@/layout/components/sidebar/components/project-select/project-select-empty'
import { ProjectSelectError } from '@/layout/components/sidebar/components/project-select/project-select-error'
import { ProjectSelectLoading } from '@/layout/components/sidebar/components/project-select/project-select-loading'
import { ProjectSelectMenu } from '@/layout/components/sidebar/components/project-select/project-select-menu'
import { ProjectSelectTrigger } from '@/layout/components/sidebar/components/project-select/project-select-trigger'
import { useProjectsData } from '@/layout/hooks/api/use-projects-data'
import { useDismissOnOutsideClick } from '@/layout/hooks/use-dismiss-on-outside-click'

export function ProjectSelect() {
  const projectsRequest = useProjectsData()
  const { projectId } = useParams()
  const [isOpen, setIsOpen] = useState(false)
  const close = useCallback(() => setIsOpen(false), [])
  const containerRef = useDismissOnOutsideClick(isOpen, close)
  const { data, isLoading, isError } = projectsRequest.state

  if (isLoading) return <ProjectSelectLoading />
  if (isError) return <ProjectSelectError onRetry={() => projectsRequest.actions.refetch()} />
  if (!data || data.length === 0) return <ProjectSelectEmpty />

  return (
    <div ref={containerRef} className="relative z-30">
      <h6 className="mb-1.5 px-2 text-xs font-medium text-white/62">Projeto</h6>
      <ProjectSelectTrigger
        project={data.find((project) => project.id === projectId)}
        isOpen={isOpen}
        onToggle={() => setIsOpen((current) => !current)}
      />
      {isOpen && <ProjectSelectMenu projects={data} openProjectId={projectId} onClose={close} />}
    </div>
  )
}
