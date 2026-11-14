# examples/domain-base

Copyable slice of `packages/domain/base`. Apps started from this factory put these primitives in `packages/domain/base` and import them as `@domain/base`.

Copy [examples/modules-utils](../modules-utils/) to `packages/modules/utils` in the same step. Domain-base consumes `AnyRecord`, `Complement`, `KeyOf`, and `isFieldInProps` from `@modules/utils`. Domain-specific shapes (`WithID`, `Serialize`, `TimestampProps`) stay here in `types.ts`.

The two in-memory flavors are **sibling types**. They do not share a class and must not be unified.

## SQL-like (Cally) — default `@domain/base`

Public barrel: `src/index.ts`.

- `Repository` / `InMemoryRepository`: `findMany` returns `Entity[]`; `orderBy` / `page` / cursor pagination; `delete` returns the entity; `deleteMany`.
- `JsonRepository` extends the SQL `InMemoryRepository`: Zod schema on the subclass, abstract `serialize` / `deserialize`, `loadFromDisk` + `persist` after writes.
- Queries: `ContainsQuery`, `GreaterQuery`, `BetweenQuery`, `InQuery`, `NotNullQuery`, …

Sample: `src/samples/catalog-item.ts` (`tags: string[]` is a domain array, not a JSON string), port at `src/samples/repositories/catalog-item.ts`, in-memory double at `src/samples/__tests__/repositories/catalog-item.ts`, SQL-column mapper at `src/samples/mappers/catalog-item.ts` (row field `tags` with JSON in the value), and `json-catalog-item-repository.ts` (whole collection as a JSON file; `tags` stays an array in that file). Use-case folder with a pure helper: `src/samples/use-cases/catalog/list-matching-catalog-items/`. Single-file use case with no helper: `src/samples/list-catalog-items.ts`.

## NoSQL-like (mdnotes / Dynamo) — `@domain/base/nosql`

Public barrel: `src/nosql.ts`. **Does not** extend the SQL in-memory. **Has no** `JsonRepository`.

- `Repository` / `InMemoryRepository`: indexes with a partition key; `findMany` returns `{ data, nextPaginationData }`; `delete` returns `void`; `ValueQuery` (`list_append`, delete index).
- Queries: `BEGINS_WITH`, `AND`, `GREATER_THAN`, `createQuery()` Dynamo expressions.

Sample: `src/samples/indexed-document.ts`, port at `src/samples/repositories/indexed-document.ts`, in-memory double at `src/samples/__tests__/repositories/indexed-document.ts`.

## Layout (Cally)

```
src/
  entity/              Entity, AggregateRoot, ID, ValueObject, WatchedList
  repository/          Repository, JsonRepository, queries, cursor, clone-value
  nosql-repository/    NoSQL sibling (mdnotes / Dynamo)
  samples/
  index.ts
  nosql.ts
  use-case.ts
  domain-errors.ts
  types.ts
```

Entity primitives live in `entity/`. Clone helpers live in `repository/` (`clone-value.ts`), not at `src/` root.

## Shared nucleus

`entity/` (`Entity`, `AggregateRoot`, `ID`, `ValueObject`, `WatchedList`), `UseCase<Payload, Response>`, `DomainError` + `DangerErrors` + `ValidationError` (`code` + `errorType`, no `httpStatus`).
