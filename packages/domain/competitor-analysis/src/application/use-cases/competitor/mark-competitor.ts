import { UseCase, createID } from '@domain/base'
import type { CompetitorAnalysisRepos } from '@domain/competitor-analysis/application/types/repositories'
import { Competitor } from '@domain/competitor-analysis/enterprise/entities/competitor'

interface Payload {
  projectId: string
  competitorId: string
  incorrect: boolean
}

type Response = Competitor

export class MarkCompetitorUseCase implements UseCase<Payload, Response> {
  constructor(private readonly repos: Pick<CompetitorAnalysisRepos, 'project' | 'competitor'>) {}

  async execute(payload: Payload): Promise<Response> {
    const projectId = createID(payload.projectId)

    await this.repos.project.getOrThrow(projectId)

    return this.repos.competitor.setIncorrect({
      projectId,
      competitorId: createID(payload.competitorId),
      incorrect: payload.incorrect,
    })
  }
}
