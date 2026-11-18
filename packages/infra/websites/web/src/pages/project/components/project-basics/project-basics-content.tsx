import { useState } from 'react'
import type { Project } from '@/api/models/project'
import { useUpdateProjectData } from '@/layout/hooks/api/use-update-project-data'
import { ProjectBasicsHeader } from '@/pages/project/components/project-basics/project-basics-header'
import { ProjectForm } from '@/pages/project/components/project-form/project-form'

type ProjectBasicsContentProps = {
  project: Project
}

export function ProjectBasicsContent({ project }: ProjectBasicsContentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const updateRequest = useUpdateProjectData(project.id)

  if (!isEditing) {
    return <ProjectBasicsHeader project={project} onEdit={() => setIsEditing(true)} />
  }

  return (
    <section aria-label="Editar dados do projeto" className="border-b border-line pb-5">
      <div className="max-w-140">
        <ProjectForm
          defaultValues={{
            name: project.name,
            platform: project.platform,
            phase: project.phase,
            description: project.description,
          }}
          submitLabel="Salvar"
          onCancel={() => setIsEditing(false)}
          onSubmit={(values) =>
            updateRequest.actions.mutateAsync(values).then(() => setIsEditing(false))
          }
        />
      </div>
    </section>
  )
}
