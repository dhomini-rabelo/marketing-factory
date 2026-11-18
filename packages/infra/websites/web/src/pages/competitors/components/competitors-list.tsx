import type { Competitor } from '@/api/models/competitor'
import { CompetitorCard } from '@/pages/competitors/components/competitor-card'
import { CompetitorsEmpty } from '@/pages/competitors/components/competitors-empty'
import { sortCompetitors } from '@/pages/competitors/utils/sort-competitors'

type CompetitorsListProps = {
  competitors: Competitor[]
  isPending: boolean
  onToggleIncorrect: (competitor: Competitor) => void
}

export function CompetitorsList({ competitors, isPending, onToggleIncorrect }: CompetitorsListProps) {
  const { active, marked } = sortCompetitors(competitors)

  return (
    <section aria-labelledby="competitors-list-title" className="mt-8">
      <div className="mb-3 flex items-baseline gap-3">
        <h2 id="competitors-list-title" className="text-xl font-bold tracking-[-0.01em]">
          Lista de concorrentes
        </h2>
        <span className="text-[13.5px] text-ink-3">principais primeiro; o marcado vai para o fim</span>
      </div>
      {competitors.length === 0 ? (
        <CompetitorsEmpty />
      ) : (
        <ul className="grid grid-cols-2 gap-4">
          {[...active, ...marked].map((competitor) => (
            <li key={competitor.id} className="grid min-w-0">
              <CompetitorCard competitor={competitor} isPending={isPending} onToggleIncorrect={onToggleIncorrect} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
