import { Complement, KeyOf } from '@modules/utils'
import { cloneValue } from '@domain/base/repository/clone-value'
import {
  IndexFieldSet,
  QueryFilters,
  QueryResponse,
  Repository,
  RepositoryIndexes,
} from '@domain/base/nosql-repository/repository'
import { Entity, EntityWithStatic } from '@domain/base/entity/entity'
import { ID } from '@domain/base/entity/id'
import { WithID } from '@domain/base/types'
import { ValueObject } from '@domain/base/entity/value-object'
import { RepeatedResource, ResourceNotFoundError } from '@domain/base/nosql-repository/repository-errors'
import { Query } from '@domain/base/nosql-repository/queries'
import { ValueQuery } from '@domain/base/nosql-repository/values'

const COMPOSITE_INDEX_FIELD_COUNT = 2

export abstract class InMemoryRepository<
  EntityClass extends Entity,
  Indexes extends string = '',
> extends Repository<EntityClass, Indexes> {
  protected abstract entity: EntityWithStatic<EntityClass>
  protected items: EntityClass[] = []
  protected defaultQueryValues: Partial<WithID<EntityClass['props']>> = {}
  protected abstract indexes: Record<
    RepositoryIndexes<Indexes>,
    IndexFieldSet<EntityClass>
  >

  protected cloneItem(item: EntityClass): EntityClass {
    return this.entity.reference(
      new ID(item.id.toValue()),
      cloneValue(item.props),
    )
  }

  async create(props: EntityClass['props']) {
    const createdItem = await this.entity.create(props)
    this.items.push(createdItem)
    return this.cloneItem(createdItem)
  }

  async save(entity: EntityClass) {
    const itemIndex = this.items.findIndex((item) => item.id.isEqual(entity.id))
    if (itemIndex === -1) {
      this.items.push(entity)
    } else {
      this.items[itemIndex] = entity
    }
    return this.cloneItem(entity)
  }

  async update<Response extends boolean | undefined = undefined>(
    id: ID,
    newProps: Partial<Complement<EntityClass['props'], ValueQuery>>,
    options: { returnUpdated?: Response } = {},
  ): Promise<Response extends true ? EntityClass : null> {
    const item = await this.getInMemory({ id })

    item.props = {
      ...item.props,
      ...Object.fromEntries(
        Object.entries(newProps).map((entry) =>
          entry[1] instanceof ValueQuery
            ? [entry[0], entry[1].getValue(item.getProp(entry[0]))]
            : [entry[0], entry[1]],
        ),
      ),
    }

    return (
      options.returnUpdated === true ? this.cloneItem(item) : null
    ) as Response extends true ? EntityClass : null
  }

  async reuseUpdate(
    entity: EntityClass,
    newProps: Partial<EntityClass['props']>,
  ): Promise<EntityClass> {
    const item = await this.getInMemory({ id: entity.id })

    item.props = {
      ...item.props,
      ...Object.fromEntries(
        Object.entries(newProps).map((entry) =>
          entry[1] instanceof ValueQuery
            ? [entry[0], entry[1].getValue(item.getProp(entry[0]))]
            : [entry[0], entry[1]],
        ),
      ),
    }

    return this.cloneItem(item)
  }

  async updateMany(
    query: Partial<EntityClass['props']>,
    newProps: Partial<EntityClass['props']>,
    filters: Pick<QueryFilters<Indexes>, 'index'> = {},
  ): Promise<EntityClass[]> {
    const items = this.items.filter((item) => this.compare(item, query))
    this.validateIndex(query, filters.index)

    items.forEach((item) => {
      item.props = {
        ...item.props,
        ...newProps,
      }
    })

    return items.map((item) => this.cloneItem(item))
  }

  async delete(id: ID) {
    this.items = this.items.filter((item) => !item.id.isEqual(id))
  }

  async getOrThrow(
    props: Partial<WithID<EntityClass['props']>>,
    filters: Pick<QueryFilters<Indexes>, 'index'> = {},
  ): Promise<EntityClass> {
    this.validateIndex(props, filters.index)

    const itemsFound = this.items.filter((item) =>
      this.compare(item, {
        ...this.defaultQueryValues,
        ...props,
      }),
    )

    if (itemsFound.length > 1) {
      throw new RepeatedResource()
    } else if (itemsFound.length === 0) {
      throw new ResourceNotFoundError()
    }
    return this.cloneItem(itemsFound[0])
  }

  protected async getInMemory(
    props: Partial<WithID<EntityClass['props']>>,
    _filters: Pick<QueryFilters<Indexes>, 'index'> = {},
  ): Promise<EntityClass> {
    const itemsFound = this.items.filter((item) =>
      this.compare(item, {
        ...this.defaultQueryValues,
        ...props,
      }),
    )

    if (itemsFound.length > 1) {
      throw new RepeatedResource()
    } else if (itemsFound.length === 0) {
      throw new ResourceNotFoundError()
    }

    return itemsFound[0]
  }

  async getOrNull(
    props: Partial<WithID<EntityClass['props']>>,
    filters: Pick<QueryFilters<Indexes>, 'index'> = {},
  ): Promise<EntityClass | null> {
    this.validateIndex(props, filters.index)

    const itemsFound = this.items.filter((item) =>
      this.compare(item, {
        ...this.defaultQueryValues,
        ...props,
      }),
    )
    if (itemsFound.length > 1) {
      throw new RepeatedResource()
    }
    return itemsFound.length === 1 ? this.cloneItem(itemsFound[0]) : null
  }

  async findFirst(
    props: Partial<WithID<EntityClass['props']>>,
    filters: Pick<QueryFilters<Indexes>, 'index'> = {},
  ): Promise<EntityClass | null> {
    this.validateIndex(props, filters.index)

    const itemsFound = this.items.filter((item) =>
      this.compare(item, {
        ...this.defaultQueryValues,
        ...props,
      }),
    )

    return itemsFound.length >= 1 ? this.cloneItem(itemsFound[0]) : null
  }

  async findMany(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    filters: QueryFilters<Indexes>,
  ): Promise<QueryResponse<EntityClass>> {
    this.validateIndex(props, filters.index)

    const limit = filters.limit
    const paginationData = filters.paginationData
    const sortDescending = filters.sortDescending ?? false
    const index = filters.index
    let items = this.items.filter((item) =>
      this.compare(item, {
        ...this.defaultQueryValues,
        ...props,
      }),
    )

    const sortKey = this.getSortKey(index)
    if (sortKey) {
      items = items.sort((firstItem, secondItem) => {
        const firstValue = firstItem.getProp(sortKey as string)
        const secondValue = secondItem.getProp(sortKey as string)

        return sortDescending
          ? secondValue - firstValue
          : firstValue - secondValue
      })
    }

    const paginationDataIndex = items.findIndex(
      (item) => item.id.toString() === paginationData,
    )

    items = items.filter(
      (_item, itemIndex) =>
        paginationDataIndex === -1 || itemIndex > paginationDataIndex,
    )
    items = items.filter((_item, itemIndex) => !limit || itemIndex < limit)

    return {
      data: items.map((item) => this.cloneItem(item)),
      nextPaginationData:
        limit && items.at(limit - 1)?.id.toValue()
          ? items.at(limit - 1)?.id.toString()
          : undefined,
    }
  }

  async findAll(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    filters: Omit<QueryFilters<Indexes>, 'paginationData' | 'limit'>,
  ): Promise<EntityClass[]> {
    this.validateIndex(props, filters.index)

    const sortDescending = filters.sortDescending ?? false
    const index = filters.index
    let items = this.items.filter((item) =>
      this.compare(item, {
        ...this.defaultQueryValues,
        ...props,
      }),
    )

    const sortKey = this.getSortKey(index)
    if (sortKey) {
      items = items.sort((firstItem, secondItem) => {
        const firstValue = firstItem.getProp(sortKey as string)
        const secondValue = secondItem.getProp(sortKey as string)

        return sortDescending
          ? secondValue - firstValue
          : firstValue - secondValue
      })
    }

    return items.map((item) => this.cloneItem(item))
  }

  async countItems(
    props: Partial<EntityClass['props']>,
    filters: Pick<QueryFilters<Indexes>, 'index'>,
  ): Promise<number> {
    const itemsFound = await this.findMany(props, filters)
    return itemsFound.data.length
  }

  async reset() {
    this.items = []
  }

  protected compare(
    item: EntityClass,
    props: Partial<WithID<EntityClass['props']>>,
  ): boolean {
    return Object.entries(props)
      .filter((entry) => entry[1] !== undefined)
      .every((entry) => {
        const fieldName = entry[0]
        const fieldValue = entry[1]
        const prop = item.getProp(fieldName)

        if (prop instanceof ID && fieldValue instanceof ID) {
          return prop.isEqual(fieldValue)
        } else if (typeof prop === 'string' && typeof fieldValue === 'string') {
          return prop.includes(fieldValue)
        }

        if (fieldValue instanceof Query) {
          return fieldValue.runExpression(
            prop instanceof ID || prop instanceof ValueObject
              ? prop.toValue()
              : prop,
          )
        }

        return prop === fieldValue
      })
  }

  protected getSortKey(
    indexName: Indexes | 'id' = 'id',
  ): KeyOf<WithID<EntityClass['props']>> | null {
    const indexFields = this.indexes[indexName]
    const isCompositeIndex =
      indexFields && indexFields.length === COMPOSITE_INDEX_FIELD_COUNT

    if (isCompositeIndex) {
      return indexFields[1]
    }

    return null
  }
}
