import { AnyRecord, Complement, KeyOf } from '@modules/utils'
import { cloneValue } from '@domain/base/repository/clone-value'
import { Entity, EntityWithStatic } from '@domain/base/entity/entity'
import { ID } from '@domain/base/entity/id'
import { ValueObject } from '@domain/base/entity/value-object'
import { WithID } from '@domain/base/types'
import { decodeCursor, encodeCursor } from '@domain/base/repository/cursor'
import {
  BetweenQuery,
  ContainsQuery,
  GreaterQuery,
  InQuery,
  LowerOrEqualQuery,
  NotEqualQuery,
  NotInQuery,
  Query,
  QueryTypes,
} from '@domain/base/repository/queries'
import { RepeatedResource, ResourceNotFoundError } from '@domain/base/repository/repository-errors'

const DEFAULT_PAGE_NUMBER = 1
const SORT_ASCENDING = 1
const SORT_DESCENDING = -1

export type QueryFilters<Props extends AnyRecord> = {
  limit?: number
  page?: number
  orderBy?: KeyOf<Props>
  order?: 'asc' | 'desc'
}

export type CursorQueryFilters<Props extends AnyRecord> = {
  limit?: number
  cursor?: string | null
  orderBy?: KeyOf<Props>
  order?: 'asc' | 'desc'
}

export type PaginationResponse<Data extends AnyRecord> = {
  items: Data[]
  totalItems: number
  page: number
}

export type CursorPaginationResponse<Data extends AnyRecord> = {
  items: Data[]
  hasMore: boolean
  nextCursor: string | null
}

export abstract class Repository<EntityClass extends Entity> {
  abstract create(props: EntityClass['props']): Promise<EntityClass>

  abstract update(
    id: ID,
    newProps: Partial<EntityClass['props']>,
  ): Promise<EntityClass>

  abstract updateMany(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    newProps: Partial<EntityClass['props']>,
  ): Promise<EntityClass[]>

  abstract getOrThrow(
    props: Partial<WithID<EntityClass['props']>>,
  ): Promise<EntityClass>

  abstract getOrNull(
    props: Partial<WithID<EntityClass['props']>>,
  ): Promise<EntityClass | null>

  abstract findFirst(
    props: Partial<WithID<EntityClass['props']>>,
  ): Promise<EntityClass | null>

  abstract findMany(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    params?: QueryFilters<EntityClass['props']>,
  ): Promise<EntityClass[]>

  abstract findManyWithPagination(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    params?: QueryFilters<EntityClass['props']>,
  ): Promise<PaginationResponse<EntityClass>>

  abstract findManyWithCursorPagination(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    params?: CursorQueryFilters<EntityClass['props']>,
  ): Promise<CursorPaginationResponse<EntityClass>>

  abstract count(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
  ): Promise<number>

  abstract delete(id: ID): Promise<EntityClass>

  abstract deleteMany(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
  ): Promise<void>

  abstract clone<T = any>(clientRepository?: T): Repository<EntityClass>
}

export abstract class InMemoryRepository<
  EntityClass extends Entity,
