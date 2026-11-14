import { Repository } from '@domain/base/repository/repository'
import { CatalogItem } from '@domain/base/samples/catalog-item'

export abstract class CatalogItemRepository extends Repository<CatalogItem> {}
