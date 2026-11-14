import { Repository } from '@domain/base/nosql-repository/repository'
import { IndexedDocument, IndexedDocumentIndexes } from '@domain/base/samples/indexed-document'

export abstract class IndexedDocumentRepository extends Repository<
  IndexedDocument,
  IndexedDocumentIndexes
> {}
