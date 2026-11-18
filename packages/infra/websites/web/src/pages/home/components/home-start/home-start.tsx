import { Navigate } from 'react-router'
import { CreateProjectButton } from '@/layout/components/sidebar/components/create-project-button'
import { useProjectsData } from '@/layout/hooks/api/use-projects-data'

export function HomeStart() {
  const projectsRequest = useProjectsData()
  const { data } = projectsRequest.state

  if (!data) return null
  if (data.length > 0) return <Navigate to={`/projects/${data[0].id}`} replace />

  return (
    <div className="px-14 py-10">
      <h1 className="font-brand text-[34px] font-extrabold tracking-[-0.025em]">Nenhum projeto ainda</h1>
      <p className="mb-7 mt-1.5 text-base text-ink-2">Crie o primeiro para começar.</p>
      <CreateProjectButton className="w-fit bg-brand-deep" />
    </div>
  )
}
