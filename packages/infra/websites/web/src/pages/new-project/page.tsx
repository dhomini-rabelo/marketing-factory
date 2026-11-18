import { useNavigate } from 'react-router'
import { useCreateProjectData } from '@/layout/hooks/api/use-create-project-data'
import { ProjectForm } from '@/pages/project/components/project-form/project-form'

export function NewProjectPage() {
  const navigate = useNavigate()
  const createProjectRequest = useCreateProjectData()

  return (
    <div className="px-14 py-10">
      <div className="max-w-140">
        <h1 className="font-brand text-[34px] font-extrabold tracking-[-0.025em]">Novo projeto</h1>
        <p className="mb-7 mt-1.5 text-base text-ink-2">
          Só o básico. O resto o agente levanta lendo o repositório.
        </p>
        <ProjectForm
          submitLabel="Criar projeto"
          onCancel={() => navigate('/')}
          onSubmit={(values) =>
            createProjectRequest.actions
              .mutateAsync(values)
              .then((project) => navigate(`/projects/${project.id}`))
          }
        />
      </div>
    </div>
  )
}
