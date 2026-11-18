import { Entity } from '@domain/base/entity/entity'
import { ID } from '@domain/base/entity/id'

export interface CatalogItemProps {
  ownerId: ID
  title: string
  tags: string[]
  createdAt: Date
}

export class CatalogItem extends Entity<CatalogItemProps> {
  static create(props: CatalogItemProps) {
    return new CatalogItem(props)
  }

  static reference(id: ID, props: CatalogItemProps) {
    return new CatalogItem(props, id)
  }
}
