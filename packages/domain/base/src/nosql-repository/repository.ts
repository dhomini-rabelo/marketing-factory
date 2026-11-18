import { Complement, KeyOf, isFieldInProps } from '@modules/utils'
import { Entity } from '@domain/base/entity/entity'
import { ID } from '@domain/base/entity/id'
import { WithID } from '@domain/base/types'
import { DangerErrors, DomainError } from '@domain/base/domain-errors'
import { Query } from '@domain/base/nosql-repository/queries'
import { ValueQuery } from '@domain/base/nosql-repository/values'

const DEFAULT_INDEX_NAME = 'id'

export type RepositoryIndexes<Indexes extends string> = Indexes | 'id'

export type IndexFieldSet<EntityClass extends Entity> =
  | [KeyOf<WithID<EntityClass['props']>>]
  | [KeyOf<WithID<EntityClass['props']>>, KeyOf<WithID<EntityClass['props']>>]

export type QueryFilters<Indexes extends string = ''> = {
  index?: Indexes
  limit?: number
  paginationData?: any
  sortDescending?: boolean
}

export type QueryResponse<T> = {
  data: T[]
  nextPaginationData?: any
}

export abstract class Repository<
  EntityClass extends Entity,
  Indexes extends string = '',
> {
  protected abstract indexes: Record<
    RepositoryIndexes<Indexes>,
    IndexFieldSet<EntityClass>
  >

  abstract create(props: EntityClass['props']): Promise<EntityClass>

  abstract update<Response extends boolean | undefined = undefined>(
    id: ID,
    newProps: Partial<Complement<EntityClass['props'], ValueQuery>>,
    options?: { returnUpdated?: Response },
  ): Promise<Response extends true ? EntityClass : null>

  abstract reuseUpdate(
    entity: EntityClass,
    newProps: Partial<EntityClass['props']>,
  ): Promise<EntityClass>

  abstract updateMany(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    newProps: Partial<EntityClass['props']>,
    filters?: Pick<QueryFilters<Indexes>, 'index'>,
  ): Promise<EntityClass[]>

  abstract delete(id: ID): Promise<void>

  abstract getOrThrow(
    props: Partial<WithID<EntityClass['props']>>,
    filters?: Pick<QueryFilters<Indexes>, 'index'>,
  ): Promise<EntityClass>

  abstract getOrNull(
    props: Partial<WithID<EntityClass['props']>>,
    filters?: Pick<QueryFilters<Indexes>, 'index'>,
  ): Promise<EntityClass | null>

  abstract findFirst(
    props: Partial<WithID<EntityClass['props']>>,
    filters?: Pick<QueryFilters<Indexes>, 'index'>,
  ): Promise<EntityClass | null>

  abstract findMany(
    props?: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    filters?: QueryFilters<Indexes>,
  ): Promise<QueryResponse<EntityClass>>

  abstract findAll(
    props?: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    filters?: Omit<QueryFilters<Indexes>, 'paginationData' | 'limit'>,
  ): Promise<EntityClass[]>

  abstract countItems(
    props: Partial<EntityClass['props']>,
    filters: Pick<QueryFilters<Indexes>, 'index'>,
  ): Promise<number>

  abstract reset(): Promise<void>

  protected validateIndex(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    indexName: Indexes | 'id' = DEFAULT_INDEX_NAME as Indexes | 'id',
  ): void {
    const indexFields = this.indexes[indexName]
    if (!indexFields) {
      throw new DomainError({
        code: 'INDEX_NOT_DEFINED',
        errorType: DangerErrors.DATA_INTEGRITY,
      })
    }

    const partitionKey = indexFields[0]
    if (!isFieldInProps(String(partitionKey), props)) {
      throw new DomainError({
        code: 'PARTITION_KEY_REQUIRED',
        errorType: DangerErrors.DATA_INTEGRITY,
      })
    }
  }
}
