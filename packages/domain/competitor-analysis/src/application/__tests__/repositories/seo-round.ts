import { ID } from '@domain/base'
import { SeoRoundRepository } from '@domain/competitor-analysis/application/repositories/seo-round'
import { SeoCompetitorAlreadySavedError } from '@domain/competitor-analysis/application/errors/seo-competitor-already-saved-error'
import { SeoDocumentAlreadySavedError } from '@domain/competitor-analysis/application/errors/seo-document-already-saved-error'
import { SeoCompetitorData } from '@domain/competitor-analysis/enterprise/entities/seo-competitor-data'
import { SeoRound } from '@domain/competitor-analysis/enterprise/entities/seo-round'
import { SeoRoundDocument } from '@domain/competitor-analysis/enterprise/entities/seo-round-document'

export class InMemorySeoRoundRepository extends SeoRoundRepository {
  public rounds: SeoRound[] = []
  public competitors: SeoCompetitorData[] = []
  public documents: SeoRoundDocument[] = []

  async createRound(round: SeoRound): Promise<SeoRound> {
    this.rounds.push(round)
    return round
  }

  async findRound(input: { projectId: ID; roundId?: ID }): Promise<SeoRound | null> {
    const rounds = this.rounds.filter((round) => round.props.projectId.isEqual(input.projectId))
    const { roundId } = input

    if (!roundId) {
      return rounds.at(-1) ?? null
    }

    return rounds.find((round) => round.id.isEqual(roundId)) ?? null
  }

  async listRounds(projectId: ID): Promise<SeoRound[]> {
    return this.rounds.filter((round) => round.props.projectId.isEqual(projectId))
  }

  async insertCompetitor(competitor: SeoCompetitorData): Promise<void> {
    const existing = await this.findCompetitor({
      roundId: competitor.props.roundId,
      normalizedName: competitor.props.normalizedName,
    })

    if (existing) {
      throw new SeoCompetitorAlreadySavedError()
    }

    this.competitors.push(competitor)
  }

  async insertDocument(document: SeoRoundDocument): Promise<void> {
    const existing = this.documents.some(
      (item) =>
        item.props.roundId.isEqual(document.props.roundId) &&
        item.props.fileName === document.props.fileName,
    )

    if (existing) {
      throw new SeoDocumentAlreadySavedError()
    }

    this.documents.push(document)
  }

  async findCompetitor(input: {
    roundId: ID
    normalizedName: string
  }): Promise<SeoCompetitorData | null> {
    const competitor = this.competitors.find(
      (item) =>
        item.props.roundId.isEqual(input.roundId) &&
        item.props.normalizedName === input.normalizedName,
    )

    return competitor ?? null
  }

  async listCompetitors(roundId: ID): Promise<SeoCompetitorData[]> {
    return this.competitors.filter((item) => item.props.roundId.isEqual(roundId))
  }

  async listDocuments(roundId: ID): Promise<SeoRoundDocument[]> {
    return this.documents.filter((item) => item.props.roundId.isEqual(roundId))
  }
}
