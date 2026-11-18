import { ProjectListContent } from '@/layout/components/sidebar/components/project-list/project-list-content'

export function ProjectList() {
  return (
    <section className="flex min-h-0 flex-col">
      <h6 className="mb-1.5 px-2 text-xs font-medium text-white/62">Projetos</h6>
      <div className="min-h-0 overflow-y-auto">
        <ProjectListContent />
      </div>
    </section>
  )
}
