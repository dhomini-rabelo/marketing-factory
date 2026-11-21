import { UseCase, createID } from '@domain/base'
import type { CompetitorAnalysisRepos } from '@domain/competitor-analysis/application/types/repositories'
import { resolveSeoRound } from '@domain/competitor-analysis/application/use-cases/seo/resolve-seo-round'
import { SeoRoundDocument } from '@domain/competitor-analysis/enterprise/entities/seo-round-document'

interface Payload {
  projectId: string
  roundId: string
  title: string
  fileName: string
  about: string
  body: string
}

type Response = SeoRoundDocument

export class SaveSeoDocumentUseCase implements UseCase<Payload, Response> {
  constructor(private readonly repos: Pick<CompetitorAnalysisRepos, 'project' | 'seoRound'>) {}

  async execute(payload: Payload): Promise<Response> {
    const projectId = createID(payload.projectId)

    await this.repos.project.getOrThrow(projectId)
    const round = await resolveSeoRound(this.repos, { projectId, roundId: payload.roundId })

    const document = SeoRoundDocument.create({
      roundId: round.id,
      title: payload.title,
      fileName: payload.fileName,
      about: payload.about,
      body: payload.body,
      size: new TextEncoder().encode(payload.body).length,
    })

    await this.repos.seoRound.insertDocument(document)

    return document
  }
}
