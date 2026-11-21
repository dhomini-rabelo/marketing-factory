import { AudiencesAgent } from '@/pages/seo/components/competitor/audiences-agent'
import { AudiencesShare } from '@/pages/seo/components/competitor/audiences-share'
import { CompetitorEmpty } from '@/pages/seo/components/competitor/competitor-empty'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import { formatNumber } from '@/pages/seo/utils/format-number'
import { countClassifiedExamples, type SeoAudience } from '@/pages/seo/utils/seo-audiences'
import { findLimitReason } from '@/pages/seo/utils/seo-limits'

type AudiencesProps = {
  audiences: SeoAudience[]
  limits: string
}

export function Audiences({ audiences, limits }: AudiencesProps) {
  const classified = countClassifiedExamples(audiences)

  return (
    <OverviewSection position={4} title="Públicos" note="fatia de exemplos por público · avaliação do agente · público = cargo e porte">
      {audiences.length === 0 ? (
        <CompetitorEmpty message="Esta rodada não traz análise de públicos." limits={findLimitReason(limits, 'audience') ?? limits} />
      ) : (
        <>
          <p className="px-4 py-1 text-[12.5px] text-ink-2">
            Base: <b className="text-ink">{formatNumber(classified)} exemplos classificados</b>. Os dois modelos abaixo são independentes e podem discordar.
          </p>
          <div className="grid grid-cols-2 border-t border-line">
            <AudiencesShare audiences={audiences} classified={classified} />
            <AudiencesAgent audiences={audiences} classified={classified} />
          </div>
        </>
      )}
    </OverviewSection>
  )
}
