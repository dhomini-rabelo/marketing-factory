import { Link } from 'react-router'
import { formatDate } from '@/pages/project/utils/format-date'
import type { FindingsByAspect } from '@/pages/channel/utils/group-findings-by-aspect'

type ChannelHeaderProps = {
  projectId: string
  channelName: string
  collectedAt: string
  findingsByAspect: FindingsByAspect
}

function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`
}

export function ChannelHeader({ projectId, channelName, collectedAt, findingsByAspect }: ChannelHeaderProps) {
  const { findingsCount, factsCount, hypothesesCount, competitorsWithFinding, activeCompetitorsCount } = findingsByAspect

  return (
    <header>
      <nav aria-label="Caminho" className="mb-2 text-[13px] text-ink-3">
        <Link to={`/projects/${projectId}`} className="text-ink-2">
          Projeto
        </Link>
        {' / Pesquisa inicial / '}
        {channelName}
      </nav>
      <h1 className="font-brand text-[34px] font-extrabold leading-tight tracking-[-0.025em]">{channelName}</h1>
      <p className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-2">
        <span>Coletado {formatDate(collectedAt)}</span>
        {activeCompetitorsCount > 0 && (
          <span>
            {competitorsWithFinding} de {pluralize(activeCompetitorsCount, 'concorrente', 'concorrentes')} com achado
          </span>
        )}
        <span>
          {pluralize(findingsCount, 'achado', 'achados')} · {pluralize(factsCount, 'fato', 'fatos')},{' '}
          {pluralize(hypothesesCount, 'hipótese', 'hipóteses')}
        </span>
      </p>
    </header>
  )
}
