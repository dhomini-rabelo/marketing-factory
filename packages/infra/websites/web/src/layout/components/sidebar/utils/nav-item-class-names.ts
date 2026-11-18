import { cn } from '@/layout/utils/styles'

export function getNavItemClassName(isActive: boolean, isDimmed = false) {
  return cn(
    'flex items-center gap-2.5 rounded-2 px-1.5 py-1.5 text-[13.5px] hover:bg-white/7',
    isActive ? 'bg-white/10 font-bold text-white' : 'font-medium text-white/78',
    isDimmed && 'opacity-60',
  )
}
