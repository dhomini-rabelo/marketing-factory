import { CreateProjectButton } from '@/layout/components/sidebar/components/create-project-button'
import { Logo } from '@/layout/components/sidebar/components/logo'
import { ProjectList } from '@/layout/components/sidebar/components/project-list/project-list'

export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen flex-col gap-5.5 bg-brand-deep px-4 py-5.5 text-white">
      <Logo />
      <div className="flex min-h-0 flex-col">
        <ProjectList />
        <CreateProjectButton />
      </div>
    </aside>
  )
}
