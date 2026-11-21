import type { SeoRound } from '@/api/models/seo'
import { SeoRoundNote } from '@/pages/seo/components/seo-round-note'
import { formatCount } from '@/pages/seo/utils/format-count'
import { formatSeoDate } from '@/pages/seo/utils/format-seo-date'

type SeoRoundInfoProps = {
  round: SeoRound
}

export function SeoRoundInfo({ round }: SeoRoundInfoProps) {
  const collectedCount = round.competitors.filter((competitor) => competitor.collected).length

  return (
    <div className="min-w-0 flex-1">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-2">
        <span>
          Coletada em <b>{formatSeoDate(round.collectedAt)}</b>
        </span>
        <span>{formatCount(collectedCount, 'concorrente', 'concorrentes')}</span>
        <span>{formatCount(round.pagesRead, 'página lida', 'páginas lidas')}</span>
        <span>{formatCount(round.documents.length, 'documento', 'documentos')}</span>
      </p>
      {round.note && <SeoRoundNote note={round.note} />}
    </div>
  )
}
