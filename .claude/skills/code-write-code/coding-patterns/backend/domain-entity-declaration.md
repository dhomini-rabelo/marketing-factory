# Domain Entity Declaration Patterns

How to declare a domain entity. Use these patterns whenever you add or refactor an entity under `packages/domain/{module}/src/enterprise/entities/`; import shared entity primitives through the domain-base workspace's public exports (`Entity`, `AggregateRoot`, `ID`, `create`/`reference`). Export `{Entity}Props` and the entity class only — no `{Entity}View` or `to{Entity}` in domain. The copyable implementation is [examples/domain-base](../../../../../examples/domain-base/) (`src/entity/`); in an app it lives at `packages/domain/base`.

## Extend the domain base class with a typed Props

- An entity extends `Entity<Props>` (or `AggregateRoot<Props>` for an aggregate root) parameterized by its props type.
- Declare the props as an exported `interface` (or `type`) named `{Entity}Props`. Export categorical fields as `enum` with string values (UPPER_SNAKE members), not `type` unions of string literals. See [enum em entidades enterprise](../../../../memory/dev-preferences/enum-em-entidades-enterprise.md).

```typescript
// Wrong way
export type TaskStatus = 'created' | 'active' | 'finished'

// Correct way
export enum TaskStatus {
  CREATED = 'created',
  ACTIVE = 'active',
  FINISHED = 'finished',
}

export interface TaskProps {
  userId: ID
  title: string
  status: TaskStatus
  createdAt: Date
}

export class Task extends Entity<TaskProps> {
  // ...
}
```

When an enum is owned by a single entity (for example `Engine` on `Connection`), keep it in that entity's file instead of a separate `engine.ts` that only re-exports the enum.

## Keep structured props as domain values, not JSON strings

- Arrays and objects on `{Entity}Props` are the domain value (`tags: string[]`,
  a nested object). Do not type them as a serialized JSON `string`.
- Persistence maps that value to a JSON column in
  `packages/infra/.../mappers/{entity}.ts` (`JSON.stringify` / `JSON.parse` on
  the row field `tags`, camelCase like domain props). The entity does not parse JSON.
- `JsonRepository` persists the **whole collection** as a JSON file. It is not
  the json-field pattern and does not replace the mapper column. Do not add a
  branded `JsonField` type to `domain/base` for this.
- Copyable pair: [catalog-item.ts](../../../../../examples/domain-base/src/samples/catalog-item.ts)
  (`tags: string[]`) and
  [mappers/catalog-item.ts](../../../../../examples/domain-base/src/samples/mappers/catalog-item.ts).

## Expose `create` and `reference` static factories

- Every entity declares two static factory methods. `create(props)` builds a new instance (a fresh `ID` is generated). `reference(id, props)` rebuilds an instance from an existing `ID` (reconstructing a persisted record).
- Do not instantiate entities with `new` from outside the entity; always go through these factories.

```typescript
// Wrong way
export class Task extends Entity<TaskProps> {}
const task = new Task(props) // bypasses the factory contract

// Correct way
export class Task extends Entity<TaskProps> {
  static create(props: TaskProps) {
    return new Task(props)
  }

  static reference(id: ID, props: TaskProps) {
    return new Task(props, id)
  }
}

const task = Task.create(props)
const persisted = Task.reference(id, props)
```

## Type id-bearing props as `ID`, not `string`

- Foreign keys and identifiers in props use the `ID` value class, not raw strings, so identity semantics are preserved through the domain.

```typescript
// Wrong way
export interface TaskProps {
  userId: string
  messageId: string | null
}

// Correct way
export interface TaskProps {
  userId: ID
  messageId: ID | null
}
```
