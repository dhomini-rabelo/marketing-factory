import type { Project } from '@/api/models/project'
import { PHASE_OPTIONS, PLATFORM_OPTIONS } from '@/pages/project/utils/project-options'

type ProjectBasicsChipsProps = {
  project: Project
}

const CHIP_CLASSES =
  'inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-[13px] font-medium shadow-1'
const CODE_LENGTH = 8

export function ProjectBasicsChips({ project }: ProjectBasicsChipsProps) {
  const platformOption = PLATFORM_OPTIONS.find((option) => option.value === project.platform)
  const phaseOption = PHASE_OPTIONS.find((option) => option.value === project.phase)

  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      <li className={CHIP_CLASSES}>{platformOption?.label}</li>
      <li className={CHIP_CLASSES}>
        <span aria-hidden="true" className="size-2 rounded-full bg-attention" />
        {phaseOption?.label}
      </li>
      <li className={CHIP_CLASSES}>
        código{' '}
        <code title={project.id} className="font-mono text-xs">
          {project.id.slice(0, CODE_LENGTH)}
        </code>
      </li>
    </ul>
  )
}
