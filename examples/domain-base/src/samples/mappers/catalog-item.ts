import { ID } from '@domain/base/entity/id'
import { CatalogItem } from '@domain/base/samples/catalog-item'

export type CatalogItemRow = {
  id: string
  ownerId: string
  title: string
  tags: string
  createdAt: string
}

export class CatalogItemMapper {
  static serialize(entity: CatalogItem): CatalogItemRow {
    return {
      id: entity.id.toValue(),
      ownerId: entity.props.ownerId.toValue(),
      title: entity.props.title,
      tags: JSON.stringify(entity.props.tags),
      createdAt: entity.props.createdAt.toISOString(),
    }
  }

  static deserialize(row: CatalogItemRow): CatalogItem {
    return CatalogItem.reference(new ID(row.id), {
      ownerId: new ID(row.ownerId),
      title: row.title,
      tags: JSON.parse(row.tags) as string[],
      createdAt: new Date(row.createdAt),
    })
  }
}
