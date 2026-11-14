# Backend Domain Structure

How each backend domain module is organized in the [monorepo](./monorepo-structure.md). **All file and folder names use kebab-case**; only exported identifiers (classes, functions) follow their own casing.

## Folder layout

Feature modules live under `packages/domain/<module>/src/` with **enterprise** (core model) and **application** (orchestration):

```
packages/domain/<module>/src/
├── enterprise/
│   └── entities/{entity}.ts        # entity class + {Entity}Props only
└── application/
    ├── types/repositories.ts       # {Module}Repos: own repos + ownership repos
    ├── types/services.ts           # {Module}Services: adapter ports and nested use cases
    ├── repositories/{entity}.ts    # repository ports (name = entity, not *-repository)
    ├── use-cases/{feature}/{use-case-name}.ts                          # class file when there is no helper
    ├── use-cases/{feature}/{use-case-name}/{use-case-name}.ts          # class file inside the use-case folder
    ├── use-cases/{feature}/{use-case-name}/{helper}.ts                 # pure helper owned by that use case
    ├── use-cases/{feature}/__tests__/{use-case-name}.test.ts
    ├── use-cases/__tests__/                 # integration only, or use cases without a feature folder
    ├── validation/{entity}.ts
    ├── utils/{name}.ts             # shared helpers (not API or persistence mappers)
    └── __tests__/
        └── repositories/{entity}.ts  # in-memory repository doubles
```

`packages/domain/base` is not a feature module: it keeps the flat `entity/`, `repository/`, and related primitives layout without `application/` or `enterprise/`. Copy [examples/domain-base](../../../../examples/domain-base/) into `packages/domain/base`: default barrel is the SQL-like contract (`UseCase<Payload, Response>`, `DangerErrors` + `DomainError`, `Repository`/`InMemoryRepository`/`JsonRepository`). The NoSQL-like sibling is `@domain/base/nosql`.

## Entities

Each file under `enterprise/entities/` exports `{Entity}Props` and an entity class. Categorical props use `enum`, not string-literal unions ([enum em entidades enterprise](../../../memory/dev-preferences/enum-em-entidades-enterprise.md)). Do not add `{Entity}View` types or `to{Entity}` functions in the domain. HTTP response shapes are built at the infrastructure route boundary; persistence row mapping lives in `packages/infra/.../mappers/{entity}.ts`. An entity lives in one owning module; other modules store `{owner}Id` and may import the owner's public contract — they do not nest or copy the owner's object ([domain ownership](./domain-ownership.md)). List this product's pairs in `packages/domain/ownerships.md`.

A structured prop (array or object) stays typed on `{Entity}Props` as the domain value — `tags: string[]`, not a JSON `string`. The infrastructure mapper row type uses camelCase aligned with props (`tags` holds the serialized JSON string); the SQL column may still be named `tags_json`. Use `JSON.stringify` / `JSON.parse` on `tags`. The entity never stores or parses the serialized string. That mapper pattern is a **json field**; it is not `JsonRepository`, which persists the whole collection as a JSON file. Do not add a branded `JsonField` type to `domain/base` for this. Copyable pair: [catalog-item.ts](../../../../examples/domain-base/src/samples/catalog-item.ts) and [mappers/catalog-item.ts](../../../../examples/domain-base/src/samples/mappers/catalog-item.ts).

## use-cases/

Each use case exports one `UseCase` class with a single `execute` method. Place it at `application/use-cases/{feature}/{use-case-name}.ts` when the class has no dedicated helper. When the use case owns a pure helper used only by that use case, put the class and the helper in a folder:

```
application/use-cases/{feature}/{use-case-name}/{use-case-name}.ts
application/use-cases/{feature}/{use-case-name}/{helper}.ts
```

Name the class file `{use-case-name}.ts`, not `index.ts`. Keep that helper in the same directory (for example `build-{outcome}.ts`). Do not leave a single-consumer helper as `{feature}/{helper}.ts` or in `application/utils/`. A single class file remains valid when there is no helper. Copyable folder: [list-matching-catalog-items](../../../../examples/domain-base/src/samples/use-cases/catalog/list-matching-catalog-items/).

Inject dependencies as `Pick` of the module aggregators from `application/types/` — `constructor(private readonly repos: Pick<{Module}Repos, …>)`, and `private readonly services: Pick<{Module}Services, …>` when the use case needs adapter ports or a nested use case. Scalar config such as `model: string` stays an extra constructor parameter, outside Repos/Services. Use cases read `this.repos.message` (or `this.services.sqlEngine`), not loose constructor fields. HTTP composition builds the full `{Module}Repos` / `{Module}Services` objects and passes those variables; `Pick` accepts the complete object. **Return domain entities** (or lists and envelopes that still carry entities), not presentation DTOs.

Keep each use-case behavior test beside its feature: `application/use-cases/{feature}/__tests__/{use-case-name}.test.ts`. Do not put the test inside `{use-case-name}/`. Reserve `application/use-cases/__tests__/` for cross-cutting integration suites or a use case that has no `{feature}` folder. Every `*UseCase` class with an `execute` method must have a behavior test. Configure `@/` as a package-local source alias and `@domain/base` for shared primitives during initialization.

