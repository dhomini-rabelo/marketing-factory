import { UseCase, createID } from '@domain/base'
import type { CompetitorAnalysisRepos } from '@domain/competitor-analysis/application/types/repositories'
import { findProjectCompetitor } from '@domain/competitor-analysis/application/use-cases/seo/find-project-competitor'
import { resolveSeoRound } from '@domain/competitor-analysis/application/use-cases/seo/resolve-seo-round'
import { normalizeCompetitorName } from '@domain/competitor-analysis/enterprise/entities/competitor'
import {
  SeoCompetitorData,
  SeoCompetitorPayload,
} from '@domain/competitor-analysis/enterprise/entities/seo-competitor-data'

interface Payload {
  projectId: string
  roundId: string
  name: string
  data: SeoCompetitorPayload
}

type Response = SeoCompetitorData

export class SaveSeoCompetitorUseCase implements UseCase<Payload, Response> {
  constructor(
    private readonly repos: Pick<CompetitorAnalysisRepos, 'project' | 'competitor' | 'seoRound'>,
  ) {}

  async execute(payload: Payload): Promise<Response> {
    const projectId = createID(payload.projectId)

    await this.repos.project.getOrThrow(projectId)
    const round = await resolveSeoRound(this.repos, { projectId, roundId: payload.roundId })
    const competitor = await findProjectCompetitor(this.repos, { projectId, name: payload.name })

    const competitorData = SeoCompetitorData.create({
      roundId: round.id,
      name: competitor.props.name,
      normalizedName: normalizeCompetitorName(competitor.props.name),
      data: payload.data,
    })

    await this.repos.seoRound.insertCompetitor(competitorData)

    return competitorData
  }
}
