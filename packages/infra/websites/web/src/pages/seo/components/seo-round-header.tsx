import type { SeoRound } from '@/api/models/seo'
import { SeoCopyPrompt } from '@/pages/seo/components/seo-copy-prompt'
import { SeoRoundInfo } from '@/pages/seo/components/seo-round-info'
import { SeoRoundPicker } from '@/pages/seo/components/seo-round-picker'

type SeoRoundHeaderProps = {
  round: SeoRound
}

export function SeoRoundHeader({ round }: SeoRoundHeaderProps) {
  return (
    <div data-secao="barra" className="relative mt-3.5 flex items-center gap-3.5">
      <SeoRoundPicker />
      <SeoRoundInfo round={round} />
      <SeoCopyPrompt />
    </div>
  )
}
