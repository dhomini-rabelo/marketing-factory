import { FindingKind, type BestContent as BestContentModel } from '@/api/models/channel-analysis'

type BestContentProps = {
  bestContent: BestContentModel
}

export function BestContent({ bestContent }: BestContentProps) {
  const isFact = bestContent.basis === FindingKind.FACT

  return (
    <section aria-label="O que performa melhor" className="rounded-3 border border-[#cfd0f5] bg-brand-soft p-5">
      <h2 className="mb-2.5 text-[13px] font-semibold text-ink-2">O que performa melhor</h2>
      <p className="mb-2 break-words font-brand text-[23px] font-extrabold leading-tight tracking-[-0.02em]">
        {bestContent.type}
      </p>
      <p className="mb-2.5 break-words text-[13.5px] leading-relaxed text-ink-2">{bestContent.evidence}</p>
      <p className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-2">
        <span className={isFact ? 'rounded-full bg-[#dff3ec] px-2.5 py-[3px] font-bold text-support' : 'rounded-full border border-dashed border-[#d9b36a] bg-[#fffaf1] px-2.5 py-[3px] font-bold text-attention'}>
          {isFact ? 'Fato' : 'Hipótese: sem número público'}
        </span>
        {isFact && 'apoiado em número público'}
      </p>
    </section>
  )
}
