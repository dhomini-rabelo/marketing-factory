import type { ReactNode } from 'react'

type OverviewSectionProps = {
  position: number
  title: string
  note: string
  children: ReactNode
}

export function OverviewSection({ position, title, note, children }: OverviewSectionProps) {
  return (
    <section data-secao={title} className="mt-3 overflow-hidden rounded-3 bg-card shadow-1">
      <header className="flex items-center gap-2.5 px-4 py-3">
        <span className="grid size-[22px] place-items-center rounded-full bg-brand text-xs font-bold text-on-brand">{position}</span>
        <h3 className="text-[15px] font-bold">{title}</h3>
        <span className="text-xs text-ink-3">{note}</span>
      </header>
      {children}
    </section>
  )
}
