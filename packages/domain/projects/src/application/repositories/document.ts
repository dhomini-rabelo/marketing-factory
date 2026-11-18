import { ID } from '@domain/base'
import { Document, DocumentSummary } from '@domain/projects/enterprise/entities/document'

export abstract class DocumentRepository {
  abstract saveByTitle(document: Document): Promise<{ document: Document; wasCreated: boolean }>
  abstract listSummaries(projectId: ID): Promise<DocumentSummary[]>
  abstract getOrThrow(input: { projectId: ID; slug: string }): Promise<Document>
}
