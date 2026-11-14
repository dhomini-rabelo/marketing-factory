# Backend Adapters and Services Structure

In the [monorepo](./monorepo-structure.md), external capability ports live in `packages/adapters`, repository ports live in each domain module's `application/repositories/`, and concrete implementations live in infrastructure. **All file and folder names use kebab-case**; only exported identifiers (classes, interfaces) follow their own casing.

## Folder layout

```
packages/
├── adapters/src/
│   ├── index.ts                # public barrel
│   └── ports/{capability}.ts
├── modules/
│   ├── utils/src/              # getNow() and other cross-cutting helpers
│   └── tests/src/              # fakes for adapter ports
├── domain/{module}/src/
│   ├── enterprise/entities/{entity}.ts
│   └── application/repositories/{entity}.ts
└── infra/{implementation}/
    ├── scripts/                # seeds and demo data live in {app}/scripts, never in src/
    │   ├── seed.ts
    │   └── seed.integration.test.ts
    └── src/
        ├── index.ts            # public barrel
        ├── mappers/{entity}.ts # row ↔ entity (persistence)
        └── services/
            ├── {provider-impl}.ts
            └── repositories/{database}-{entity}.ts
```

An implementation workspace can group related services; a separate package per provider is not required. `packages/infra/adapters` is a valid implementation-package name, distinct from the contracts in `packages/adapters`.

## Provider ports (`packages/adapters`)

A provider port is one file under `packages/adapters/src/ports/` that declares the contract the domain needs from an external capability (hashing, invite tokens, SQL engines, AI clients, credential crypto, JWT, and similar). It exports typed `Payload`/`Response` shapes and any shared value types the port returns (for example `QueryResult`, `TableInfo`, `ConnectionRuntimeConfig`) in the adapter package — alongside the port file or in dedicated files under `ports/` — not in feature domain modules. Contracts must not import provider SDKs, infrastructure, or feature-domain modules (`@domain/*` enterprise types). Domain and infra import those types from `@adapters` (or the workspace alias chosen at init); feature domains never import each other's enterprise types through adapters.

```ts
export interface Hasher {
  hash(plain: string): Promise<string>
  compare(plain: string, hashed: string): Promise<boolean>
}
```

Do not declare repository ports here. Do not add `services/` under domain feature modules for these capabilities.

## Repository ports

Each repository port is one file under `packages/domain/{module}/src/application/repositories/{entity}.ts` (not `{entity}-repository.ts`). It is an `abstract class` that extends the shared generic `Repository<Entity>` base where that abstraction is used, and adds entity-specific methods only when needed.

The SQL-like `Repository` / `InMemoryRepository` / `JsonRepository` is the default `@domain/base` contract. The NoSQL-like in-memory is a **sibling type** at `@domain/base/nosql`. Copyable source: [examples/domain-base](../../../../examples/domain-base/).

```ts
import { Repository } from '@domain/base'
import { Task } from '../../enterprise/entities/task'

export abstract class TaskRepository extends Repository<Task> {}
```

Export repository ports through the domain module's public entrypoints for infrastructure consumers. Use cases import their own module's ports locally.

## Persistence mappers

Keep database row serialization out of domain entities. Implement `serialize` / `deserialize` in `packages/infra/.../mappers/{entity}.ts`. Production repository classes call these mappers; HTTP shaping stays in route handlers. In-memory doubles keep the domain value (array or object) as-is; they do not stringify.

A structured entity prop (array or object) is a **json field** at rest: the mapper writes a JSON column and reads it back to the typed prop. `JSON.stringify` / `JSON.parse` live in the mapper, not on the entity.

```ts
import { ID } from '@domain/base'
import { CatalogItem } from '@/enterprise/entities/catalog-item'

export type CatalogItemRow = {
  id: string
  ownerId: string
  title: string
  tags: string
  createdAt: string
}

export class CatalogItemMapper {
  static serialize(entity: CatalogItem): CatalogItemRow {
    return {
      id: entity.id.toValue(),
      ownerId: entity.props.ownerId.toValue(),
      title: entity.props.title,
      tags: JSON.stringify(entity.props.tags),
      createdAt: entity.props.createdAt.toISOString(),
    }
  }

  static deserialize(row: CatalogItemRow): CatalogItem {
    return CatalogItem.reference(new ID(row.id), {
      ownerId: new ID(row.ownerId),
      title: row.title,
      tags: JSON.parse(row.tags) as string[],
      createdAt: new Date(row.createdAt),
    })
  }
}
```

`JsonRepository` is a different pattern: it persists the **collection** as a JSON file (`serialize` / `deserialize` of each entity into that file). It is not a json column. Copyable json-field mapper: [mappers/catalog-item.ts](../../../../examples/domain-base/src/samples/mappers/catalog-item.ts). Copyable file-collection repository: [json-catalog-item-repository.ts](../../../../examples/domain-base/src/samples/json-catalog-item-repository.ts).

## Implementations

Concrete implementations live under `packages/infra/{implementation}/src/services/`. An implementation `implements` (or `extends`) its port. Keep SDK configuration and database-specific behavior there.

In-memory repositories used as unit-test doubles belong in `application/__tests__/repositories/{entity}.ts` inside the owning domain module. Fakes for adapter ports belong in `packages/modules/tests`. If an in-memory implementation is an intentional runtime choice, it belongs in infrastructure like any other runtime implementation.

```ts
export class FirebaseAuthProviderService implements AuthProviderService {
  async getUserFromToken(payload: GetUserFromTokenPayload) {
    // ...
  }
}
```

Use cases depend on the **port**, never on the implementation. Centralize concrete dependency construction within the owning infrastructure app.

Implementation classes take config and collaborators through the constructor and keep members `private readonly`; see [service class structure](../../code-write-code/coding-patterns/backend/service-class-structure.md).

## Package source folders

No package keeps files of different natures loose at the root of `src/`; only `index.ts` may stay there. Group files by nature (for example `client/`, `crypto/`, `ports/`, `services/`, `types/`, `utils/`, `repos/`, `__tests__/`) and import across folders with the package alias (`@{scope}/{package}/{folder}/{file}`). The shared domain base package follows the same rule with `entity/`, `repository/`, `errors/`, `types/` and `use-case/`.

## Seeds and demo data

Seeds, fixtures and demo-data scripts live in `{app}/scripts/` (for example `packages/infra/{implementation}/scripts/`), never in `src/`, so the published surface of the package stays free of tooling. The seed entrypoint is a `package.json` script that the root `package.json` delegates to. The scripts folder is listed in the package `tsconfig` `include` and has a path alias, and its tests sit beside it with the `*.integration.test.ts` suffix.
