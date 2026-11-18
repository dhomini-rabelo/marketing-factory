import { CompetitorRole, type Competitor } from '@/api/models/competitor'
import { cn } from '@/layout/utils/styles'
import { isHttpUrl } from '@/pages/channel/utils/is-http-url'

type CompetitorCardProps = {
  competitor: Competitor
  isPending: boolean
  onToggleIncorrect: (competitor: Competitor) => void
}

const DETAIL_LABELS: { label: string; field: 'marketFocus' | 'services' | 'features' | 'audience' }[] = [
  { label: 'Foco de mercado', field: 'marketFocus' },
  { label: 'Serviços', field: 'services' },
  { label: 'Features', field: 'features' },
  { label: 'Público', field: 'audience' },
]

const ROLE_LABELS: Record<CompetitorRole, string> = {
  [CompetitorRole.MAIN]: 'principal',
  [CompetitorRole.SECONDARY]: 'secundário',
}

export function CompetitorCard({ competitor, isPending, onToggleIncorrect }: CompetitorCardProps) {
  const isMain = competitor.role === CompetitorRole.MAIN
  const hasLink = competitor.url !== null && isHttpUrl(competitor.url)

  return (
    <article
      aria-label={competitor.name}
      data-incorrect={competitor.incorrect}
      className={cn(
        'grid min-w-0 content-start gap-3 rounded-3 border-t-4 bg-card p-5 shadow-1',
        isMain ? 'border-t-brand' : 'border-t-[#b9bac4]',
        competitor.incorrect && 'border-dashed border-[#c2c2bf] bg-[#f4f4f2] shadow-none',
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('min-w-0 flex-1', competitor.incorrect && 'opacity-50')}>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold [overflow-wrap:anywhere]">{competitor.name}</h3>
            <span
              className={cn(
                'rounded-full border px-1.5 py-[3px] text-[10.5px] font-semibold leading-none',
                isMain ? 'border-[#cfd0f5] bg-brand-soft text-brand-deep' : 'border-line text-ink-3',
              )}
            >
              {ROLE_LABELS[competitor.role]}
            </span>
          </div>
          {hasLink && (
            <a
              href={competitor.url ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12.5px] font-medium text-brand [overflow-wrap:anywhere]"
            >
              {new URL(competitor.url ?? '').hostname}
            </a>
          )}
        </div>
        <button
          type="button"
          disabled={isPending}
          className="shrink-0 rounded-2 border border-[#d3d3d0] bg-card px-2.5 py-[7px] text-[12.5px] font-semibold text-ink-2 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => onToggleIncorrect(competitor)}
        >
          {competitor.incorrect ? 'Desfazer' : 'Não é concorrente'}
        </button>
      </div>
      <div className={cn('grid gap-3', competitor.incorrect && 'opacity-50')}>
        <dl className="grid gap-2">
          {DETAIL_LABELS.map(({ label, field }) => (
            <div key={field} className="grid grid-cols-[104px_minmax(0,1fr)] gap-2.5 text-[13.5px] leading-snug">
              <dt className="text-xs font-semibold text-ink-3">{label}</dt>
              <dd className="m-0 [overflow-wrap:anywhere]">{competitor[field]}</dd>
            </div>
          ))}
        </dl>
        <p className="rounded-2 bg-bg px-3 py-2.5 text-[13.5px] leading-normal text-ink-2">
          <b className="mb-0.5 block text-xs text-ink">Por que é {ROLE_LABELS[competitor.role]}</b>
          {competitor.rationale}
        </p>
      </div>
    </article>
  )
}
