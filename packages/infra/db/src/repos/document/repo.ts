import type { Database } from 'better-sqlite3'
import { DangerErrors, DomainError, ID } from '@domain/base'
import { Document, DocumentRepository, DocumentSummary } from '@domain/projects'
import {
  DocumentMapper,
  DocumentRecord,
  DocumentSummaryRecord,
} from '@infra/db/repos/document/mapper'

const SUMMARY_COLUMNS = `
  id, project_id AS projectId, slug, title, description,
  created_at AS createdAt, updated_at AS updatedAt
`

const FIND_BY_SLUG = `
  SELECT ${SUMMARY_COLUMNS}, body
  FROM documents
  WHERE project_id = ? AND slug = ?
`

export class SqliteDocumentRepository extends DocumentRepository {
  constructor(private readonly database: Database) {
    super()
  }

  async saveByTitle(document: Document): Promise<{ document: Document; wasCreated: boolean }> {
    const record = DocumentMapper.toPersistence(document)
    const save = this.database.transaction(() => {
      const existing = this.findRecord(record.projectId, record.slug)

      this.database
        .prepare(
          `INSERT INTO documents
             (id, project_id, slug, title, description, body, created_at, updated_at)
           VALUES (@id, @projectId, @slug, @title, @description, @body, @createdAt, @updatedAt)
           ON CONFLICT (project_id, slug) DO UPDATE SET
             title = excluded.title,
             description = excluded.description,
             body = excluded.body,
             updated_at = excluded.updated_at`,
        )
        .run(record)

      const saved = this.findRecord(record.projectId, record.slug) as DocumentRecord

      return { document: DocumentMapper.toDomain(saved), wasCreated: existing === undefined }
    })

    return save.immediate()
  }

  async listSummaries(projectId: ID): Promise<DocumentSummary[]> {
    const records = this.database
      .prepare(
        `SELECT ${SUMMARY_COLUMNS}
         FROM documents
         WHERE project_id = ?
         ORDER BY updated_at DESC, id`,
      )
      .all(projectId.toValue()) as DocumentSummaryRecord[]

    return records.map((record) => DocumentMapper.toSummary(record))
  }

  async getOrThrow(input: { projectId: ID; slug: string }): Promise<Document> {
    const record = this.findRecord(input.projectId.toValue(), input.slug)

    if (!record) {
      throw new DomainError({ code: 'DOCUMENT_NOT_FOUND', errorType: DangerErrors.NOT_FOUND })
    }

    return DocumentMapper.toDomain(record)
  }

  private findRecord(projectId: string, slug: string): DocumentRecord | undefined {
    return this.database.prepare(FIND_BY_SLUG).get(projectId, slug) as DocumentRecord | undefined
  }
}
