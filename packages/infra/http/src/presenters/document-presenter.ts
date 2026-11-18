import type { Serialize, WithID } from '@domain/base'
import type { Document, DocumentProps, DocumentSummary } from '@domain/projects'

export type DocumentHttp = Omit<Serialize<WithID<DocumentProps>>, 'id' | 'projectId'>

export type DocumentListItemHttp = Omit<
  Serialize<DocumentSummary>,
  'id' | 'projectId' | 'createdAt'
>

export class DocumentPresenter {
  static toHttp(document: Document): DocumentHttp {
    return {
      slug: document.props.slug,
      title: document.props.title,
      description: document.props.description,
      body: document.props.body,
      createdAt: document.props.createdAt.toISOString(),
      updatedAt: document.props.updatedAt.toISOString(),
    }
  }

  static toListItemHttp(summary: DocumentSummary): DocumentListItemHttp {
    return {
      slug: summary.slug,
      title: summary.title,
      description: summary.description,
      updatedAt: summary.updatedAt.toISOString(),
    }
  }
}
