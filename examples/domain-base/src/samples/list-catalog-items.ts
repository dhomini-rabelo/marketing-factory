import { UseCase } from '@domain/base/use-case'
import { CatalogItem } from '@domain/base/samples/catalog-item'
import { CatalogItemRepository } from '@domain/base/samples/repositories/catalog-item'

interface Payload {
  ownerId: CatalogItem['props']['ownerId']
}

type Response = CatalogItem[]

export class ListCatalogItemsUseCase implements UseCase<Payload, Response> {
  constructor(private catalogItemRepository: CatalogItemRepository) {}

  async execute(payload: Payload): Promise<Response> {
    return this.catalogItemRepository.findMany({
      ownerId: payload.ownerId,
    })
  }
}
