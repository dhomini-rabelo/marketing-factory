import type { Project } from '@/api/models/project'
import { ProjectBasicsChips } from '@/pages/project/components/project-basics/project-basics-chips'
import { getProjectInitial } from '@/pages/project/utils/get-project-initial'

type ProjectBasicsHeaderProps = {
  project: Project
  onEdit: () => void
}

export function ProjectBasicsHeader({ project, onEdit }: ProjectBasicsHeaderProps) {
  return (
    <header className="flex items-start gap-5 border-b border-line pb-5">
      <div
        aria-hidden="true"
        className="grid size-14 flex-none place-items-center rounded-[14px] bg-card font-brand text-2xl font-extrabold shadow-1"
      >
        {getProjectInitial(project.name)}
      </div>
      <div className="min-w-0">
        <h1 className="font-brand text-[34px] font-extrabold leading-[1.2] tracking-[-0.025em]">
          {project.name}
        </h1>
        <p className="mt-1.5 max-w-190 text-base text-ink-2">{project.description}</p>
        <ProjectBasicsChips project={project} />
      </div>
      <button
        type="button"
        className="ml-auto inline-flex items-center gap-1.5 rounded-2 bg-card px-3.5 py-2 text-sm font-semibold shadow-1"
        onClick={onEdit}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path
            d="M2 12h2.5L12 4.5 9.5 2 2 9.5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
        Editar dados
      </button>
    </header>
  )
}
