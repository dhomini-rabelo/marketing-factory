import { UNAVAILABLE_PAID_METRICS } from '@/pages/seo/utils/overview-paid-metrics'

export function PaidToolsStrip() {
  return (
    <div data-secao="indisponivel" className="mt-3 flex flex-wrap items-center gap-2 text-[12.5px] text-ink-3">
      <span className="font-bold text-ink-2">Esta tela não sabe</span>
      {UNAVAILABLE_PAID_METRICS.map((metric) => (
        <span key={metric} className="inline-flex items-center gap-1.5 rounded-full bg-line px-3 py-1 font-semibold text-ink-3">
          {metric}
          <em className="font-medium not-italic text-ink-3">indisponível sem ferramenta paga</em>
        </span>
      ))}
    </div>
  )
}
