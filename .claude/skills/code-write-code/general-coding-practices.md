# Code Patterns

- Use descriptive names for variables, functions, and classes.

```typescript
// Wrong way
const list1 = []
list1.push({
  name: 'John Doe',
  testScore: 10,
})

// Correct way
const students = []
students.push({
  name: 'John Doe',
  testScore: 10,
})

// Wrong way
const invalidDays = [0, 6]

// Correct way
const weekendDays = [0, 6]

// Wrong way
function filterBody(body) {
  return Object.entries(body).reduce((acc, [key, value]) => {
    return value === undefined ? acc : { ...acc, [key]: value }
  })
}

// Correct way — canonical name `removeKeysForUndefinedValues`.
// Implementation lives in `@modules/utils` (copy from examples/modules-utils).
// Always wrap the changes object of an update with it, so optional fields do not need `!== undefined` ternaries or manual merges.
import { removeKeysForUndefinedValues } from '@modules/utils'

repository.update(
  id,
  removeKeysForUndefinedValues({
    host: payload.host,
    port: payload.port,
    database: payload.database,
  }),
)

// Wrong way
repository.update(id, {
  description: payload.description !== undefined ? payload.description.trim() : existing.description,
})

// Correct way — normalize the optional value with `?.` and let undefined keys drop out
repository.update(
  id,
  removeKeysForUndefinedValues({
    description: payload.description?.trim(),
  }),
)
```

- Never abbreviate identifiers or lambda parameters (`workspace`, not `ws`; `error`, not `err`). Name a hook result after what it returns: `const workspaces = useWorkspaces()`.

```typescript
// Wrong way
const ws = useWorkspaces()
users.filter((u) => u.active)

// Correct way
const workspaces = useWorkspaces()
users.filter((user) => user.active)
```

- Use descriptive boolean variable names.

```typescript
// Wrong way
const runMigration = true
const admin = true
const validOption = true
const permission = true

// Correct way
const shouldRunMigration = true
const isAdmin = true
const isOptionValid = true
const doesUserHavePermission = true
```

- Name the condition in guards and compound `if` expressions: extract a descriptive boolean (`doesX`, `isX`, `hasX`) instead of testing raw values inline. Simple, self-evident ifs (`if (items.length === 0)`) stay as they are.

```typescript
// Wrong way
const user = await userRepository.getOrNull({ email })
if (!user || !(await hasher.compare(password, user.props.passwordHash))) {
  throw new InvalidCredentialsError()
}

// Correct way
const user = await userRepository.getOrNull({ email })
const doesUserExist = user !== null
const doesPasswordMatch = doesUserExist && (await hasher.compare(password, user.props.passwordHash))

if (!doesUserExist || !doesPasswordMatch) {
  throw new InvalidCredentialsError()
}
```

- Functions and methods (public and private) with more than two parameters take a single object argument typed as `Payload` or a domain-specific name (`input`, `context`). Up to two parameters with obvious roles may stay positional, such as `Hasher.hash(plain)`, `Hasher.compare(plain, hashed)`, or `roleAtLeast(role, minimum)`. Inject the repositories and services of a function as arrays under `repos` / `services`; constructors of classes keep their own typed parameters (see [service class structure](./coding-patterns/backend/service-class-structure.md)).

```typescript
// Wrong way
async function requireMembership(
  workspaceId: string,
  userId: string,
  workspaceRepository: WorkspaceRepository,
  memberRepository: MemberRepository,
) {}

// Correct way
async function requireMembership(payload: {
  workspaceId: string
  userId: string
  repos: [WorkspaceRepository, MemberRepository]
}) {}

// Wrong way — private helper with three scalars
private buildPage(table: string, limit: number, offset: number) {}

// Correct way — private helper
private buildPage(input: { table: string; limit: number; offset: number }) {}
```

When the helper loads the subject entity, the `repos` tuple includes that entity's repository, then ownership repos. Do not pass the entity repository as a separate named field outside `repos`.

```typescript
// Wrong way
async function requireStoredConnection(payload: {
  connectionRepository: ConnectionRepository
  repos: [WorkspaceRepository, MemberRepository]
  connectionId: string
  userId: string
}) {}

// Correct way
async function requireStoredConnection(payload: {
  connectionId: string
  userId: string
  repos: [ConnectionRepository, WorkspaceRepository, MemberRepository]
}) {}
```

- Use object.property instead of destructuring in const declarations.

