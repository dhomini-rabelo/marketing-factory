import { UseCase, createID } from '@domain/base'
import type { CompetitorAnalysisRepos } from '@domain/competitor-analysis/application/types/repositories'
import { sortCompetitors } from '@domain/competitor-analysis/application/use-cases/competitor/sort-competitors'
import {
  SeoWarning,
  checkSeoRound,
} from '@domain/competitor-analysis/application/use-cases/seo/get-seo-round/check-seo-round'
import { resolveSeoRound } from '@domain/competitor-analysis/application/use-cases/seo/resolve-seo-round'
import {
  Competitor,
  CompetitorRole,
  normalizeCompetitorName,
} from '@domain/competitor-analysis/enterprise/entities/competitor'
import { SeoCompetitorData } from '@domain/competitor-analysis/enterprise/entities/seo-competitor-data'
import {
  SeoRound,
  SeoRoundStatus,
  isCompleteSeoRound,
  listMissingSeoCompetitors,
} from '@domain/competitor-analysis/enterprise/entities/seo-round'

interface Payload {
  projectId: string
  roundId: string
}

export type SeoRoundCompetitorView = {
  name: string
  role: CompetitorRole
  collected: boolean
  pagesRead: number | null
  profile: Record<string, unknown> | null
  comparisons: object[]
  clusters: object[]
}

export type SeoRoundDocumentView = {
  title: string
  fileName: string
  about: string
  size: number
}

type Response = {
  round: SeoRound
  status: SeoRoundStatus
  missing: string[]
  warnings: SeoWarning[]
  pagesRead: number
  competitors: SeoRoundCompetitorView[]
  documents: SeoRoundDocumentView[]
}

export class GetSeoRoundUseCase implements UseCase<Payload, Response> {
  constructor(
    private readonly repos: Pick<CompetitorAnalysisRepos, 'project' | 'competitor' | 'seoRound'>,
  ) {}

  async execute(payload: Payload): Promise<Response> {
    const projectId = createID(payload.projectId)

    await this.repos.project.getOrThrow(projectId)
    const round = await resolveSeoRound(this.repos, { projectId, roundId: payload.roundId })

    const projectCompetitors = await this.repos.competitor.listByProject(projectId)
    const collected = await this.repos.seoRound.listCompetitors(round.id)
    const documents = await this.repos.seoRound.listDocuments(round.id)

    const collectedNames = collected.map((item) => item.props.normalizedName)
    const incorrectNames = this.listIncorrectNames(projectCompetitors)
    const visible = sortCompetitors(
      projectCompetitors.filter((competitor) =>
        this.isVisible(competitor, round, collectedNames),
      ),
    )
    const visibleCollected = visible.flatMap((competitor) => {
      const data = collected.find(
        (item) => item.props.normalizedName === normalizeCompetitorName(competitor.props.name),
      )

      return data ? [{ competitor, data }] : []
    })

    const warnings = checkSeoRound(
      visibleCollected.map(({ competitor, data }) => ({
        name: competitor.props.name,
        data: data.props.data,
      })),
    )

    return {
      round,
      status: isCompleteSeoRound(round, collectedNames, incorrectNames)
        ? SeoRoundStatus.COMPLETE
        : SeoRoundStatus.PARTIAL,
      missing: this.listMissingNames(
        listMissingSeoCompetitors(round, collectedNames, incorrectNames),
        projectCompetitors,
      ),
      warnings,
      pagesRead: visibleCollected.reduce(
        (total, { data }) => total + data.props.data.items.length,
        0,
      ),
      competitors: visible.map((competitor) => this.buildCompetitorView(competitor, collected)),
      documents: documents.map((document) => ({
        title: document.props.title,
        fileName: document.props.fileName,
        about: document.props.about,
        size: document.props.size,
      })),
    }
  }

  private isVisible(competitor: Competitor, round: SeoRound, collectedNames: string[]): boolean {
    const normalizedName = normalizeCompetitorName(competitor.props.name)

    return (
      !competitor.props.incorrect &&
      (round.props.expectedCompetitors.includes(normalizedName) ||
        collectedNames.includes(normalizedName))
    )
  }

  private listIncorrectNames(competitors: Competitor[]): string[] {
    return competitors
      .filter((competitor) => competitor.props.incorrect)
      .map((competitor) => normalizeCompetitorName(competitor.props.name))
  }

  private listMissingNames(missingNames: string[], competitors: Competitor[]): string[] {
    return missingNames.map((missingName) => {
      const competitor = competitors.find(
        (item) => normalizeCompetitorName(item.props.name) === missingName,
      )

      return competitor?.props.name ?? missingName
    })
  }

  private buildCompetitorView(
    competitor: Competitor,
    collected: SeoCompetitorData[],
  ): SeoRoundCompetitorView {
    const data = collected.find(
      (item) => item.props.normalizedName === normalizeCompetitorName(competitor.props.name),
    )

    return {
      name: competitor.props.name,
      role: competitor.props.role,
      collected: Boolean(data),
      pagesRead: data ? data.props.data.items.length : null,
      profile: data ? data.props.data.profile : null,
      comparisons: data ? data.props.data.comparisons : [],
      clusters: data ? data.props.data.clusters : [],
    }
  }
}
