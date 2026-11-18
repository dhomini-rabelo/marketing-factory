import { NavLink } from 'react-router'
import type { Project } from '@/api/models/project'
import { cn } from '@/layout/utils/styles'
import { PLATFORM_OPTIONS } from '@/pages/project/utils/project-options'

type ProjectListItemProps = {
  project: Project
}

const ITEM_CLASSES =
  'flex w-full items-center gap-2.5 rounded-2 px-2 py-[9px] text-sm font-medium text-white/78 hover:bg-white/7'
const ACTIVE_ITEM_CLASSES = 'font-bold text-white'
const ACTIVE_NAME_CLASSES = 'border-b-2 border-white pb-px'

export function ProjectListItem({ project }: ProjectListItemProps) {
  const platformOption = PLATFORM_OPTIONS.find((option) => option.value === project.platform)

  return (
    <NavLink
      to={`/projects/${project.id}`}
      className={({ isActive }) => cn(ITEM_CLASSES, isActive && ACTIVE_ITEM_CLASSES)}
    >
      {({ isActive }) => (
        <>
          <span className={cn('truncate', isActive && ACTIVE_NAME_CLASSES)}>{project.name}</span>
          <span className="ml-auto shrink-0 text-xs font-normal text-white/50">
            {platformOption?.label.toLowerCase()}
          </span>
        </>
      )}
    </NavLink>
  )
}
