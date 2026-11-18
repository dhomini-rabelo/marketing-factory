import { Entity, ID } from '@domain/base'

export interface DocumentProps {
  projectId: ID
  slug: string
  title: string
  description: string
  body: string
  createdAt: Date
  updatedAt: Date
}

export class Document extends Entity<DocumentProps> {
  static create(props: DocumentProps) {
    return new Document(props)
  }

  static reference(id: ID, props: DocumentProps) {
    return new Document(props, id)
  }
}

export type DocumentSummary = Omit<DocumentProps, 'body'> & { id: ID }
