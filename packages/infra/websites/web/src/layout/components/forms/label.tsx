import type { ReactNode } from 'react'

type LabelProps = {
  htmlFor?: string
  id?: string
  hint?: string
  children: ReactNode
}

export function Label({ htmlFor, id, hint, children }: LabelProps) {
  return (
    <div className="mb-2 flex justify-between text-sm font-semibold">
      <label id={id} htmlFor={htmlFor}>
        {children}
      </label>
      {hint && <span className="text-[13px] font-normal text-ink-3">{hint}</span>}
    </div>
  )
}
