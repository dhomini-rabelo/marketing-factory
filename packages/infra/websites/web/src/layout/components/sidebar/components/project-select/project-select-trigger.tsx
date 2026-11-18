import type { Project } from '@/api/models/project'
import { ProjectSelectIcon } from '@/layout/components/sidebar/components/project-select/project-select-icon'
import { cn } from '@/layout/utils/styles'
import { PLATFORM_OPTIONS } from '@/pages/project/utils/project-options'

type ProjectSelectTriggerProps = {
  project: Project | undefined
  isOpen: boolean
  onToggle: () => void
}

export function ProjectSelectTrigger({ project, isOpen, onToggle }: ProjectSelectTriggerProps) {
  const platformOption = PLATFORM_OPTIONS.find((option) => option.value === project?.platform)
  const ariaLabel = project ? `Trocar de projeto. Atual: ${project.name}` : 'Trocar de projeto'

  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-2 border p-2 text-left text-white hover:bg-white/16',
        isOpen ? 'border-white bg-white/18 ring-2 ring-white/22' : 'border-white/24 bg-white/10',
      )}
    >
      <span className="grid size-8 flex-none place-items-center rounded-[8px] bg-white/16">
        <ProjectSelectIcon />
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <b className="block truncate text-[14.5px] font-bold">{project?.name ?? 'Escolher projeto'}</b>
        {platformOption && <small className="block text-xs text-white/66">{platformOption.label.toLowerCase()}</small>}
      </span>
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="flex-none text-white/70">
        <path
          d="m5 6.5 3-3 3 3M5 9.5l3 3 3-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
