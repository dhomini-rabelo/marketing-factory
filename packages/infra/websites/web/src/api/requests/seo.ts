import { apiFetch } from '@/api/client'
import type { SeoCompetitor, SeoRound, SeoRoundSummary } from '@/api/models/seo'
import { API_ROUTES } from '@/api/routes'
import type { SeoRoundsResponse } from '@/api/types'

export async function listSeoRounds(projectId: string): Promise<SeoRoundSummary[]> {
  const response = await apiFetch<SeoRoundsResponse>(API_ROUTES.seo.rounds(projectId))
  return response.rounds
}

export function getSeoRound(projectId: string, roundId: string): Promise<SeoRound> {
  return apiFetch<SeoRound>(API_ROUTES.seo.round(projectId, roundId))
}

export function getSeoCompetitor(
  projectId: string,
  roundId: string,
  competitorName: string,
): Promise<SeoCompetitor> {
  return apiFetch<SeoCompetitor>(API_ROUTES.seo.competitor(projectId, roundId, competitorName))
}
