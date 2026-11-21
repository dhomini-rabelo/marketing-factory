import { useState } from 'react'
import type { SeoRoundCompetitor } from '@/api/models/seo'
import { ComparisonCard } from '@/pages/seo/components/overview/comparison-card'
import { ComparisonsDialog } from '@/pages/seo/components/overview/comparisons-dialog'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import { MAX_VISIBLE_COMPARISONS } from '@/pages/seo/utils/seo-comparisons'

type ComparisonsOverviewProps = {
  competitors: SeoRoundCompetitor[]
}

export function ComparisonsOverview({ competitors }: ComparisonsOverviewProps) {
  const [openCompetitorName, setOpenCompetitorName] = useState<string | null>(null)

  return (
    <OverviewSection
      position={2}
      title="Comparações e alternativas"
      note={`até ${MAX_VISIBLE_COMPARISONS} por concorrente, o resto no botão`}
    >
      <div className="grid grid-cols-3 gap-3.5 px-5 pb-5 pt-1">
        {competitors.map((competitor) => (
          <ComparisonCard key={competitor.name} competitor={competitor} onShowAll={setOpenCompetitorName} />
        ))}
      </div>
      {openCompetitorName && (
        <ComparisonsDialog competitorName={openCompetitorName} onClose={() => setOpenCompetitorName(null)} />
      )}
    </OverviewSection>
  )
}
