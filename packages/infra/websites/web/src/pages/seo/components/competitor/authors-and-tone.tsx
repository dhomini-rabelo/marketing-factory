import { LowConfidenceBadge } from '@/pages/seo/components/competitor/low-confidence-badge'
import { NotMeasured } from '@/pages/seo/components/overview/not-measured'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import { formatNumber } from '@/pages/seo/utils/format-number'
import { describeMissingReason } from '@/pages/seo/utils/seo-limits'
import { readProfileNumber, readProfileText } from '@/pages/seo/utils/seo-profile'

const AUTHOR_KIND_LABELS: Record<string, string> = {
  people: 'pessoas',
  brand: 'a marca',
  mixed: 'pessoas e marca',
}

type AuthorsAndToneProps = {
  profile: unknown
  limits: string
}

export function AuthorsAndTone({ profile, limits }: AuthorsAndToneProps) {
  const authorsSeen = readProfileNumber(profile, 'authorsSeen')
  const authorKind = readProfileText(profile, 'authorKind')
  const tone = readProfileText(profile, 'tone')
  const missing = (key: 'author' | 'tone') => <NotMeasured label="não coletado" reason={describeMissingReason(limits, key)} />

  return (
    <OverviewSection position={9} title="Autores e tom" note="autores · quem assina e tom">
      <div className="grid grid-cols-3 gap-4 px-4 py-3 text-[13px]">
        <div data-bloco="autores-vistos">
          <h4 className="text-[11.5px] font-bold text-ink-3">Autores vistos</h4>
          {authorsSeen === null ? missing('author') : <b className="text-2xl tabular-nums">{formatNumber(authorsSeen)}</b>}
        </div>
        <div data-bloco="quem-assina">
          <h4 className="text-[11.5px] font-bold text-ink-3">Quem assina</h4>
          {authorKind ? <b>{AUTHOR_KIND_LABELS[authorKind] ?? authorKind}</b> : missing('author')}
        </div>
        <div data-bloco="tom">
          <h4 className="text-[11.5px] font-bold text-ink-3">
            Tom de comunicação <LowConfidenceBadge hint="O tom muda por tipo de post" />
          </h4>
          {tone ? <p>{tone}</p> : missing('tone')}
        </div>
      </div>
    </OverviewSection>
  )
}
