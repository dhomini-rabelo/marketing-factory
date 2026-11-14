# DB Mapper Patterns

How to write a persistence mapper in the database workspace, for example `packages/infra/db/src/repos/{entity}/mapper.ts`. A mapper converts between a domain entity and the record the repository reads and writes, keeping row serialization out of entities and use cases. It is the persistence counterpart of the [HTTP presenter](./http-presenter.md).

## Use a stateless class with static methods

- One mapper per entity, named `{Entity}Mapper`, next to its `repo.ts`.
- Only `static` methods and no instance state: `toPersistence(entity): {Entity}Record` and `toDomain(record): {Entity}`.
- The repository binds it with `protected readonly mapper = {Entity}Mapper` and calls it; the mapper never reads env, the client, or a service.

```typescript
export class {Entity}Mapper {
  static toPersistence({entity}: {Entity}): {Entity}Record {
    return {
      id: {entity}.id.toValue(),
      title: {entity}.props.title,
      status: {entity}.props.status,
      dueAt: {entity}.props.dueAt?.toISOString() ?? null,
    }
  }

  static toDomain(record: {Entity}Record): {Entity} {
    return {Entity}.reference(createID(record.id), {
      title: record.title,
      status: toEnumMember({Entity}Status, record.status),
      dueAt: record.dueAt ? new Date(record.dueAt) : null,
    })
  }
}
```

## Derive the record type from the entity props

- Derive the record with `Serialize<WithID<{Entity}Props>>` from the shared domain types. Never write the row type by hand.
- Adjust it with `Omit` for fields the table does not own and `OverWrite` for fields whose stored type differs (enums, JSON columns).
- Type each enum column as a template literal of the domain enum (`` `${Status}` ``).
- Prefer `Omit` over `Pick`: a prop added to the entity then breaks the build until the column exists in the schema or the prop is listed in `Omit`.

```typescript
// Wrong way
type {Entity}Row = { id: string; title: string; status: string; due_at: string | null }

// Correct way
type {Entity}Record = OverWrite<Serialize<WithID<{Entity}Props>>, { status: `${{Entity}Status}` }>
```

The repository base requires the database record to be assignable to the mapper record and `toPersistence` to be assignable to the create input, which is what makes the derivation effective.

## Conversion rules

| Domain | Record | Conversion |
| --- | --- | --- |
| `ID` | `string` | `entity.id.toValue()` and `createID(record.id)` |
| `Date` | ISO `string` when the engine stores text | `toISOString()` and `new Date(record.value)` |
| nullable `Date` | `string \| null` | `date?.toISOString() ?? null` and `record.value ? new Date(record.value) : null` |
| enum | template literal string | pass the value through on write; `toEnumMember(Enum, record.value)` on read, never `as` |
| `JsonField<T>` | JSON `string` | `field.toValue()` on write; parse and validate on read, throwing a `DomainError` for data integrity when the shape is invalid |

- `null` stays `null` in the record. Turning `null` into `undefined` is a presenter concern.
- Build the entity with `{Entity}.reference(id, props)`, never `create`, so no creation rule runs while loading.
- An entity with a composite key derives its id from the pair (`{entity}IdFromPair(parentId, userId)`) instead of a column.

## Joins and read-only fields

Fields the table does not own come through a read record and an `{entity}Include` constant exported from the mapper. Declare it with `satisfies` against the ORM include type so it stays typed, and widen the record only for reads.

```typescript
export const {entity}Include = { owner: { select: { name: true } } } satisfies Prisma.{Entity}Include

type {Entity}ReadRecord = {Entity}Record & { owner: Pick<Serialize<{Entity}Props>, 'ownerName'> }
```

- `toPersistence` returns the write record without the joined fields.
- When the repository must hand back an entity right after a write, it fills the denormalized fields with a named constant (for example `{FIELD}_LOADED_ON_READ`) instead of an inline empty string, and the next read loads them.

## Test

Cover the mapper through the repository integration test (`repo.integration.test.ts`): a save followed by a read must round-trip every prop, including nullable dates, enums and JSON fields.
