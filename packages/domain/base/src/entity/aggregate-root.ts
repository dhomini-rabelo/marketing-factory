import { AnyRecord } from '@modules/utils'
import { Entity } from '@domain/base/entity/entity'

export abstract class AggregateRoot<
  Props extends AnyRecord = any,
> extends Entity<Props> {}
