import type { SeoWarning } from '@/api/models/seo'
import { SEO_WARNING_LABELS } from '@/pages/seo/utils/seo-labels'

type SeoWarningsProps = {
  warnings: SeoWarning[]
}

export function SeoWarnings({ warnings }: SeoWarningsProps) {
  if (warnings.length === 0) return null

  return (
    <ul
      aria-label="Avisos da rodada"
      data-secao="avisos-da-rodada"
      className="mt-3 space-y-1 rounded-2 border-l-4 border-attention bg-card px-3.5 py-2.5 text-[13px] shadow-1"
    >
      {warnings.map((warning) => (
        <li key={`${warning.check}-${warning.competitor}`}>
          <b>{SEO_WARNING_LABELS[warning.check]}</b> em {warning.competitor}: {warning.message}
        </li>
      ))}
    </ul>
  )
}
