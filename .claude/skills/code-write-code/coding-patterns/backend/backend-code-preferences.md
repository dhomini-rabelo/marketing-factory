# Back-end Code Preferences

Preferences for `project-backend`, captured from review corrections. They complement the focused back-end patterns; when a rule here overlaps a dedicated pattern, the dedicated pattern still applies for its own topic. See also the [general](../general-code-preferences.md) and [front-end](../frontend/frontend-code-preferences.md) preferences.

## Domain folder boundaries

- Production repository implementations belong in **infra** workspaces, never in domain modules. Repository contracts live at `application/repositories/{entity}.ts`; `packages/adapters` contains external capability contracts.
- A domain module's `application/use-cases/{feature}/` holds use-case classes and, when needed, a per-use-case folder `{use-case-name}/{use-case-name}.ts` plus that use case's own pure helpers. It is not classes-only. Behavior tests live in `application/use-cases/{feature}/__tests__/`. Reserve `application/use-cases/__tests__/` for cross-feature integration or a use case with no `{feature}` folder. In-memory repository doubles live in `application/__tests__/repositories/`; adapter fakes live in `packages/modules/tests`.
- Entities live under `enterprise/entities/` with `{Entity}Props` only — no `{Entity}View` or `to{Entity}` in domain.
- Shared business helpers (two or more use cases) go to `application/utils/`; a helper used by a single use case stays in that use case's file or folder. Shared validation of entity invariants goes to `application/validation/`; HTTP request shape (required, length, format, request enum) belongs in the route Zod schema, not in domain.
- Folders are grouped by **subject**, and the subject is normally an entity name.
- Decompose a large use-case into small, single-responsibility private methods or, when the step is pure and owned by that use case only, a sibling file in the use-case folder.

## One use-case, one responsibility

A use-case file that does two things should be two use-cases. Each implements the shared use-case interface from the domain-base workspace; adapt older `src/modules/domain/use-case.ts` examples to that public export.

## Enforce ownership with a compound repository query, not per-entity loaders

```typescript
// Wrong way — a dedicated loader per entity
loadOwnedNote(noteId, userId)
loadOwnedTask(taskId, userId)

// Correct way — the repository getOrThrow double-queries id + ownership
repository.getOrThrow({ id: createID(payload.itemId), userId: createID(payload.userId) })
```

## Request/Response contract types live in `api/contracts/`

Contract types are declared under `api/contracts/` and named with `RequestData` / `ResponseData` suffixes.

```typescript
// Correct way
export interface CreateTaskRequestData { ... }
export interface CreateTaskResponseData { ... }
```

## Type HTTP presenters via `Serialize`/`WithID` and `Omit`

Type presenter responses from the entity props with `Serialize` / `WithID` from `@/modules/domain/types`, and use `Omit` (not `Pick`) so adding a new entity field raises a type error that forces it into the serializer.

```typescript
// Wrong way — Pick silently ignores new fields
type TaskHttp = Pick<Serialize<TaskProps>, 'id' | 'title'>

// Correct way — Omit forces new fields to be handled
type TaskHttp = Omit<WithID<Serialize<TaskProps>>, 'internalToken'>
```
