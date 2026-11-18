import { Logo } from '@/layout/components/sidebar/components/logo'
import { ProjectSelect } from '@/layout/components/sidebar/components/project-select/project-select'

export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen flex-col gap-5.5 bg-brand-deep px-4 py-5.5 text-white">
      <Logo />
      <ProjectSelect />
    </aside>
  )
}
