import type { ReactNode } from 'react'

type FieldProps = {
  error?: string
  children: ReactNode
}

export function Field({ error, children }: FieldProps) {
  return (
    <div className="mb-[22px]">
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-[13px] font-semibold text-attention">
          {error}
        </p>
      )}
    </div>
  )
}
