import { DangerErrors, DomainError, ID } from '@domain/base'
import type { CompetitorAnalysisRepos } from '@domain/competitor-analysis/application/types/repositories'
import {
  Competitor,
  normalizeCompetitorName,
} from '@domain/competitor-analysis/enterprise/entities/competitor'

export async function findProjectCompetitor(
  repos: Pick<CompetitorAnalysisRepos, 'competitor'>,
  input: { projectId: ID; name: string },
): Promise<Competitor> {
  const normalizedName = normalizeCompetitorName(input.name)
  const competitors = await repos.competitor.listByProject(input.projectId)
  const competitor = competitors.find(
    (item) => normalizeCompetitorName(item.props.name) === normalizedName,
  )

  if (!competitor) {
    throw new DomainError({ code: 'COMPETITOR_NOT_FOUND', errorType: DangerErrors.NOT_FOUND })
  }

  return competitor
}
