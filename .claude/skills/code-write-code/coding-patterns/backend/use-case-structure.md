# Use Case Coding Patterns

A use case has a single public `execute` method. Its job is to read like a
short summary of what the use case does, delegating the real work to small,
well-named private methods. Use these patterns when creating or refactoring
any `UseCase` class. Public methods follow the single-object parameter rule in [General coding practices](../../general-coding-practices.md); private helpers follow the same rule (more than two parameters become one object; up to two obvious scalars may stay positional). `UseCase<Payload, Response>` and class entities come from
`@domain/base` ([examples/domain-base](../../../../../examples/domain-base/)); repository
calls follow the SQL-like port (`findMany` list, `getOrNull`, `getOrThrow`) unless the
module explicitly uses the NoSQL sibling.

## Keep `execute` as a summary of named steps

- `execute` builds the shared values it needs, delegates each responsibility to
  a private method, and composes the results.
- A reader should understand the whole flow from `execute` alone, without
  scrolling into the details of each step.
- Extract a private method for each distinct responsibility: each entity
  created, each branch resolved, each validation, each side effect.

```typescript
// Wrong way
async execute(payload: Payload): Promise<(Reminder | Task)[]> {
  const now = getNow()
  const created: (Reminder | Task)[] = []

  for (const draft of payload.newReminders) {
    const reminder = await this.reminderRepository.create({ /* ... */ })
    created.push(reminder)
  }

  for (const draft of payload.newTasks) {
    const task = await this.taskRepository.create({ /* ... */ })
    created.push(task)
  }

  return created
}

// Correct way — return domain entities; HTTP maps them at the route
async execute(payload: Payload): Promise<(Reminder | Task)[]> {
  const now = getNow()

  const reminders = await this.createReminders(payload.userId, payload.newReminders, now)
  const tasks = await this.createTasks(payload.userId, payload.newTasks, now)

  return [...reminders, ...tasks]
}
```

## Private method vs sibling file

- Keep a step as a `private` method when it uses `this` (repos, services) or
  is a named orchestration step of `execute` (`validate*`, `require*`,
  `build*` / `apply*` in the flow).
- Extract a sibling module in the use-case folder when the function is pure
  and used only by that use case (prompt assembly, mapping with no `this`).
- Shared helpers used by two or more use cases go to `application/utils/`.
- A module-level function is not a substitute for `validate*` / `require*`
  guards that throw `DomainError`. The dedicated private-method patterns
  below still apply.

## Name private methods after the outcome they produce

- Use verb-based names that describe the result of the step: `createReminders`,
  `buildLoginResponse`, `collectTopicSummaries`, `applyTextContent`.
- Avoid generic names that hide what the step does, such as `handleReminders`,
  `processStep`, or `doWork`.

```typescript
// Wrong way
private async handleReminders(/* ... */): Promise<Reminder[]> {}

// Correct way
private async createReminders(/* ... */): Promise<Reminder[]> {}
```

## Dispatch each branch to its own resolver

When `execute` chooses between variants (by kind, type, or status), give each
branch its own private method and keep `execute` as the dispatcher.

```typescript
// Wrong way — building API DTOs inside the use case
async execute(payload: Payload): Promise<{ kind: string; title: string } | null> {
  const reminder = await this.reminderRepository.getOrThrow({ id: createID(payload.itemId) })
  return { kind: 'reminder', title: reminder.props.title }
}

// Correct way — return the loaded entity; getOrThrow raises the not-found error
async execute(payload: Payload): Promise<Reminder | Task | Note> {
  const id = createID(payload.itemId)

  if (payload.kind === 'reminder') {
    return this.loadReminder(id)
  }

  if (payload.kind === 'task') {
    return this.loadTask(id)
  }

  return this.loadNote(id)
}
```

## Extract DomainError guards into `validate*` private methods

Private methods that throw `DomainError` use the prefix `validate`. That preference
prevails over older `ensure*` / `require*` names for these guards. Shared load
helpers that return the guaranteed value stay `require*` (`requireMembership`,
`requireStoredConnection`). Do not name private DomainError guards `ensure*` or
`assert*`. A large branch in `execute` still becomes its own private method.

- A method named `validate...` checks an invariant and throws when it is broken;
  it returns `void`.
- This keeps `execute` reading as `load → validate → apply` instead of mixing
  guards with the main flow.

```typescript
// Wrong way
async execute(payload: Payload): Promise<Task> {
  const task = await this.taskRepository.getOrThrow({ id: createID(payload.taskId), userId: createID(payload.userId) })

  if (task.props.contentType !== 'text') {
    throw new DomainError({ code: 'TASK_CONTENT_TYPE_MISMATCH', errorType: DangerErrors.DATA_INTEGRITY })
  }

  return this.taskRepository.update(task.id, { /* ... */ })
}

// Correct way
async execute(payload: Payload): Promise<Task> {
  const task = await this.taskRepository.getOrThrow({ id: createID(payload.taskId), userId: createID(payload.userId) })

  this.validateTaskHoldsTextContent(task)

  return this.applyTextContent(task, payload.textContent)
}

private validateTaskHoldsTextContent(task: Task): void {
  if (task.props.contentType !== 'text') {
    throw new DomainError({ code: 'TASK_CONTENT_TYPE_MISMATCH', errorType: DangerErrors.DATA_INTEGRITY })
  }
}
```

## Separate `build` (compose a result) from `apply` (persist a change)

- `build...` methods assemble an in-memory value (a response, a diff, a set of props).
- `apply...`/`record...`/`register...`/`create...` methods perform the side effect
  (persist, update, create). Splitting them makes each responsibility testable and
  obvious from the name.

```typescript
// Correct way
async execute(payload: Payload): Promise<Response> {
  const userFromProvider = await getUserFromProviderTokenOrThrow(this.authProviderService, payload.token)
  const existingUser = await this.userRepository.getOrNull({ providerId: userFromProvider.id })
  const isUserRegistered = existingUser !== null

  if (isUserRegistered) {
    return this.buildLoginResponse(existingUser)
  }

  return this.registerUser(userFromProvider)
}
```

## Type extracted method parameters explicitly

- Give each private method real parameters and import the domain types it needs
  instead of relying on inline `Awaited<ReturnType<...>>` or `any`.
- Pass only the values the step needs (e.g. `userId`, `drafts`, `now`) rather than
  threading the whole `payload` through every method. With more than two values, group them in one object parameter.

```typescript
// Wrong way
private async registerUser(userFromProvider: Awaited<ReturnType<typeof getUserFromProviderTokenOrThrow>>) {}

// Correct way
private async registerUser(userFromProvider: GetUserFromTokenResponse): Promise<Response> {}
```

## Do not split a use case that already has one responsibility

- When `execute` is a single linear flow with one responsibility — a lone
  `repository.create(...)`, a single `update`, or a one-line delegation — leave it
  inline. Extracting a method that is only ever called once from a trivial body adds
  indirection without improving readability.

```typescript
// Correct way — leave this as is, do not extract
async execute(payload: Payload): Promise<Message> {
  return this.messageRepository.create({
    userId: payload.userId,
    role: 'user',
    content: payload.content,
    createdAt: new Date(),
  })
}
```
