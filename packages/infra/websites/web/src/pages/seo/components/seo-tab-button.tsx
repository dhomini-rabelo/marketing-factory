import type { ReactNode } from 'react'
import { cn } from '@/layout/utils/styles'
import { useSeoTab } from '@/pages/seo/contexts/seo-tab-context'

type SeoTabButtonProps = {
  tab: string
  children: ReactNode
}

export function SeoTabButton({ tab, children }: SeoTabButtonProps) {
  const { state, actions } = useSeoTab()
  const isActive = state.activeTab === tab

  return (
    <button
      type="button"
      aria-pressed={isActive}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold shadow-1',
        isActive ? 'bg-ink text-white' : 'bg-card text-ink-2 hover:bg-hover',
      )}
      onClick={() => actions.setActiveTab(tab)}
    >
      {children}
    </button>
  )
}
