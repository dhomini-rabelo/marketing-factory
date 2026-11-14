# General Code Preferences

Cross-cutting preferences captured from review corrections. They complement the focused patterns and designs; when a rule here overlaps a dedicated pattern, the dedicated pattern still applies for its own topic. See also the [front-end](./frontend/frontend-code-preferences.md) and [back-end](./backend/backend-code-preferences.md) preferences. Domain primitives (`Entity<Props>`, `ID`, `DangerErrors`) are those in [examples/domain-base](../../../../examples/domain-base/) (`packages/domain/base` in an app).

## Apply a change across every matching file and layer

When a field, model, pattern, or shared interface changes, propagate it to **all** affected files and layers — not just the one in focus. Enumerate the siblings first, then cover them all.

```typescript
// Wrong way — rename only where the bug was spotted
interface UserProps {
  avatarUrl: string
  createdAt: Date
}
// ...adapter still builds the old shape, mobile client still reads the old field

// Correct way — propagate to entity + every adapter/mapper + the mobile client
// entity, in-memory repo, db mapper, presenter, and consuming mobile types all updated together
```

## Sync the consuming client(s) when a backend contract changes

A backend response/contract change is not done until the consuming `project-mobile` client is updated to match, in the same task.

## Web-search the correct approach instead of guessing

When a fix does not work and the cause is unclear, search the web for the idiomatic/correct approach before trying another guess. Reinforces the project's `NO GUESSING` rule.

## Augment existing structure when asked to "add X"

When asked to add something to an existing file or doc, preserve its current structure and only add the requested element. Never silently rewrite it into a new format.

## Use path-alias imports, not deep relative paths

```typescript
// Wrong way
import { createID } from '../../../modules/domain/id'

// Correct way
import { createID } from '@/modules/domain/id'
```

## Delete the original file after splitting it

After splitting a component (or module) into smaller units, remove the original monolithic file and place the new units in their conventional folder — never leave dead duplicates alongside the new files.

## Derive views with `Omit` and `Pick` from the canonical type

Keep one canonical props/entity type for the full record (everything the repository persists and loads, including fields that must not leave the domain unchanged). Derive narrower shapes with `Omit` or `Pick` instead of declaring sibling types that repeat the same fields (`StoredUser`, `PublicUser`, and similar duplicates).

```typescript
// Wrong way — StoredUser duplicates User fields
export interface UserProps {
  email: string
  passwordHash: string
  createdAt: Date
}

export interface StoredUserProps {
  email: string
  passwordHash: string
  createdAt: Date
}

export class User extends Entity<UserProps> {
  static create(props: UserProps) {
    return new User(props)
  }

  static reference(id: ID, props: UserProps) {
    return new User(props, id)
  }
}

// Correct way — full props on the entity; Omit for exposed shapes
export interface UserProps {
  email: string
  passwordHash: string
  createdAt: Date
}

export class User extends Entity<UserProps> {
  static create(props: UserProps) {
    return new User(props)
  }

  static reference(id: ID, props: UserProps) {
    return new User(props, id)
  }
}

export type RegisterUserResponse = {
  user: Omit<UserProps & { id: ID }, 'passwordHash'>
}
```

HTTP presenters follow their own shaping rules in [HTTP presenter](./backend/http-presenter.md) and [Back-end code preferences](./backend/backend-code-preferences.md); this preference applies to domain types, use-case responses, and mappers.

## Name values by what they are, never abbreviate

Use the full domain word for variables, parameters and lambda arguments; the lint config rejects abbreviations and comments (see [lint](./lint.md)).

```ts
// Wrong way
const ws = useWorkspaces()
conns.map((c) => c.id)

// Correct way
const workspaces = useWorkspaces()
connections.map((connection) => connection.id)
```
