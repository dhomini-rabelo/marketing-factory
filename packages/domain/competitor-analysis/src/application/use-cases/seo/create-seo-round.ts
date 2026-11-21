import { UseCase, createID } from '@domain/base'
import { NoActiveCompetitorsError } from '@domain/competitor-analysis/application/errors/no-active-competitors-error'
import type { CompetitorAnalysisRepos } from '@domain/competitor-analysis/application/types/repositories'
import {
  CompetitorApproval,
  normalizeCompetitorName,
} from '@domain/competitor-analysis/enterprise/entities/competitor'
import { SeoRound, SeoTool } from '@domain/competitor-analysis/enterprise/entities/seo-round'
import { getNow } from '@modules/utils'

interface Payload {
  projectId: string
  tool: string
  collectedAt: string
  note: string
  market: string
  searches?: object[]
}

type Response = SeoRound

export class CreateSeoRoundUseCase implements UseCase<Payload, Response> {
  constructor(
    private readonly repos: Pick<CompetitorAnalysisRepos, 'project' | 'competitor' | 'seoRound'>,
  ) {}

  async execute(payload: Payload): Promise<Response> {
    const projectId = createID(payload.projectId)

    await this.repos.project.getOrThrow(projectId)

    const approval = await this.repos.competitor.getApproval(projectId)
    const competitors = await this.repos.competitor.listByProject(projectId)
    const expectedCompetitors = competitors
      .filter((competitor) => !competitor.props.incorrect)
      .map((competitor) => normalizeCompetitorName(competitor.props.name))

    if (approval !== CompetitorApproval.APPROVED || expectedCompetitors.length === 0) {
      throw new NoActiveCompetitorsError()
    }

    const round = SeoRound.create({
      projectId,
      tool: payload.tool as SeoTool,
      collectedAt: new Date(payload.collectedAt),
      note: payload.note,
      market: payload.market,
      expectedCompetitors,
      searches: payload.searches ?? [],
      createdAt: getNow(),
    })

    return this.repos.seoRound.createRound(round)
  }
}
