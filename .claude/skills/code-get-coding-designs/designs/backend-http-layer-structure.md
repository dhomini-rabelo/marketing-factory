# Backend HTTP Layer Structure

How an HTTP infrastructure workspace, for example `packages/infra/http`, is organized. Follow the [monorepo structure](./monorepo-structure.md) for package dependencies. **All file and folder names use kebab-case**; only exported identifiers stay in their own casing.

## Folder layout

```
packages/infra/{app}/src/
├── app.ts                         # builds the app: middlewares, route registration, error handler
├── server.ts                      # entry point: listen, shutdown
├── repositories.ts                # single source of repository instances
├── middlewares/
│   ├── {middleware}.ts
│   └── error-handler.ts
├── presenters/
│   └── {entity}-presenter.ts      # entity → HTTP DTO mapping
├── routes/
│   └── {feature}/
│       └── {operation}.ts         # one route handler per file
├── services/
│   └── {service}.ts               # infrastructure helpers used by handlers and middlewares
├── types/
│   └── {framework}-request.d.ts   # request type augmentation
└── __tests__/
    └── *.integration.test.ts      # app-level HTTP tests
```

`src/` keeps only `app.ts`, `server.ts`, composition modules and optional `index.ts` at its root; every other file lives in a folder named by its nature.

## routes/

Each route handler is a single file under a **feature folder** (`routes/{feature}/{operation}.ts`), named after the HTTP operation (`list-tasks.ts`, `get-task-detail.ts`, `update-task-content.ts`). The file exports one named handler function; one handler per file, never several handlers in the same file. The handler-level conventions (schemas, instantiation, flow) are documented in the [http-route-handler](../../code-write-code/coding-patterns/backend/http-route-handler.md) coding pattern.

## repositories.ts

A single `repositories.ts` instantiates every repository once and exports the instances. Routes, presenters, and middlewares import these shared instances instead of constructing their own, keeping one source of truth.

Keep this composition scoped to the infrastructure app. Select implementations and database configuration for the target runtime or isolated test environment; do not place concrete instances in domain exports. A dedicated composition module may own construction when several entrypoints need it. `server.ts` starts listening; importing `app.ts` for integration tests must not start a listener.

```ts
export const taskRepository = new InMemoryTaskRepository()
export const noteRepository = new InMemoryNoteRepository()
```

## presenters/

One presenter per entity (`presenters/{entity}-presenter.ts`) maps domain entities to HTTP response DTOs. See the [http-presenter](../../code-write-code/coding-patterns/backend/http-presenter.md) coding pattern.

## middlewares/, services/ and types/

`middlewares/` holds request hooks (authentication, error handler, domain-error-to-status mapping). `services/` holds infrastructure classes and helpers used by handlers and middlewares (sessions, SQL safety checks, credential handling). `types/` holds type augmentations of the HTTP framework request.

## app.ts and server.ts

`app.ts` wires the Express app: it imports each handler, registers the routes (applying `authMiddleware` where needed), and mounts the error handler **last** so all thrown errors funnel through it. `app.ts` never listens: `server.ts` starts the listener, so integration tests import the app freely.

```ts
const app = Express()

app.post('/auth/login-or-register', loginOrRegister)
app.get('/tasks/list', authMiddleware, listTasks)
app.get('/tasks/:id/detail', authMiddleware, getTaskDetail)

app.use(errorHandler)
```
