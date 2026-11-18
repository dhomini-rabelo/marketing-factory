import { UseCase, createID } from '@domain/base'
import type { CompetitorAnalysisRepos } from '@domain/competitor-analysis/application/types/repositories'
import { sortCompetitors } from '@domain/competitor-analysis/application/use-cases/competitor/sort-competitors'
import {
  Competitor,
  CompetitorApproval,
} from '@domain/competitor-analysis/enterprise/entities/competitor'

interface Payload {
  projectId: string
}

type Response = { approval: CompetitorApproval; competitors: Competitor[] }

export class ListCompetitorsUseCase implements UseCase<Payload, Response> {
  constructor(private readonly repos: Pick<CompetitorAnalysisRepos, 'project' | 'competitor'>) {}

  async execute(payload: Payload): Promise<Response> {
    const projectId = createID(payload.projectId)

    await this.repos.project.getOrThrow(projectId)

    const competitors = await this.repos.competitor.listByProject(projectId)
    const approval = await this.repos.competitor.getApproval(projectId)

    return { approval, competitors: sortCompetitors(competitors) }
  }
}
