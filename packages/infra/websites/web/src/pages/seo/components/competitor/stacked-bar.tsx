import { SEGMENT_COLORS, type SegmentCount } from '@/pages/seo/utils/seo-categories'

type StackedBarProps = {
  segments: SegmentCount[]
  emptyLabel: string
}

export function StackedBar({ segments, emptyLabel }: StackedBarProps) {
  const filledSegments = segments.filter((segment) => segment.count > 0)
  const total = filledSegments.reduce((sum, segment) => sum + segment.count, 0)

  return (
    <div>
      <div className="flex h-3 min-w-[200px] overflow-hidden rounded-1 bg-line">
        {filledSegments.map((segment) => (
          <i
            key={segment.id}
            title={`${segment.label}: ${segment.count}`}
            data-segment={segment.id}
            className="block h-full"
            style={{ width: `${(segment.count / total) * 100}%`, backgroundColor: SEGMENT_COLORS[segment.id] }}
          />
        ))}
      </div>
      <span className="mt-0.5 block text-[11px] tabular-nums text-ink-3">
        {filledSegments.map((segment) => `${segment.count} ${segment.label}`).join(' · ') || emptyLabel}
      </span>
    </div>
  )
}
