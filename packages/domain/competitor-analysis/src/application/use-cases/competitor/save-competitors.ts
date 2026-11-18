import { ID, UseCase, createID } from '@domain/base'
import type { CompetitorAnalysisRepos } from '@domain/competitor-analysis/application/types/repositories'
import { sortCompetitors } from '@domain/competitor-analysis/application/use-cases/competitor/sort-competitors'
import {
  CompetitorInput,
  validateCompetitorsInput,
} from '@domain/competitor-analysis/application/validation/competitors'
import {
  Competitor,
  CompetitorApproval,
  CompetitorRole,
} from '@domain/competitor-analysis/enterprise/entities/competitor'
import { getNow } from '@modules/utils'

interface Payload {
  projectId: string
  competitors: CompetitorInput[]
}

type Response = { approval: CompetitorApproval; competitors: Competitor[]; wasCreated: boolean }

export class SaveCompetitorsUseCase implements UseCase<Payload, Response> {
  constructor(private readonly repos: Pick<CompetitorAnalysisRepos, 'project' | 'competitor'>) {}

  async execute(payload: Payload): Promise<Response> {
    const projectId = createID(payload.projectId)

    await this.repos.project.getOrThrow(projectId)
    validateCompetitorsInput(payload)

    const now = getNow()
    const competitors = payload.competitors.map((competitor) =>
      this.buildCompetitor({ projectId, competitor, qualifiedAt: now }),
    )

    const saved = await this.repos.competitor.replaceList({ projectId, competitors })
    const approval = await this.repos.competitor.getApproval(projectId)

    return { approval, competitors: sortCompetitors(saved.competitors), wasCreated: saved.wasCreated }
  }

  private buildCompetitor(input: {
    projectId: ID
    competitor: CompetitorInput
    qualifiedAt: Date
  }): Competitor {
    const { competitor } = input
    const url = competitor.url?.trim()

    return Competitor.create({
      projectId: input.projectId,
      name: competitor.name.trim(),
      role: competitor.role as CompetitorRole,
      marketFocus: competitor.marketFocus.trim(),
      services: competitor.services.trim(),
      features: competitor.features.trim(),
      audience: competitor.audience.trim(),
      rationale: competitor.rationale.trim(),
      url: url ? url : null,
      incorrect: false,
      qualifiedAt: input.qualifiedAt,
    })
  }
}
