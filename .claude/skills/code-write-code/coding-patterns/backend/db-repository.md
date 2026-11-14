# Database Repository Patterns

How to write a persistence repository in the database workspace, for example `packages/infra/db`. Each repository implements a domain repository port, extends a generic base repository over the ORM client, and maps rows to entities with a mapper. Examples use Prisma; the structure applies to any ORM that offers a base class. For the folder layout around it, see [Backend adapters and services structure](../../../code-get-coding-designs/designs/backend-adapters-and-services-structure.md).

## One folder per repo, shared code in `_base`

- Every entity gets `repos/{entity}/` with `repo.ts`, `mapper.ts` and `repo.integration.test.ts`. The class names are `Prisma{Entity}Repository` and `{Entity}Mapper`.
- Code shared by all repositories lives in `repos/_base/`. Never copy a helper into a repo folder.
- Imports use the package alias, never relative paths across folders.

```text
// Wrong way
src/
├── {entity}-repository.ts
└── mappers/{entity}.ts

// Correct way
src/repos/
├── _base/
└── {entity}/{repo,mapper,repo.integration.test}.ts
```

## A repo declares three members and inherits the rest

The concrete class sets `entity`, `modelKey` and `mapper`, and the base implements every method of the domain `Repository<E>` contract (`create`, `update`, `updateMany`, `getOrThrow`, `getOrNull`, `findFirst`, `findMany`, pagination, `count`, `delete`, `deleteMany`, `clone`). `modelKey` is the ORM delegate name, not the table name. Assigning `mapper` is also the type check that ties the mapper to the model.

```typescript
// Wrong way
export function create{Entity}Repository(client: DbClient) {
  return {
    async getOrThrow(filter) { /* hand-written query */ },
  } as unknown as {Entity}Repository
}

// Correct way
export class Prisma{Entity}Repository
  extends PrismaRepository<{Entity}, '{entity}'>
  implements {Entity}Repository
{
  protected readonly entity = {Entity}
  protected readonly modelKey = '{entity}'
  protected readonly mapper = {Entity}Mapper
}
```

## Customize through the base hooks and the ORM API

When an entity does not fit the defaults, declare `include` (joined relations read with the row) and `fieldPaths` (props that live on a joined model), and override only the protected hooks (`toWhere`, `toUniqueWhere`, `toOrderBy`, `toAfterId`, `toFieldValue`). Entity-specific port methods call the delegate through `this.client`.

```typescript
// Wrong way
async getOrThrow(filter: Partial<WithID<{Entity}Props>>): Promise<{Entity}> {
  const row = await this.client.{entity}.findFirst({ where: /* composite key by hand */ })
}

// Correct way
protected toUniqueWhere(id: ID): PrismaWhere {
  return { parentId_userId: this.toPairWhere(id) }
}
```

## The client comes through the constructor

A repository receives its client from the constructor and never reads env, opens a file, or builds a client. The app composes everything once at its boundary. Inside a transaction the base swaps the client with `clone(transaction)`, so the constructor type accepts both the client and the transaction client.

```typescript
// Wrong way
export class Prisma{Entity}Repository extends PrismaRepository<{Entity}, '{entity}'> {
  constructor() {
    super(createDbClient({ dataDir: env.DATA_DIR }))
  }
}

// Correct way
export const dbClient = createDbClient({ dataDir: env.DATA_DIR })
export const {entity}Repository = new Prisma{Entity}Repository(dbClient)

// Correct way, a test hands in its own isolated client
repository = new Prisma{Entity}Repository(testDb.client)
```

## Use the ORM API; raw SQL is the last resort

Reads and writes go through the model delegates. Use the tagged-template raw query only when the ORM cannot express the query: the tag turns `${value}` into bound parameters. Never use the unsafe raw variants with input. Raw results may return integer columns as `bigint`, so prefer `count()` or `aggregate` for totals.

```typescript
// Wrong way
await this.client.$queryRawUnsafe(`SELECT * FROM {entities} WHERE email = '${email}'`)

// Correct way
await this.client.{entity}.findMany({ where: { email } })

// Last resort
await this.client.$queryRaw`SELECT id FROM {entities} WHERE email = ${email}`

// Wrong way
const [{ total }] = await this.client.$queryRaw<{ total: bigint }[]>`SELECT COUNT(*) AS total FROM {entities}`

// Correct way
const total = await this.client.{entity}.count({ where: { parentId } })
```

