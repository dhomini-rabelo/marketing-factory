import { CompetitorApproval, type CompetitorsList } from '@/api/models/competitor'

export enum CompetitorsStatus {
  NONE = 'none',
  PENDING = 'pending',
  APPROVED = 'approved',
}

export const COMPETITORS_STATUS_LABELS: Record<CompetitorsStatus, string> = {
  [CompetitorsStatus.NONE]: 'sem lista',
  [CompetitorsStatus.PENDING]: 'aguardando aprovação',
  [CompetitorsStatus.APPROVED]: 'aprovada',
}

export function getCompetitorsStatus(list: CompetitorsList): CompetitorsStatus {
  if (list.approval === CompetitorApproval.APPROVED) return CompetitorsStatus.APPROVED
  return list.competitors.length === 0 ? CompetitorsStatus.NONE : CompetitorsStatus.PENDING
}
