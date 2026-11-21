import { DangerErrors, DomainError, ID, createID } from '@domain/base'
import type { CompetitorAnalysisRepos } from '@domain/competitor-analysis/application/types/repositories'
import { SeoRound } from '@domain/competitor-analysis/enterprise/entities/seo-round'

export const LATEST_SEO_ROUND = 'latest'

export async function resolveSeoRound(
  repos: Pick<CompetitorAnalysisRepos, 'seoRound'>,
  input: { projectId: ID; roundId: string },
): Promise<SeoRound> {
  const roundId = input.roundId === LATEST_SEO_ROUND ? undefined : createID(input.roundId)
  const round = await repos.seoRound.findRound({ projectId: input.projectId, roundId })

  if (!round) {
    throw new DomainError({ code: 'SEO_ROUND_NOT_FOUND', errorType: DangerErrors.NOT_FOUND })
  }

  return round
}
