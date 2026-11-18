import { useParams } from 'react-router'
import { CompetitorsSection } from '@/layout/components/sidebar/components/competitors-section/competitors-section'
import { InitialResearchSection } from '@/layout/components/sidebar/components/initial-research-section/initial-research-section'
import { Logo } from '@/layout/components/sidebar/components/logo'
import { ProjectSelect } from '@/layout/components/sidebar/components/project-select/project-select'

export function Sidebar() {
  const { projectId } = useParams()

  return (
    <aside className="sticky top-0 flex h-screen flex-col gap-4.5 bg-brand-deep px-4 py-5.5 text-white">
      <Logo />
      <ProjectSelect />
      {projectId && (
        <nav aria-label="Projeto" className="-mx-1.5 grid min-h-0 flex-1 content-start gap-4.5 overflow-y-auto px-1.5">
          <CompetitorsSection projectId={projectId} />
          <InitialResearchSection projectId={projectId} />
        </nav>
      )}
    </aside>
  )
}
