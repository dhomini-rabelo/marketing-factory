import { Entity } from '@domain/base/entity/entity'
import { ID } from '@domain/base/entity/id'
import {
  IndexFieldSet,
  RepositoryIndexes,
} from '@domain/base/nosql-repository/repository'
import { TimestampProps } from '@domain/base/types'

export interface IndexedDocumentProps extends TimestampProps {
  ownerId: ID
  title: string
}

export class IndexedDocument extends Entity<IndexedDocumentProps> {
  static create(props: IndexedDocumentProps) {
    return new IndexedDocument(props)
  }

  static reference(id: ID, props: IndexedDocumentProps) {
    return new IndexedDocument(props, id)
  }
}

export enum IndexedDocumentIndexes {
  OWNER_ID_AND_UPDATED_AT = 'idx-ownerId-updatedAt',
}

export const indexedDocumentIndexFields: Record<
  RepositoryIndexes<IndexedDocumentIndexes>,
  IndexFieldSet<IndexedDocument>
> = {
  id: ['id'],
  [IndexedDocumentIndexes.OWNER_ID_AND_UPDATED_AT]: ['ownerId', 'updatedAt'],
}
