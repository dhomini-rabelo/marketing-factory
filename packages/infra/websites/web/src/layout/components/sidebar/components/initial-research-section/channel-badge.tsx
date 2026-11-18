import { getScoreRingColor } from '@/layout/components/sidebar/utils/score-ring-color'

type ChannelBadgeProps = {
  score: number | null
}

const SCORE_RING_TRACK = 'rgba(255, 255, 255, 0.18)'
const PERCENT_PER_POINT = 10

export function ChannelBadge({ score }: ChannelBadgeProps) {
  if (score === null) {
    return (
      <span className="grid size-[30px] flex-none place-items-center rounded-full border-[1.5px] border-dashed border-white/40 text-xs text-white/50">
        –
      </span>
    )
  }

  const ringFill = `conic-gradient(${getScoreRingColor(score)} ${score * PERCENT_PER_POINT}%, ${SCORE_RING_TRACK} 0)`

  return (
    <span className="grid size-[30px] flex-none place-items-center rounded-full" style={{ background: ringFill }}>
      <b className="grid size-[23px] place-items-center rounded-full bg-brand-deep text-xs font-extrabold tabular-nums">
        {score}
      </b>
    </span>
  )
}
