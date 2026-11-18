import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { z } from 'zod'

import { Complement } from '@modules/utils'
import { Entity } from '@domain/base/entity/entity'
import { ID } from '@domain/base/entity/id'
import { Serialize, WithID } from '@domain/base/types'
import { Query } from '@domain/base/repository/queries'
import { InMemoryRepository } from '@domain/base/repository/repository'

const JSON_INDENT_SPACES = 2

export type SerializedEntity<EntityClass extends Entity> = Serialize<
  WithID<EntityClass['props']>
>

export abstract class JsonRepository<
  EntityClass extends Entity,
> extends InMemoryRepository<EntityClass> {
  protected abstract filePath: string
  protected abstract schema: z.ZodType<SerializedEntity<EntityClass>>

  protected abstract serialize(
    entity: EntityClass,
  ): SerializedEntity<EntityClass>

  protected abstract deserialize(
    raw: SerializedEntity<EntityClass>,
  ): EntityClass

  protected loadFromDisk(): void {
    if (!existsSync(this.filePath)) {
      this.items = []
      return
    }
    const content = readFileSync(this.filePath, 'utf-8')
    const parsed = z.array(this.schema).parse(JSON.parse(content))
    this.items = parsed.map((raw) => this.deserialize(raw))
  }

  protected persist(): void {
    mkdirSync(dirname(this.filePath), { recursive: true })
    const data = this.items.map((item) => this.serialize(item))
    writeFileSync(
      this.filePath,
      JSON.stringify(data, null, JSON_INDENT_SPACES),
      'utf-8',
    )
  }

  async create(props: EntityClass['props']): Promise<EntityClass> {
    const created = await super.create(props)
    this.persist()
    return created
  }

  async update(
    id: ID,
    newProps: Partial<EntityClass['props']>,
  ): Promise<EntityClass> {
    const updated = await super.update(id, newProps)
    this.persist()
    return updated
  }

  async updateMany(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    newProps: Partial<EntityClass['props']>,
  ): Promise<EntityClass[]> {
    const updated = await super.updateMany(props, newProps)
    this.persist()
    return updated
  }

  async delete(id: ID): Promise<EntityClass> {
    const deleted = await super.delete(id)
    this.persist()
    return deleted
  }

  async deleteMany(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
  ): Promise<void> {
    await super.deleteMany(props)
    this.persist()
  }
}
