import { EntityWithStatic } from '@domain/base/entity/entity'
import { InMemoryRepository } from '@domain/base/nosql-repository/in-memory'
import {
  IndexedDocument,
  IndexedDocumentIndexes,
  indexedDocumentIndexFields,
} from '@domain/base/samples/indexed-document'
import { IndexedDocumentRepository } from '@domain/base/samples/repositories/indexed-document'

export class InMemoryIndexedDocumentRepository
  extends InMemoryRepository<IndexedDocument, IndexedDocumentIndexes>
  implements IndexedDocumentRepository
{
  protected entity =
    IndexedDocument as unknown as EntityWithStatic<IndexedDocument>
  protected indexes = indexedDocumentIndexFields
}
