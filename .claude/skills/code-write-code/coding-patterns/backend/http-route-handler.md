# HTTP Route Handler Patterns

How to write a route handler in the HTTP infrastructure workspace, for example `packages/infra/http/src/routes/{feature}/{operation}.ts`. The folder layout is covered by the [backend HTTP layer structure](../../../code-get-coding-designs/designs/backend-http-layer-structure.md) design; these patterns cover the file contents.

## Declare schemas and dependencies at module level

- Each file exports one named handler. Handlers do not know their path: the router file registers them, one line per route (`router.post('/{resources}', create{Resource})`).
- Schemas shared by several handlers of the same feature go in `routes/{feature}/{feature}-schemas.ts`.
- Define the Zod schemas and instantiate the use-case (with its injected repositories/services from the shared `repositories.ts`) once at module level, outside the handler, so they are reused across requests.
- Name each Zod schema after its request source: `bodySchema`, `paramsSchema`, `querySchema` (prefix with the resource when a file has several, e.g. `taskParamsSchema`).

```typescript
// Correct way
const taskParamsSchema = z.object({ id: z.string() })

const getTaskDetailUseCase = new GetTaskDetailUseCase(taskRepository)

export async function getTaskDetail(/* ... */) {}
```

## Validate request shape only in the route schemas

- Required fields, string length, format, and request enums belong in
  `bodySchema` / `paramsSchema` / `querySchema`. Parse them before
  `useCase.execute(...)`.
- Do not re-check that shape in the domain use case or in
  `application/validation/`. Domain validation is an invariant that needs a
  loaded entity (see [backend domain structure](../../../code-get-coding-designs/designs/backend-domain-structure.md)).
- Malformed input fails at `.parse` and never reaches `execute`.

```typescript
const createTaskBodySchema = z.object({
  title: z.string().min(1).max(120),
  tags: z.array(z.string()).max(20),
})
```

## Keep the handler a thin parse → execute → present flow

- Export one named handler per file with the `(req, res, next)` signature.
- Wrap the body in `try/catch` and forward every error to `next(err)` — never format errors in the handler; the central error handler maps them.
- Parse the request with the schemas, read the authenticated user from `req.userId`, call `useCase.execute(...)`, then return the presented result with an `HttpStatus` code.

```typescript
// Wrong way
export async function getTaskDetail(req: Request, res: Response) {
  const task = await getTaskDetailUseCase.execute({
    userId: req.userId,
    taskId: req.params.id, // unvalidated
  })
  return res.status(200).json(task) // magic number, unpresented entity
}

// Correct way
export async function getTaskDetail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await getTaskDetailUseCase.execute({
      userId: req.userId,
      taskId: taskParamsSchema.parse(req.params).id,
    })

    return res
      .status(HttpStatus.OK)
      .json({ item: TaskPresenter.toHttp(result.item) })
  } catch (err) {
    next(err)
  }
}
```
