import { useId, type ComponentProps } from 'react'

type ChoiceCardProps = Omit<ComponentProps<'input'>, 'type' | 'children'> & {
  label: string
  hint: string
}

const CARD_CLASSES =
  'grid cursor-pointer gap-1 rounded-2 border border-field-border bg-card p-3 text-left has-checked:border-2 has-checked:border-brand has-checked:bg-brand-soft has-checked:p-[11px] has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-brand'

export function ChoiceCard({ label, hint, ...inputProps }: ChoiceCardProps) {
  const labelId = useId()
  const hintId = useId()

  return (
    <label className={CARD_CLASSES}>
      <input
        type="radio"
        className="sr-only"
        aria-labelledby={labelId}
        aria-describedby={hintId}
        {...inputProps}
      />
      <b id={labelId} className="text-sm">
        {label}
      </b>
      <small id={hintId} className="text-xs text-ink-2">
        {hint}
      </small>
    </label>
  )
}
