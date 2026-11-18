import type { ReactNode } from 'react'
import { cn } from '@/layout/utils/styles'

type SealTone = 'attention' | 'muted' | 'success'

type SealProps = {
  tone: SealTone
  children: ReactNode
}

const TONE_CLASSES: Record<SealTone, string> = {
  attention: 'border border-[rgba(255,200,140,0.5)] font-semibold text-[#ffd9b0]',
  muted: 'border border-dashed border-white/45 font-medium text-white/75',
  success: 'border border-[rgba(160,235,205,0.55)] font-semibold text-[#b9f0dc]',
}

export function Seal({ tone, children }: SealProps) {
  return (
    <span className={cn('rounded-full px-1.5 py-[3px] text-[10.5px] leading-none', TONE_CLASSES[tone])}>
      {children}
    </span>
  )
}
