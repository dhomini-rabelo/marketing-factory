import { apiFetch } from '@/api/client'
import type { Competitor, CompetitorsList } from '@/api/models/competitor'
import { API_ROUTES } from '@/api/routes'
import type { CompetitorsApprovalResponse } from '@/api/types'

export function listCompetitors(projectId: string): Promise<CompetitorsList> {
  return apiFetch<CompetitorsList>(API_ROUTES.competitors.list(projectId))
}

export function markCompetitor(
  projectId: string,
  competitorId: string,
  incorrect: boolean,
): Promise<Competitor> {
  return apiFetch<Competitor>(API_ROUTES.competitors.detail(projectId, competitorId), {
    method: 'PATCH',
    body: JSON.stringify({ incorrect }),
  })
}

export function setCompetitorsApproval(
  projectId: string,
  approved: boolean,
): Promise<CompetitorsApprovalResponse> {
  return apiFetch<CompetitorsApprovalResponse>(API_ROUTES.competitors.approval(projectId), {
    method: 'PUT',
    body: JSON.stringify({ approved }),
  })
}
