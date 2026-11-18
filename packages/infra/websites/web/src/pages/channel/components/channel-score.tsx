import { useState } from 'react'

type ChannelScoreProps = {
  score: number
  rationale: string
}

const MAX_SCORE = 10

export function ChannelScore({ score, rationale }: ChannelScoreProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <section aria-label="Nota do canal" className="rounded-3 bg-card p-5 shadow-1">
      <h2 className="mb-2.5 text-[13px] font-semibold text-ink-2">Nota do canal e por quê</h2>
      <div className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-[18px]">
        <div
          className="grid size-24 place-items-center rounded-full"
          style={{ background: `conic-gradient(var(--color-brand) ${(score / MAX_SCORE) * 100}%, var(--color-line) 0)` }}
        >
          <b className="grid size-[76px] place-items-center rounded-full bg-card font-brand text-[40px] font-extrabold">
            <span aria-label={`Nota ${score} de ${MAX_SCORE}`}>
              {score}
              <small className="ml-px text-[13px] font-semibold text-ink-3">/{MAX_SCORE}</small>
            </span>
          </b>
        </div>
        <div>
          <p className={isExpanded ? 'whitespace-pre-line break-words text-sm leading-relaxed' : 'line-clamp-4 break-words text-sm leading-relaxed'}>
            {rationale}
          </p>
          <button
            type="button"
            aria-expanded={isExpanded}
            className="mt-1.5 text-[13px] font-semibold text-brand"
            onClick={() => setIsExpanded((current) => !current)}
          >
            {isExpanded ? 'recolher' : 'ver tudo'}
          </button>
        </div>
      </div>
    </section>
  )
}
