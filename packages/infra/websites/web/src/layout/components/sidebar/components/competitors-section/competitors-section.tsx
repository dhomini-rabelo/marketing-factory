import { NavLink } from 'react-router'
import { CompetitorsStatusBadge } from '@/layout/components/sidebar/components/competitors-section/competitors-status-badge'
import { getCompetitorsStatus } from '@/layout/components/sidebar/utils/competitors-status'
import { getNavItemClassName } from '@/layout/components/sidebar/utils/nav-item-class-names'
import { useCompetitorsData } from '@/layout/hooks/api/use-competitors-data'

type CompetitorsSectionProps = {
  projectId: string
}

export function CompetitorsSection({ projectId }: CompetitorsSectionProps) {
  const competitorsRequest = useCompetitorsData(projectId)
  const { data } = competitorsRequest.state

  return (
    <section className="grid content-start gap-px">
      <h6 className="mb-1 px-2 text-xs font-medium text-white/62">Concorrentes</h6>
      <NavLink
        to={`/projects/${projectId}/competitors`}
        className={({ isActive }) => getNavItemClassName(isActive)}
      >
        <span className="grid size-[30px] flex-none place-items-center rounded-full bg-white/14">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="6" cy="5.5" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M1.8 13c.4-2.4 2.1-3.6 4.2-3.6s3.8 1.2 4.2 3.6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="11.6" cy="6.2" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path d="M12 9.6c1.5.1 2.5 1 2.8 2.8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </span>
        <span className="grid gap-[3px]">
          <span>Lista de concorrentes</span>
          {data && <CompetitorsStatusBadge status={getCompetitorsStatus(data)} />}
        </span>
      </NavLink>
    </section>
  )
}
