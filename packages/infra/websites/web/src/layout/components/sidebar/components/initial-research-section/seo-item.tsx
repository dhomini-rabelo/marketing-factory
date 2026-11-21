import { NavLink } from 'react-router'
import { getNavItemClassName } from '@/layout/components/sidebar/utils/nav-item-class-names'

type SeoItemProps = {
  projectId: string
  isDimmed: boolean
}

export function SeoItem({ projectId, isDimmed }: SeoItemProps) {
  return (
    <NavLink
      to={`/projects/${projectId}/channels/seo`}
      className={({ isActive }) => getNavItemClassName(isActive, isDimmed)}
    >
      <span>SEO e blog</span>
    </NavLink>
  )
}
