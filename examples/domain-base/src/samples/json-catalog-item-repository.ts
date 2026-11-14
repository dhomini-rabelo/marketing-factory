import { z } from 'zod'

import { EntityWithStatic } from '@domain/base/entity/entity'
import { ID } from '@domain/base/entity/id'
import {
  JsonRepository,
  SerializedEntity,
} from '@domain/base/repository/json-repository'
import { CatalogItem } from '@domain/base/samples/catalog-item'
import { CatalogItemRepository } from '@domain/base/samples/repositories/catalog-item'

export class JsonCatalogItemRepository
  extends JsonRepository<CatalogItem>
  implements CatalogItemRepository
{
  protected entity = CatalogItem as unknown as EntityWithStatic<CatalogItem>
  protected filePath: string
  protected schema = z.object({
    id: z.string(),
    ownerId: z.string(),
    title: z.string(),
    tags: z.array(z.string()),
    createdAt: z.string(),
  }) as unknown as z.ZodType<SerializedEntity<CatalogItem>>

  constructor(filePath: string) {
    super()
    this.filePath = filePath
    this.loadFromDisk()
  }

  protected serialize(entity: CatalogItem): SerializedEntity<CatalogItem> {
    return {
      id: entity.id.toValue(),
      ownerId: entity.props.ownerId.toValue(),
      title: entity.props.title,
      tags: entity.props.tags,
      createdAt: entity.props.createdAt.toISOString(),
    }
  }

  protected deserialize(raw: SerializedEntity<CatalogItem>): CatalogItem {
    return CatalogItem.reference(new ID(raw.id), {
      ownerId: new ID(raw.ownerId),
      title: raw.title,
      tags: raw.tags,
      createdAt: new Date(raw.createdAt),
    })
  }
}
