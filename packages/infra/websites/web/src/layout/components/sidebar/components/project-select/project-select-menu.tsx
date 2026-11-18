import type { Project } from '@/api/models/project'
import { CreateProjectButton } from '@/layout/components/sidebar/components/create-project-button'
import { ProjectSelectOption } from '@/layout/components/sidebar/components/project-select/project-select-option'
import { sortProjectsByName } from '@/layout/components/sidebar/utils/sort-projects-by-name'

type ProjectSelectMenuProps = {
  projects: Project[]
  openProjectId: string | undefined
  onClose: () => void
}

export function ProjectSelectMenu({ projects, openProjectId, onClose }: ProjectSelectMenuProps) {
  return (
    <div
      role="menu"
      aria-label="Trocar de projeto"
      className="absolute left-0 top-[calc(100%+6px)] w-[268px] rounded-[12px] bg-card p-1.5 text-ink shadow-2"
    >
      <h6 className="px-2 pb-1 pt-2 text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink-3">Projetos</h6>
      {sortProjectsByName(projects).map((project) => (
        <ProjectSelectOption
          key={project.id}
          project={project}
          isOpenProject={project.id === openProjectId}
          onSelect={onClose}
        />
      ))}
      <div className="mt-1 border-t border-line pt-1">
        <CreateProjectButton variant="menu" role="menuitem" onClick={onClose} />
      </div>
    </div>
  )
}
