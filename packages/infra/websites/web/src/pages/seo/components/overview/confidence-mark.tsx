import { cn } from '@/layout/utils/styles'
import { CONFIDENCE_FILLED_BARS, CONFIDENCE_HINTS, type ConfidenceLevel } from '@/pages/seo/utils/overview-confidence'

const BAR_POSITIONS = [1, 2, 3]

const FILLED_BAR_CLASS_NAMES: Record<ConfidenceLevel, string> = {
  high: 'bg-support',
  medium: 'bg-ink-3',
  low: 'bg-attention',
}

type ConfidenceMarkProps = {
  level: ConfidenceLevel
}

export function ConfidenceMark({ level }: ConfidenceMarkProps) {
  return (
    <span title={CONFIDENCE_HINTS[level]} data-confidence={level} className="ml-1 inline-flex cursor-help gap-px align-[-1px]">
      {BAR_POSITIONS.map((position) => (
        <i
          key={position}
          className={cn(
            'block h-[9px] w-[3px] rounded-[1px] bg-line',
            position <= CONFIDENCE_FILLED_BARS[level] && FILLED_BAR_CLASS_NAMES[level],
          )}
        />
      ))}
    </span>
  )
}
