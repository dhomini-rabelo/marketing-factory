import { AudienceRow } from '@/pages/seo/components/competitor/audience-row'
import { LowConfidenceBadge } from '@/pages/seo/components/competitor/low-confidence-badge'
import { TierChip } from '@/pages/seo/components/competitor/tier-chip'
import { MIN_CLASSIFIED_EXAMPLES, type SeoAudience } from '@/pages/seo/utils/seo-audiences'

type AudiencesAgentProps = {
  audiences: SeoAudience[]
  classified: number
}

export function AudiencesAgent({ audiences, classified }: AudiencesAgentProps) {
  const hasBase = classified >= MIN_CLASSIFIED_EXAMPLES || audiences.some((audience) => audience.declaredPages.length > 0)

  return (
    <div data-bloco="agente" className="border-l border-line px-4 py-3">
      <h4 className="text-[12.5px] font-bold">
        Pela avaliação do agente <small className="font-medium text-ink-3">quem o concorrente quer atingir</small>
        <LowConfidenceBadge hint="Leitura dos temas e das páginas de público" />
      </h4>
      {!hasBase && (
        <p className="mt-1 text-xs italic text-ink-3">Sem base para o agente avaliar: poucos exemplos e nenhuma página de público declarado.</p>
      )}
      <ul className="mt-1.5">
        {audiences.map((audience, index) => (
          <AudienceRow key={`${audience.role}-${audience.size}-${index}`} audience={audience}>
            <TierChip tier={audience.tierByAgent} />
            {audience.agentReason && <p className="mt-0.5 text-xs text-ink-2">{audience.agentReason}</p>}
            {audience.declaredPages.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {audience.declaredPages.map((page) => (
                  <code key={page} className="rounded-full bg-code-bg px-2 py-px font-mono text-[11px] text-ink-2">{page}</code>
                ))}
              </div>
            )}
          </AudienceRow>
        ))}
      </ul>
    </div>
  )
}
