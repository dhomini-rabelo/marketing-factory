import { TIER_LABELS, type AudienceTier } from '@/pages/seo/utils/seo-audiences'

type TierChipProps = {
  tier: AudienceTier | null
}

export function TierChip({ tier }: TierChipProps) {
  if (!tier) return <span className="text-xs text-ink-3">sem nível</span>
  return <span className="rounded-1 bg-support-soft px-1.5 py-px text-[11.5px] font-bold text-support">{TIER_LABELS[tier]}</span>
}
