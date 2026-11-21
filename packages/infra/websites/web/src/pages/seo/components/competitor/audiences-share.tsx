import { useState } from 'react'
import { AudienceExamplesDialog } from '@/pages/seo/components/competitor/audience-examples-dialog'
import { AudienceRow } from '@/pages/seo/components/competitor/audience-row'
import { TierChip } from '@/pages/seo/components/competitor/tier-chip'
import { formatCount } from '@/pages/seo/utils/format-count'
import { formatDecimal } from '@/pages/seo/utils/format-number'
import { MIN_CLASSIFIED_EXAMPLES, hasTierDivergence, type SeoAudience } from '@/pages/seo/utils/seo-audiences'
import type { SeoExample } from '@/pages/seo/utils/seo-examples'

type AudiencesShareProps = {
  competitorName: string
  audiences: SeoAudience[]
  examples: SeoExample[]
  classified: number
}

export function AudiencesShare({ competitorName, audiences, examples, classified }: AudiencesShareProps) {
  const [openedRole, setOpenedRole] = useState<string | null>(null)
  const maxPercentage = Math.max(1, ...audiences.map((audience) => audience.percentage))

  return (
    <div data-bloco="fatia" className="px-4 py-3">
      <h4 className="text-[12.5px] font-bold">
        Pela fatia de posts <small className="font-medium text-ink-3">os 3 públicos com mais exemplos e 10% ou mais</small>
      </h4>
      {classified < MIN_CLASSIFIED_EXAMPLES && (
        <p className="mt-1 text-xs italic text-ink-3">poucos exemplos classificados: sem nível por fatia</p>
      )}
      <ul className="mt-1.5">
        {audiences.map((audience, index) => (
          <AudienceRow key={`${audience.role}-${audience.size}-${index}`} audience={audience}>
            <div className="flex items-center gap-2">
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                <i className="block h-full bg-brand" style={{ width: `${(audience.percentage / maxPercentage) * 100}%` }} />
              </span>
              <b className="min-w-11 text-right tabular-nums">{formatDecimal(audience.percentage)}%</b>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-3">
              <button
                type="button"
                data-action="ver-exemplos"
                title="Ver os exemplos deste público"
                className="font-semibold text-brand underline"
                onClick={() => setOpenedRole(audience.role)}
              >
                {formatCount(audience.posts, 'exemplo', 'exemplos')}
              </button>
              <TierChip tier={audience.tierByShare} />
              {hasTierDivergence(audience) && <span className="rounded-1 bg-attention/10 px-1 text-[10.5px] font-bold text-attention">divergem</span>}
            </div>
          </AudienceRow>
        ))}
      </ul>
      {openedRole !== null && (
        <AudienceExamplesDialog
          competitorName={competitorName}
          audienceRole={openedRole}
          examples={examples}
          onClose={() => setOpenedRole(null)}
        />
      )}
    </div>
  )
}