> implements Repository<EntityClass> {
  protected items: EntityClass[] = []
  protected abstract entity: EntityWithStatic<EntityClass>

  private queryHandler: Record<
    QueryTypes,
    (query: Query, propValue: any) => boolean
  > = {
    [QueryTypes.CONTAINS]: (query, propValue) => {
      if (!(query instanceof ContainsQuery)) return false
      return (
        typeof propValue === 'string' &&
        propValue.toLowerCase().includes(query.params.input.toLowerCase())
      )
    },
    [QueryTypes.LOWER_OR_EQUAL]: (query, propValue) => {
      if (!(query instanceof LowerOrEqualQuery)) return false
      return (
        (typeof propValue === 'number' &&
          typeof query.params.input === 'number' &&
          propValue <= query.params.input) ||
        (propValue instanceof Date &&
          query.params.input instanceof Date &&
          propValue.getTime() <= query.params.input.getTime())
      )
    },
    [QueryTypes.GREATER]: (query, propValue) => {
      if (!(query instanceof GreaterQuery)) return false
      return (
        (typeof propValue === 'number' &&
          typeof query.params.input === 'number' &&
          propValue > query.params.input) ||
        (propValue instanceof Date &&
          query.params.input instanceof Date &&
          propValue.getTime() > query.params.input.getTime())
      )
    },
    [QueryTypes.BETWEEN]: (query, propValue) => {
      if (!(query instanceof BetweenQuery)) return false
      return (
        (typeof propValue === 'number' &&
          typeof query.params.from === 'number' &&
          typeof query.params.to === 'number' &&
          propValue >= query.params.from &&
          propValue <= query.params.to) ||
        (propValue instanceof Date &&
          query.params.from instanceof Date &&
          query.params.to instanceof Date &&
          propValue.getTime() >= query.params.from.getTime() &&
          propValue.getTime() <= query.params.to.getTime())
      )
    },
    [QueryTypes.IN]: (query, propValue) => {
      if (!(query instanceof InQuery)) return false
      return (
        Array.isArray(query.params.input) &&
        query.params.input.includes(propValue)
      )
    },
    [QueryTypes.NOT_IN]: (query, propValue) => {
      if (!(query instanceof NotInQuery)) return false
      return (
        Array.isArray(query.params.input) &&
        !query.params.input.includes(propValue)
      )
    },
    [QueryTypes.NOT_NULL]: (_query, propValue) => propValue !== null,
    [QueryTypes.NOT_EQUAL]: (query, propValue) => {
      if (!(query instanceof NotEqualQuery)) return false
      if (query.params.input instanceof ID) {
        return propValue !== query.params.input.toValue()
      }
      return propValue !== query.params.input
    },
  }

  protected cloneItem(item: EntityClass): EntityClass {
    return this.entity.reference(
      new ID(item.id.toValue()),
      cloneValue(item.props),
    )
  }

  async create(props: EntityClass['props']): Promise<EntityClass> {
    const createdItem = this.entity.create(props)
    this.items.push(createdItem)
    return this.cloneItem(createdItem)
  }

  async update(
    id: ID,
    newProps: Partial<EntityClass['props']>,
  ): Promise<EntityClass> {
    const item = await this.getInMemory({ id })
    item.props = { ...item.props, ...newProps }
    return this.cloneItem(item)
  }

  async updateMany(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    newProps: Partial<EntityClass['props']>,
  ): Promise<EntityClass[]> {
    const items = this.items.filter((item) => this.compare(item, props))
    items.forEach((item) => {
      item.props = { ...item.props, ...newProps }
    })
    return items.map((item) => this.cloneItem(item))
  }

  async getOrThrow(
    props: Partial<WithID<EntityClass['props']>>,
  ): Promise<EntityClass> {
    const itemsFound = this.items.filter((item) => this.compare(item, props))
    if (itemsFound.length > 1) throw new RepeatedResource()
    if (itemsFound.length === 0) throw new ResourceNotFoundError()
    return this.cloneItem(itemsFound[0])
  }

  async getInMemory(
    props: Partial<WithID<EntityClass['props']>>,
  ): Promise<EntityClass> {
    const itemsFound = this.items.filter((item) => this.compare(item, props))
    if (itemsFound.length > 1) throw new RepeatedResource()
    if (itemsFound.length === 0) throw new ResourceNotFoundError()
    return itemsFound[0]
  }

  async getOrNull(
    props: Partial<WithID<EntityClass['props']>>,
  ): Promise<EntityClass | null> {
    const itemsFound = this.items.filter((item) => this.compare(item, props))
    if (itemsFound.length > 1) throw new RepeatedResource()
    return itemsFound.length === 1 ? this.cloneItem(itemsFound[0]) : null
  }

  async findFirst(
    props: Partial<WithID<EntityClass['props']>>,
  ): Promise<EntityClass | null> {
    const itemsFound = this.items.filter((item) => this.compare(item, props))
    return itemsFound.length >= 1 ? this.cloneItem(itemsFound[0]) : null
  }

  async findMany(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    params?: QueryFilters<EntityClass['props']>,
  ): Promise<EntityClass[]> {
    const items = this.items.filter((item) => this.compare(item, props))
    return this.applyQueryParams(items, params)
  }

  async findManyWithPagination(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    params?: QueryFilters<EntityClass['props']>,
  ): Promise<PaginationResponse<EntityClass>> {
    const filtered = this.items.filter((item) => this.compare(item, props))
    const totalItems = filtered.length
    const currentPage = params?.page ?? DEFAULT_PAGE_NUMBER
    const paginatedItems = await this.applyQueryParams(filtered, params)
    return { items: paginatedItems, totalItems, page: currentPage }
  }

  async findManyWithCursorPagination(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    params?: CursorQueryFilters<EntityClass['props']>,
  ): Promise<CursorPaginationResponse<EntityClass>> {
    const filtered = this.items.filter((item) => this.compare(item, props))
    const ordered = await this.applyQueryParams(filtered, {
      orderBy: params?.orderBy,
      order: params?.order,
    })

    const startIndex = this.resolveCursorStartIndex(ordered, params?.cursor)
    const limit = params?.limit ?? ordered.length
    const page = ordered.slice(startIndex, startIndex + limit + 1)

    const hasMore = page.length > limit
    const items = hasMore ? page.slice(0, limit) : page
    const lastItem = items[items.length - 1]

    return {
      items,
      hasMore,
      nextCursor:
        hasMore && lastItem
          ? this.buildCursor(lastItem, params?.orderBy)
          : null,
    }
  }

  async count(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
  ): Promise<number> {
    return this.items.filter((item) => this.compare(item, props)).length
  }

  async delete(id: ID): Promise<EntityClass> {
    const itemIndex = this.items.findIndex((item) => item.id.isEqual(id))
    if (itemIndex === -1) throw new ResourceNotFoundError()
    const deleted = this.items.splice(itemIndex, 1)[0]
    return this.cloneItem(deleted)
  }

  async deleteMany(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
  ): Promise<void> {
    this.items = this.items.filter((item) => !this.compare(item, props))
  }

  clone(): Repository<EntityClass> {
    return Object.create(this) as InMemoryRepository<EntityClass>
  }

  protected async applyQueryParams(
    items: EntityClass[],
    params?: QueryFilters<EntityClass['props']>,
  ): Promise<EntityClass[]> {
    let orderedItems = items

    if (params?.orderBy) {
      const sortDirection =
        params.order === 'asc' ? SORT_ASCENDING : SORT_DESCENDING
      orderedItems = items.slice().sort((firstItem, secondItem) => {
        const firstValue = firstItem.getProp(params.orderBy as string)
        const secondValue = secondItem.getProp(params.orderBy as string)
        if (firstValue === secondValue) return 0
        if (typeof firstValue === 'string' && typeof secondValue === 'string') {
          return firstValue.localeCompare(secondValue) * sortDirection
        }
        if (firstValue instanceof Date && secondValue instanceof Date) {
          return (
            (firstValue.getTime() - secondValue.getTime()) * sortDirection
          )
        }
        if (typeof firstValue === 'number' && typeof secondValue === 'number') {
          return (firstValue - secondValue) * sortDirection
        }
        if (firstValue !== null && secondValue === null) {
          return -1 * sortDirection
        }
        if (firstValue === null && secondValue !== null) {
          return 1 * sortDirection
        }
        return (firstValue > secondValue ? 1 : -1) * sortDirection
      })
    }

    const limit = params?.limit
    const start = (params?.page ?? DEFAULT_PAGE_NUMBER) - 1
    const pageItems = limit
      ? orderedItems.slice(start * limit, start * limit + limit)
      : orderedItems
    return pageItems.map((item) => this.cloneItem(item))
  }

  private resolveCursorStartIndex(
    items: EntityClass[],
    cursor?: string | null,
  ): number {
    if (!cursor) return 0
    const cursorPayload = decodeCursor(cursor)
    const index = items.findIndex(
      (item) => item.id.toValue() === cursorPayload.id,
    )
    return index === -1 ? 0 : index + 1
  }

  private buildCursor(
    item: EntityClass,
    orderBy?: KeyOf<EntityClass['props']>,
  ): string {
    const orderByField = (orderBy as string) ?? 'id'
    return encodeCursor({
      orderBy: orderByField,
      value: this.serializeCursorValue(item.getProp(orderByField)),
      id: item.id.toValue(),
    })
  }

  private serializeCursorValue(value: unknown): string | number {
    if (value instanceof Date) return value.toISOString()
    if (value instanceof ID) return value.toValue()
    if (typeof value === 'number') return value
    return String(value)
  }

  protected compare(
    item: EntityClass,
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
  ): boolean {
    return Object.entries(props)
      .filter((entry) => entry[1] !== undefined)
      .every((entry) => {
        const fieldName = entry[0]
        const fieldValue = entry[1]
        const prop = item.getProp(fieldName)

        if (prop instanceof ID && fieldValue instanceof ID) {
          return prop.isEqual(fieldValue)
        }

        if (fieldValue instanceof Query) {
          const handler = this.queryHandler[fieldValue.queryType]
          return handler(
            fieldValue,
            prop instanceof ID || prop instanceof ValueObject
              ? prop.toValue()
              : prop,
          )
        }

        return prop === fieldValue
      })
  }
}
