import { ID } from '@domain/base'
import { SeoCompetitorData } from '@domain/competitor-analysis/enterprise/entities/seo-competitor-data'
import { SeoRound } from '@domain/competitor-analysis/enterprise/entities/seo-round'
import { SeoRoundDocument } from '@domain/competitor-analysis/enterprise/entities/seo-round-document'

export abstract class SeoRoundRepository {
  abstract createRound(round: SeoRound): Promise<SeoRound>
  abstract findRound(input: { projectId: ID; roundId?: ID }): Promise<SeoRound | null>
  abstract listRounds(projectId: ID): Promise<SeoRound[]>
  abstract insertCompetitor(competitor: SeoCompetitorData): Promise<void>
  abstract insertDocument(document: SeoRoundDocument): Promise<void>
  abstract findCompetitor(input: {
    roundId: ID
    normalizedName: string
  }): Promise<SeoCompetitorData | null>
  abstract listCompetitors(roundId: ID): Promise<SeoCompetitorData[]>
  abstract listDocuments(roundId: ID): Promise<SeoRoundDocument[]>
}