```typescript
// wrong way
const { audioBuffer } = payload

// correct way
payload.audioBuffer
```

```typescript
// wrong way
const audioBuffer = payload.audioBuffer

// correct way
payload.audioBuffer
```

- Use `??` for null/undefined fallbacks, not `||`.

```typescript
// Wrong way
const remindAt = draft.remindAt || null
const items = draft.todoItems || []

// Correct way
const remindAt = draft.remindAt ?? null
const items = draft.todoItems ?? []
```

- Convert raw string ids from a payload into the `ID` value class with `createID()` at the use-case entry point, before passing them to repositories.

```typescript
// Wrong way
async execute(payload: Payload) {
  return this.taskRepository.getOrThrow({ id: payload.taskId })
}

// Correct way
async execute(payload: Payload) {
  return this.taskRepository.getOrThrow({
    id: createID(payload.taskId),
    userId: createID(payload.userId),
  })
}
```

- When a missing record is an error (it must become a 404), load it with `getOrThrow`, not `getOrNull`/`findFirst` followed by an existence check. Use `getOrNull` only when absence is a valid outcome (uniqueness checks, login where the response must not reveal whether the account exists).

```typescript
// Wrong way
const task = await this.taskRepository.getOrNull({ id: createID(payload.taskId) })
if (!task) {
  throw new DomainError({ code: 'TASK_NOT_FOUND', errorType: DangerErrors.NOT_FOUND })
}

// Correct way — the repository throws the not-found error
const task = await this.taskRepository.getOrThrow({ id: createID(payload.taskId) })

// Correct way — absence is not an error
const existingUser = await this.userRepository.getOrNull({ email: payload.email })
const isEmailTaken = existingUser !== null
```

- Declare class members that are not part of the public contract as `private readonly` (or `private` when reassigned). Never use `#field`.

```typescript
// Wrong way
export class BcryptHasher implements Hasher {
  #saltRounds = 10
}

// Correct way
export class BcryptHasher implements Hasher {
  private readonly saltRounds = 10
}
```

- Throw `DomainError` with both a `code` and a classified `errorType` from `DangerErrors`, never a bare `Error`.

```typescript
// Wrong way
throw new Error('Task not found')

// Correct way
throw new DomainError({
  code: 'TASK_NOT_FOUND',
  errorType: DangerErrors.NOT_FOUND,
})
```

- Use the `HttpStatus` enum for response status codes, not numeric literals.

```typescript
// Wrong way
return res.status(200).json(body)

// Correct way
return res.status(HttpStatus.OK).json(body)
```

- Name Zod schemas after their subject with a `Schema` suffix.

```typescript
// Wrong way
const schema = z.object({ id: z.string() })

// Correct way
const paramsSchema = z.object({ id: z.string() })
const reminderDraftSchema = z.object({ title: z.string() })
```

- Merge Tailwind classes with the `cn()` helper (`@/layout/utils/styles`); never concatenate class strings by hand.

```tsx
// Wrong way
<div className={'flex items-center ' + (isActive ? 'opacity-100' : 'opacity-60')} />

// Correct way
<div className={cn('flex items-center', isActive ? 'opacity-100' : 'opacity-60', className)} />
```

- Name magic numbers as module-level constants instead of inlining them.

```typescript
// Wrong way
const intervalId = setInterval(() => reveal(3), 24)

// Correct way
const TYPING_STEP_MS = 24
const TYPING_CHARS_PER_STEP = 3

const intervalId = setInterval(() => reveal(TYPING_CHARS_PER_STEP), TYPING_STEP_MS)
```

- In `project-mobile`, give a `Pressable` press feedback with NativeWind `active:` variants, not the `({ pressed }) => ...` render-callback form (which the project's NativeWind typing does not support).

```tsx
// Wrong way
<Pressable onPress={onPress}>
  {({ pressed }) => (
    <Text className={cn('text-primary', pressed && 'underline')}>{label}</Text>
  )}
</Pressable>

// Correct way
<Pressable onPress={onPress}>
  <Text className="text-primary active:underline">{label}</Text>
</Pressable>
```

- In `project-mobile`, generate client-side ids with `randomUUID()` from `expo-crypto`, not the web `crypto.randomUUID()` (which is not available in the React Native runtime).

```typescript
// Wrong way
const id = crypto.randomUUID()

// Correct way
import { randomUUID } from 'expo-crypto'

const id = randomUUID()
```