## Mappers

Each entity has a `repos/{entity}/mapper.ts` stateless class that the repository binds with `mapper = {Entity}Mapper`. The full rules are in [DB mapper](./db-mapper.md).

In the schema, columns are camelCase with `@map("snake_case")` when the database uses snake case.

## Errors come from the base

The base throws the domain errors. A concrete repo does not check for `null`, count rows, or invent its own error types.

| Situation | Thrown by the base |
| --- | --- |
| `getOrThrow`, `update`, `delete` find no row | `ResourceNotFoundError` |
| `getOrNull` finds more than one row | `RepeatedResource` |
| `updateMany`, `deleteMany` with an empty filter | `UnfilteredWriteError` |
| An enum column holds an unknown value (`toEnumMember`) | `DomainError` with code `INVALID_ENUM_MEMBER` |

```typescript
// Wrong way
async find{Entity}(id: ID): Promise<{Entity}> {
  const record = await this.client.{entity}.findUnique({ where: { id: id.toValue() } })
  if (!record) throw new Error('{entity} not found')
  return {Entity}Mapper.toDomain(record)
}

// Correct way
const {entity} = await this.repos.{entity}.getOrThrow({ id })
```

A read with an empty filter matches every row. A write with an empty filter throws, so a `{ userId: undefined }` never turns into "delete the table".

## Multi-step writes are atomic

A write that touches more than one row must succeed or fail as a whole. In order of preference:

1. A nested write: one call that creates the related rows.
2. The array form `$transaction([...])` when the statements are independent.
3. An interactive `$transaction(async (transaction) => ...)` only when a later step needs an earlier result. Run the steps on `this.clone(transaction)` and keep the transaction short.

```typescript
// Wrong way
const parent = await this.client.{parent}.create({ data: parentData })
await this.client.{child}.create({ data: { parentId: parent.id, ...childData } })

// Correct way
const created = await this.client.{parent}.create({
  data: { ...parentData, {children}: { create: childData } },
})

// Correct way
return this.client.$transaction((transaction) => this.clone(transaction).{steps}(...))
```

## Schema changes go through a new migration

Edit the schema, then create the migration and regenerate the client. Migrations are applied at startup by a dedicated command, never by application code. Do not edit a migration that was already applied: a database that ran it keeps the old SQL and the history diverges. Fix it with a new migration. Commit the schema and the new migration folder together; generated client code stays out of git. A column added to the table also needs the prop on the entity and the mapper, or the build fails.

```bash
# Wrong way
vim prisma/migrations/{timestamp}_init/migration.sql

# Correct way
pnpm --filter {db-package} exec prisma migrate dev --name {change}
pnpm --filter {db-package} generate
```

## One integration test per repo

Each `repos/{entity}/repo.integration.test.ts` runs the real repository against a real isolated database, never a mocked client. A test helper (`createTestDb()`) provides a fresh database with the full schema, for example by copying a template migrated once in the Vitest `globalSetup`. Dispose the client after each test.

```typescript
// Wrong way
const client = { {entity}: { create: vi.fn(), findMany: vi.fn() } } as unknown as DbClient

// Correct way
describe('Prisma{Entity}Repository', () => {
  let testDb: TestDb
  let repository: Prisma{Entity}Repository

  beforeEach(() => {
    testDb = createTestDb()
    repository = new Prisma{Entity}Repository(testDb.client)
  })

  afterEach(async () => {
    await testDb.dispose()
  })

  it('creates a {entity} and finds it by {field}', async () => {
    const created = await repository.create({entity}Props())

    const found = await repository.getOrThrow({ {field}: '{value}' })

    expect(found.id.toValue()).toBe(created.id.toValue())
    expect(found.props).toEqual({entity}Props())
  })
})
```

Cover what is specific to the entity: the round trip of every column (enums, booleans, nullable columns, dates), the port's own methods, and any hook the repo overrides. Base semantics (`RepeatedResource`, `ResourceNotFoundError`, partial `update`, `UnfilteredWriteError`, pagination, query operators) are covered once, in one reference repo test; do not repeat them in every repo.
