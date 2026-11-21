import type { Database } from 'better-sqlite3'
import { ID } from '@domain/base'
import {
  SeoCompetitorAlreadySavedError,
  SeoCompetitorData,
  SeoDocumentAlreadySavedError,
  SeoRound,
  SeoRoundDocument,
  SeoRoundRepository,
} from '@domain/competitor-analysis'
import {
  SeoCompetitorRecord,
  SeoDocumentRecord,
  SeoRoundMapper,
  SeoRoundRecord,
} from '@infra/db/repos/seo-round/mapper'

const ROUND_COLUMNS = `
  id, project_id AS projectId, tool, collected_at AS collectedAt, note, market,
  expected_competitors AS expectedCompetitors, searches, created_at AS createdAt
`

const COMPETITOR_COLUMNS = `
  id, round_id AS roundId, normalized_name AS normalizedName, name, data
`

const DOCUMENT_COLUMNS = `
  id, round_id AS roundId, file_name AS fileName, position, title, about, body
`

export class SqliteSeoRoundRepository extends SeoRoundRepository {
  constructor(private readonly database: Database) {
    super()
  }

  async createRound(round: SeoRound): Promise<SeoRound> {
    this.database
      .prepare(
        `INSERT INTO seo_rounds
           (id, project_id, tool, collected_at, note, market, expected_competitors, searches,
            created_at)
         VALUES (@id, @projectId, @tool, @collectedAt, @note, @market, @expectedCompetitors,
                 @searches, @createdAt)`,
      )
      .run(SeoRoundMapper.toPersistence(round))

    return round
  }

  async findRound(input: { projectId: ID; roundId?: ID }): Promise<SeoRound | null> {
    const projectId = input.projectId.toValue()
    const record = input.roundId
      ? this.database
          .prepare(`SELECT ${ROUND_COLUMNS} FROM seo_rounds WHERE project_id = ? AND id = ?`)
          .get(projectId, input.roundId.toValue())
      : this.database
          .prepare(
            `SELECT ${ROUND_COLUMNS} FROM seo_rounds WHERE project_id = ?
             ORDER BY created_at DESC, rowid DESC LIMIT 1`,
          )
          .get(projectId)

    return record ? SeoRoundMapper.toDomain(record as SeoRoundRecord) : null
  }

  async listRounds(projectId: ID): Promise<SeoRound[]> {
    const records = this.database
      .prepare(
        `SELECT ${ROUND_COLUMNS} FROM seo_rounds WHERE project_id = ?
         ORDER BY created_at, rowid`,
      )
      .all(projectId.toValue()) as SeoRoundRecord[]

    return records.map((record) => SeoRoundMapper.toDomain(record))
  }

  async insertCompetitor(competitor: SeoCompetitorData): Promise<void> {
    const persisted = SeoRoundMapper.competitorToPersistence(competitor)
    const insert = this.database.transaction(() => {
      const existing = this.database
        .prepare('SELECT 1 FROM seo_round_competitors WHERE round_id = ? AND normalized_name = ?')
        .get(persisted.roundId, persisted.normalizedName)

      if (existing) {
        throw new SeoCompetitorAlreadySavedError()
      }

      this.database
        .prepare(
          `INSERT INTO seo_round_competitors (id, round_id, normalized_name, name, data)
           VALUES (@id, @roundId, @normalizedName, @name, @data)`,
        )
        .run(persisted)
    })

    insert.immediate()
  }

  async insertDocument(document: SeoRoundDocument): Promise<void> {
    const roundId = document.props.roundId.toValue()
    const insert = this.database.transaction(() => {
      const existing = this.database
        .prepare('SELECT 1 FROM seo_round_documents WHERE round_id = ? AND file_name = ?')
        .get(roundId, document.props.fileName)

      if (existing) {
        throw new SeoDocumentAlreadySavedError()
      }

      const { count } = this.database
        .prepare('SELECT COUNT(*) AS count FROM seo_round_documents WHERE round_id = ?')
        .get(roundId) as { count: number }

      this.database
        .prepare(
          `INSERT INTO seo_round_documents (id, round_id, file_name, position, title, about, body)
           VALUES (@id, @roundId, @fileName, @position, @title, @about, @body)`,
        )
        .run(SeoRoundMapper.documentToPersistence(document, count))
    })

    insert.immediate()
  }

  async findCompetitor(input: {
    roundId: ID
    normalizedName: string
  }): Promise<SeoCompetitorData | null> {
    const record = this.database
      .prepare(
        `SELECT ${COMPETITOR_COLUMNS} FROM seo_round_competitors
         WHERE round_id = ? AND normalized_name = ?`,
      )
      .get(input.roundId.toValue(), input.normalizedName) as SeoCompetitorRecord | undefined

    return record ? SeoRoundMapper.competitorToDomain(record) : null
  }

  async listCompetitors(roundId: ID): Promise<SeoCompetitorData[]> {
    const records = this.database
      .prepare(
        `SELECT ${COMPETITOR_COLUMNS} FROM seo_round_competitors
         WHERE round_id = ? ORDER BY rowid`,
      )
      .all(roundId.toValue()) as SeoCompetitorRecord[]

    return records.map((record) => SeoRoundMapper.competitorToDomain(record))
  }

  async listDocuments(roundId: ID): Promise<SeoRoundDocument[]> {
    const records = this.database
      .prepare(
        `SELECT ${DOCUMENT_COLUMNS} FROM seo_round_documents WHERE round_id = ? ORDER BY position`,
      )
      .all(roundId.toValue()) as SeoDocumentRecord[]

    return records.map((record) => SeoRoundMapper.documentToDomain(record))
  }
}
