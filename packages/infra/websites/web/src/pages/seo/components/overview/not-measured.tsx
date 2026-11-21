type NotMeasuredProps = {
  reason: string
}

export function NotMeasured({ reason }: NotMeasuredProps) {
  return (
    <span title={reason} className="cursor-help whitespace-nowrap border-b border-dotted border-ink-3 text-xs italic font-normal text-ink-3">
      não medido
    </span>
  )
}
