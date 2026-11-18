import { Seal } from '@/layout/components/sidebar/components/seal'
import { COMPETITORS_STATUS_LABELS, CompetitorsStatus } from '@/layout/components/sidebar/utils/competitors-status'

type CompetitorsStatusBadgeProps = {
  status: CompetitorsStatus
}

const STATUS_TONES = {
  [CompetitorsStatus.NONE]: 'muted',
  [CompetitorsStatus.PENDING]: 'attention',
  [CompetitorsStatus.APPROVED]: 'success',
} as const

export function CompetitorsStatusBadge({ status }: CompetitorsStatusBadgeProps) {
  return <Seal tone={STATUS_TONES[status]}>{COMPETITORS_STATUS_LABELS[status]}</Seal>
}