```ts
import { Message } from '@/enterprise/entities/message'
import type { MessagesRepos } from '@/application/types/repositories'
import { UseCase } from '@domain/base'

interface Payload {
  userId: string
  limit?: number
}

type Response = Message[]

export class ListMessagesUseCase implements UseCase<Payload, Response> {
  constructor(private readonly repos: Pick<MessagesRepos, 'message'>) {}

  async execute(payload: Payload): Promise<Response> {
    return this.repos.message.findMany({ userId: payload.userId })
  }
}
```

When services are required:

```ts
export class UpdateConnectionUseCase implements UseCase<Payload, Response> {
  constructor(
    private readonly repos: Pick<ConnectionRepos, 'connection' | 'schema' | 'workspace' | 'member'>,
    private readonly services: Pick<ConnectionServices, 'credentialsCrypto' | 'sqlEngine'>,
  ) {}
}
```

## types/

Feature modules declare two aggregator types. `packages/domain/base` does not get `application/types/`.

- `application/types/repositories.ts` exports `{Module}Repos`: every repository port of this module plus the ownership repos this module uses.
- `application/types/services.ts` exports `{Module}Services`: non-repository ports (hasher, crypto, SQL engine, AI client, token generator) and nested use cases. Do not put scalar config such as `model: string` here.

Do not create `application/services/` of classes. The aggregator file `types/services.ts` is the only "services" path under a feature domain module.

```ts
import type { ConnectionRepository } from '@/application/repositories/connection'
import type { SchemaRepository } from '@/application/repositories/schema'
import type { MemberRepository, WorkspaceRepository } from '@domain/workspace'
import type { ConnectionCredentialsCrypto, SqlEngine } from '@adapters'
import type { RunSqlUseCase } from '@/application/use-cases/sql/run-sql'

export type ConnectionRepos = {
  connection: ConnectionRepository
  schema: SchemaRepository
  workspace: WorkspaceRepository
  member: MemberRepository
}

export type ConnectionServices = {
  credentialsCrypto: ConnectionCredentialsCrypto
  sqlEngine: SqlEngine
  runSql: RunSqlUseCase
}
```

`runSql` belongs on `ConnectionServices` and is included only in the `Pick` of the use case that needs it.

## repositories/

Declare repository ports at `application/repositories/{entity}.ts`. Use cases depend on these contracts, and infrastructure implements them. Do not move repository ports into `packages/adapters`; that workspace is for external capability contracts. Export ports needed by infrastructure through the domain module's public entrypoints. In-memory doubles belong in `application/__tests__/repositories/{entity}.ts`; fakes for adapter ports belong in `packages/modules/tests`.

Do not add `application/services/` of classes, or `test-support/`, under feature domain modules.

## External capabilities and time

Use cases may depend on ports in `packages/adapters`. Generate identifiers with `ID` / `createID()` from `@domain/base`. Read the current time with `getNow()` from `@modules/utils`, not a Clock port in domain.

## utils/

`application/utils/` holds **util functions reused by many use-cases** — one file per concern (`utils/{name}.ts`), exporting plain functions. Use only when **two or more** use cases import the helper. A function used by a single use case stays in that use case's file, or in the use-case folder when it is a pure sibling module. Do not put entity-to-JSON mappers here.

```ts
import { TaskRepository } from '@/application/repositories/task'
import { Task } from '@/enterprise/entities/task'
import { createID } from '@domain/base'

export async function loadOwnedTask(payload: {
  taskId: string
  userId: string
  repos: [TaskRepository]
}): Promise<Task> {
  const [taskRepository] = payload.repos

  return taskRepository.getOrThrow({
    id: createID(payload.taskId),
    userId: createID(payload.userId),
  })
}
```

## validation/

`application/validation/` holds **validation functions reused by many use-cases** — guards that throw `DomainError`/`ValidationError` when an **invariant** breaks. One file per entity (`validation/{entity}.ts`), plain functions, shared across use-cases only.

This folder is not HTTP input validation. Required fields, string length, format, and request enums belong in the route Zod schema (`bodySchema` / `paramsSchema` / `querySchema`) and are parsed before `execute` — see [http-route-handler](../../code-write-code/coding-patterns/backend/http-route-handler.md). A domain guard here needs a loaded entity (for example “this task does not accept that content type”). Do not put max length, trim, or required checks for request fields in `application/validation/` or in the use case. `ValidationError` in domain-base does not authorize a Zod request schema in the domain. Zod on `JsonRepository` validates a file on disk, not an HTTP body.

```ts
import { Task, TaskContentType } from '@/enterprise/entities/task'
import { DangerErrors, DomainError } from '@domain/base'

export function validateTaskContentType(
  task: Task,
  contentType: TaskContentType,
): void {
  if (task.props.contentType !== contentType) {
    throw new DomainError({
      code: 'TASK_CONTENT_TYPE_MISMATCH',
      errorType: DangerErrors.DATA_INTEGRITY,
    })
  }
}
```

Use-cases call these guards directly in `execute`, keeping the flow reading as `load → validate → apply`.
