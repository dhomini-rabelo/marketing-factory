import { EntityWithStatic } from '@domain/base/entity/entity'
import { InMemoryRepository } from '@domain/base/repository/repository'
import { CatalogItem } from '@domain/base/samples/catalog-item'
import { CatalogItemRepository } from '@domain/base/samples/repositories/catalog-item'

export class InMemoryCatalogItemRepository
  extends InMemoryRepository<CatalogItem>
  implements CatalogItemRepository
{
  protected entity = CatalogItem as unknown as EntityWithStatic<CatalogItem>
}
