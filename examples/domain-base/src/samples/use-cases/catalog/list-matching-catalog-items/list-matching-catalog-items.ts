import { UseCase } from '@domain/base/use-case'
import { CatalogItem } from '@domain/base/samples/catalog-item'
import { CatalogItemRepository } from '@domain/base/samples/repositories/catalog-item'
import { buildMatchingCatalogItems } from './build-matching-catalog-items'

interface Payload {
  ownerId: CatalogItem['props']['ownerId']
  query: string
  tag: string | null
}

type Response = CatalogItem[]

export class ListMatchingCatalogItemsUseCase implements UseCase<Payload, Response> {
  constructor(private catalogItemRepository: CatalogItemRepository) {}

  async execute(payload: Payload): Promise<Response> {
    const items = await this.catalogItemRepository.findMany({
      ownerId: payload.ownerId,
    })

    return buildMatchingCatalogItems(items, {
      query: payload.query,
      tag: payload.tag,
    })
  }
}
