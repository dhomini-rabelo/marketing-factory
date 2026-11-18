import { NavLink } from 'react-router'
import type { Project } from '@/api/models/project'
import { ProjectSelectIcon } from '@/layout/components/sidebar/components/project-select/project-select-icon'
import { cn } from '@/layout/utils/styles'
import { PLATFORM_OPTIONS } from '@/pages/project/utils/project-options'

type ProjectSelectOptionProps = {
  project: Project
  isOpenProject: boolean
  onSelect: () => void
}

export function ProjectSelectOption({ project, isOpenProject, onSelect }: ProjectSelectOptionProps) {
  const platformOption = PLATFORM_OPTIONS.find((option) => option.value === project.platform)

  return (
    <NavLink
      to={`/projects/${project.id}`}
      role="menuitemradio"
      aria-checked={isOpenProject}
      onClick={onSelect}
      className={cn(
        'relative flex min-h-[38px] items-center gap-2.5 rounded-[8px] px-2 py-1.5 text-sm text-ink hover:bg-bg',
        isOpenProject ? 'font-bold' : 'font-medium',
      )}
    >
      {isOpenProject && <span className="absolute bottom-1.5 left-0 top-1.5 w-[3px] rounded-full bg-accent" />}
      <span className="grid size-4 flex-none place-items-center text-ink-3">
        <ProjectSelectIcon />
      </span>
      <span className="min-w-0 flex-1 truncate">{project.name}</span>
      <span className="flex-none text-xs font-normal text-ink-3">{platformOption?.label.toLowerCase()}</span>
      <span className="grid size-4 flex-none place-items-center text-accent">
        {isOpenProject && (
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="m3.5 8.4 3 3 6-6.4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </NavLink>
  )
}
