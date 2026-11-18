import { CatalogItem } from '@domain/base/samples/catalog-item'

export type CatalogItemMatchFilter = {
  query: string
  tag: string | null
}

export function buildMatchingCatalogItems(
  items: CatalogItem[],
  filter: CatalogItemMatchFilter,
): CatalogItem[] {
  const normalizedQuery = filter.query.trim().toLowerCase()

  return items.filter((item) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      item.props.title.toLowerCase().includes(normalizedQuery)
    const matchesTag =
      filter.tag === null || item.props.tags.includes(filter.tag)

    return matchesQuery && matchesTag
  })
}
