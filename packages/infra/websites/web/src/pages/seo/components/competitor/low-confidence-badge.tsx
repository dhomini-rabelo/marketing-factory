type LowConfidenceBadgeProps = {
  hint: string
}

export function LowConfidenceBadge({ hint }: LowConfidenceBadgeProps) {
  return (
    <span title={hint} className="ml-1.5 cursor-help rounded-1 bg-attention/10 px-1.5 py-px text-[10.5px] font-bold text-attention">
      baixa confiança
    </span>
  )
}
