import { CreateProjectButton } from '@/layout/components/sidebar/components/create-project-button'

export function ProjectSelectEmpty() {
  return (
    <div className="grid gap-1.5">
      <p className="px-2 text-sm text-white/62">Nenhum projeto ainda.</p>
      <CreateProjectButton />
    </div>
  )
}
