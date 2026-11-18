import { createID, Serialize, WithID } from '@domain/base'
import { Document, DocumentProps, DocumentSummary } from '@domain/projects'

export type DocumentRecord = Serialize<WithID<DocumentProps>>

export type DocumentSummaryRecord = Omit<DocumentRecord, 'body'>

export class DocumentMapper {
  static toPersistence(document: Document): DocumentRecord {
    return {
      id: document.id.toValue(),
      projectId: document.props.projectId.toValue(),
      slug: document.props.slug,
      title: document.props.title,
      description: document.props.description,
      body: document.props.body,
      createdAt: document.props.createdAt.toISOString(),
      updatedAt: document.props.updatedAt.toISOString(),
    }
  }

  static toDomain(record: DocumentRecord): Document {
    return Document.reference(createID(record.id), {
      projectId: createID(record.projectId),
      slug: record.slug,
      title: record.title,
      description: record.description,
      body: record.body,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    })
  }

  static toSummary(record: DocumentSummaryRecord): DocumentSummary {
    return {
      id: createID(record.id),
      projectId: createID(record.projectId),
      slug: record.slug,
      title: record.title,
      description: record.description,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    }
  }
}
