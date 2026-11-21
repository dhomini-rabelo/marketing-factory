type NotMeasuredProps = {
  reason: string
  label?: string
}

export function NotMeasured({ reason, label = 'não medido' }: NotMeasuredProps) {
  return (
    <span title={reason} className="cursor-help whitespace-nowrap border-b border-dotted border-ink-3 text-xs italic font-normal text-ink-3">
      {label}
    </span>
  )
}
