import { DangerErrors, DomainError, UseCase, createID } from '@domain/base'
import type { CompetitorAnalysisRepos } from '@domain/competitor-analysis/application/types/repositories'
import { findProjectCompetitor } from '@domain/competitor-analysis/application/use-cases/seo/find-project-competitor'
import { resolveSeoRound } from '@domain/competitor-analysis/application/use-cases/seo/resolve-seo-round'
import { normalizeCompetitorName } from '@domain/competitor-analysis/enterprise/entities/competitor'
import { SeoCompetitorData } from '@domain/competitor-analysis/enterprise/entities/seo-competitor-data'
import { SeoRound } from '@domain/competitor-analysis/enterprise/entities/seo-round'
import { SeoRoundDocument } from '@domain/competitor-analysis/enterprise/entities/seo-round-document'

interface Payload {
  projectId: string
  roundId: string
  name: string
}

type Response = {
  round: SeoRound
  competitor: SeoCompetitorData
  documents: SeoRoundDocument[]
}

export class GetSeoCompetitorUseCase implements UseCase<Payload, Response> {
  constructor(
    private readonly repos: Pick<CompetitorAnalysisRepos, 'project' | 'competitor' | 'seoRound'>,
  ) {}

  async execute(payload: Payload): Promise<Response> {
    const projectId = createID(payload.projectId)

    await this.repos.project.getOrThrow(projectId)
    const round = await resolveSeoRound(this.repos, { projectId, roundId: payload.roundId })
    const projectCompetitor = await findProjectCompetitor(this.repos, {
      projectId,
      name: payload.name,
    })
    const normalizedName = normalizeCompetitorName(projectCompetitor.props.name)

    const competitor = await this.repos.seoRound.findCompetitor({
      roundId: round.id,
      normalizedName,
    })

    if (!competitor) {
      throw new DomainError({
        code: 'SEO_COMPETITOR_NOT_FOUND',
        errorType: DangerErrors.NOT_FOUND,
      })
    }

    const documents = await this.repos.seoRound.listDocuments(round.id)

    return {
      round,
      competitor,
      documents: documents.filter((document) => this.mentions(document, normalizedName)),
    }
  }

  private mentions(document: SeoRoundDocument, normalizedName: string): boolean {
    return (
      normalizeCompetitorName(document.props.title).includes(normalizedName) ||
      normalizeCompetitorName(document.props.about).includes(normalizedName)
    )
  }
}
