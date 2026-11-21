import { useState } from 'react'
import { useParams } from 'react-router'
import type { SeoRoundSummary } from '@/api/models/seo'
import { useSeoRoundsData } from '@/layout/hooks/api/use-seo-rounds-data'
import { cn } from '@/layout/utils/styles'
import { SeoStatusPill } from '@/pages/seo/components/seo-status-pill'
import { useSeoRoundId } from '@/pages/seo/hooks/use-seo-round-id'
import { formatSeoDate } from '@/pages/seo/utils/format-seo-date'
import { SEO_TOOL_LABELS } from '@/pages/seo/utils/seo-labels'

function describeRound(round: SeoRoundSummary): string {
  return `${formatSeoDate(round.collectedAt)} · ${SEO_TOOL_LABELS[round.tool]}`
}

export function SeoRoundPicker() {
  const { projectId = '' } = useParams()
  const roundsRequest = useSeoRoundsData(projectId)
  const { state, actions } = useSeoRoundId()
  const [isOpen, setIsOpen] = useState(false)
  const rounds = roundsRequest.state.data ?? []
  const selected = rounds.find((round) => round.id === state.roundId || (state.roundId === 'latest' && round.isLatest))

  function handleToggle() {
    setIsOpen((current) => !current)
  }

  function handleSelect(roundId: string) {
    actions.setRoundId(roundId)
    setIsOpen(false)
  }

  if (!selected) return null

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex min-w-[270px] items-center gap-3 rounded-2 bg-card px-3 py-1.5 text-left shadow-1"
        onClick={handleToggle}
      >
        <span className="flex flex-col">
          <small className="text-xs text-ink-2">
            Rodada {selected.number} de {rounds.length}
            {selected.isLatest && ' · a última'}
          </small>
          <b>{describeRound(selected)}</b>
        </span>
        <SeoStatusPill status={selected.status} />
      </button>
      {isOpen && (
        <ul role="listbox" aria-label="Histórico de rodadas" className="absolute z-10 mt-1 w-full rounded-2 bg-card p-1 shadow-2">
          {rounds.map((round) => (
            <li
              key={round.id}
              role="option"
              aria-selected={round.id === selected.id}
              tabIndex={0}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-1 px-2 py-1.5 text-sm hover:bg-hover',
                round.id === selected.id && 'bg-brand-soft',
              )}
              onClick={() => handleSelect(round.id)}
              onKeyDown={(event) => event.key === 'Enter' && handleSelect(round.id)}
            >
              <span className="font-semibold">Rodada {round.number}</span>
              <span className="flex-1 text-ink-2">{describeRound(round)}</span>
              <SeoStatusPill status={round.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
