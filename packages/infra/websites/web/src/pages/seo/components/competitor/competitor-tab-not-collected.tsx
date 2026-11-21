import type { SeoRound } from '@/api/models/seo'
import { SeoCompleteCommand } from '@/pages/seo/components/seo-complete-command'

type CompetitorTabNotCollectedProps = {
  name: string
  round: SeoRound
}

export function CompetitorTabNotCollected({ name, round }: CompetitorTabNotCollectedProps) {
  return (
    <div role="status" data-secao="nao-coletado" className="mt-3 rounded-2 border-l-4 border-attention bg-card px-3.5 py-2.5 text-[13px] shadow-1">
      <p>
        <b>{name}</b> ainda não coletado nesta rodada.
      </p>
      <p className="mt-1 text-ink-2">Copie o comando e cole no Claude Code para coletar este concorrente.</p>
      <SeoCompleteCommand round={round} missing={[name]} />
    </div>
  )
}
