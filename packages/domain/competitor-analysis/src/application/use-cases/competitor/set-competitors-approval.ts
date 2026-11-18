import { ID, UseCase, createID } from '@domain/base'
import { NoActiveCompetitorsError } from '@domain/competitor-analysis/application/errors/no-active-competitors-error'
import type { CompetitorAnalysisRepos } from '@domain/competitor-analysis/application/types/repositories'
import { CompetitorApproval } from '@domain/competitor-analysis/enterprise/entities/competitor'

interface Payload {
  projectId: string
  approved: boolean
}

type Response = { approval: CompetitorApproval }

export class SetCompetitorsApprovalUseCase implements UseCase<Payload, Response> {
  constructor(private readonly repos: Pick<CompetitorAnalysisRepos, 'project' | 'competitor'>) {}

  async execute(payload: Payload): Promise<Response> {
    const projectId = createID(payload.projectId)

    await this.repos.project.getOrThrow(projectId)

    const approval = payload.approved ? CompetitorApproval.APPROVED : CompetitorApproval.PENDING

    if (payload.approved) {
      await this.ensureActiveCompetitorExists(projectId)
    }

    await this.repos.competitor.setApproval({ projectId, approval })

    return { approval }
  }

  private async ensureActiveCompetitorExists(projectId: ID): Promise<void> {
    const competitors = await this.repos.competitor.listByProject(projectId)
    const hasActiveCompetitor = competitors.some((competitor) => !competitor.props.incorrect)

    if (!hasActiveCompetitor) {
      throw new NoActiveCompetitorsError()
    }
  }
}
