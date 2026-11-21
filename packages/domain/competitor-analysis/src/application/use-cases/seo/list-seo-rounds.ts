import { UseCase, createID } from '@domain/base'
import type { CompetitorAnalysisRepos } from '@domain/competitor-analysis/application/types/repositories'
import {
  Competitor,
  normalizeCompetitorName,
} from '@domain/competitor-analysis/enterprise/entities/competitor'
import {
  SeoRound,
  SeoRoundStatus,
  isCompleteSeoRound,
} from '@domain/competitor-analysis/enterprise/entities/seo-round'

interface Payload {
  projectId: string
}

export type SeoRoundSummary = {
  round: SeoRound
  number: number
  isLatest: boolean
  status: SeoRoundStatus
}

type Response = { rounds: SeoRoundSummary[] }

export class ListSeoRoundsUseCase implements UseCase<Payload, Response> {
  constructor(
    private readonly repos: Pick<CompetitorAnalysisRepos, 'project' | 'competitor' | 'seoRound'>,
  ) {}

  async execute(payload: Payload): Promise<Response> {
    const projectId = createID(payload.projectId)

    await this.repos.project.getOrThrow(projectId)

    const rounds = await this.repos.seoRound.listRounds(projectId)
    const competitors = await this.repos.competitor.listByProject(projectId)
    const incorrectNames = this.listIncorrectNames(competitors)

    const summaries = await Promise.all(
      rounds.map(async (round, index) => {
        const collected = await this.repos.seoRound.listCompetitors(round.id)
        const collectedNames = collected.map((item) => item.props.normalizedName)

        return {
          round,
          number: index + 1,
          isLatest: index === rounds.length - 1,
          status: isCompleteSeoRound(round, collectedNames, incorrectNames)
            ? SeoRoundStatus.COMPLETE
            : SeoRoundStatus.PARTIAL,
        }
      }),
    )

    return { rounds: summaries.reverse() }
  }

  private listIncorrectNames(competitors: Competitor[]): string[] {
    return competitors
      .filter((competitor) => competitor.props.incorrect)
      .map((competitor) => normalizeCompetitorName(competitor.props.name))
  }
}
