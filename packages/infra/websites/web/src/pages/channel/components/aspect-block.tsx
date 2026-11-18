import { FindingRow } from '@/pages/channel/components/finding-row'
import type { AspectBlock as AspectBlockModel } from '@/pages/channel/utils/group-findings-by-aspect'

type AspectBlockProps = {
  block: AspectBlockModel
}

export function AspectBlock({ block }: AspectBlockProps) {
  const count = block.findings.length

  return (
    <section aria-label={block.label} className="overflow-hidden rounded-3 bg-card shadow-1">
      <div className="flex items-baseline gap-2.5 border-b border-line bg-code-bg px-[18px] py-3">
        <h3 className="text-[12.5px] font-bold uppercase tracking-[0.04em] text-ink-2">{block.label}</h3>
        <span className="text-[12.5px] text-ink-3">{count === 1 ? '1 achado' : `${count} achados`}</span>
      </div>
      <ul>
        {block.findings.map((grouped, index) => (
          <FindingRow key={index} grouped={grouped} />
        ))}
      </ul>
    </section>
  )
}
