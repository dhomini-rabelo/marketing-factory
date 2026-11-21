import { SeoRoundStatus, type SeoRound } from '@/api/models/seo'
import { SeoCompleteCommand } from '@/pages/seo/components/seo-complete-command'

type SeoPartialBannerProps = {
  round: SeoRound
}

export function SeoPartialBanner({ round }: SeoPartialBannerProps) {
  if (round.status !== SeoRoundStatus.PARTIAL) return null

  return (
    <div role="status" data-secao="rodada-parcial" className="mt-3 rounded-2 border-l-4 border-attention bg-card px-3.5 py-2.5 text-[13px] shadow-1">
      <p>
        <b>Rodada parcial.</b> Ainda faltam: {round.missing.join(', ')}.
      </p>
      <p className="mt-1 text-ink-2">Copie o comando e cole no Claude Code para completar a rodada.</p>
      <SeoCompleteCommand round={round} missing={round.missing} />
    </div>
  )
}
