# Domain integration testing

Domain integration suites chain real use cases over shared in-memory repositories. They prove that the use cases of one domain compose into complete flows, without a database, HTTP layer, or external service. Per-use-case behavior still belongs to the unit suites described in [Automated testing](../automated-testing.md).

## Location and naming

Place the suites inside the domain package, in a single folder, with the `.integration.test.ts` suffix. Name each file after the flow it covers.

```
packages/domain/{domain}/
  vitest.config.ts
  vitest.integration.config.ts
  src/application/__tests__/
    factories/
    repositories/
    integration/
      {flow-name}.integration.test.ts
```

## Separate unit and integration runs

Use two Vitest configs. The unit config excludes the integration suffix, so integration files never run as unit tests. The integration config includes only that suffix.

```ts
// Correct way: vitest.config.ts
test: {
  environment: 'node',
  passWithNoTests: false,
  include: ['src/**/*.test.ts'],
  exclude: ['src/**/*.integration.test.ts', '**/node_modules/**'],
}

// Correct way: vitest.integration.config.ts
test: {
  environment: 'node',
  passWithNoTests: false,
  include: ['src/**/*.integration.test.ts'],
}
```

```json
// Correct way: package.json
"scripts": {
  "test:unit": "vitest run --config vitest.config.ts",
  "test:integration": "vitest run --config vitest.integration.config.ts"
}
```

```ts
// Wrong way: one config with include "src/**/*.test.ts" and no exclude
```

## Share and wire the repositories

Create each in-memory repository once per `describe`, build the use cases from the same `repos` object, and wire repositories that depend on each other the way the real ones do (for example the parent repository receives the member repository). Add the factories of the aggregates that the flow needs only as setup.

```ts
// Wrong way
const create = new Create{Entity}UseCase({ {entity}: new InMemory{Entity}Repository() })
const list = new List{Entities}UseCase({ {entity}: new InMemory{Entity}Repository() })

// Correct way
const {entity}Repository = new InMemory{Entity}Repository()
const repos = { {entity}: {entity}Repository, {parent}: {parent}Repository }
const create = new Create{Entity}UseCase(repos)
const list = new List{Entities}UseCase(repos)
```

## Reset every repository before each test

```ts
beforeEach(async () => {
  await {entity}Repository.reset()
  await {parent}Repository.reset()
})
```

Each test builds its own data through a `setup()` helper (factories or the create use case), so tests never depend on each other.

## Chain real use cases and assert through reads

Drive state only through use cases. Assert intermediate and final state through the read use cases (`get`, `list`) rather than by inspecting repository internals. Use direct repository reads (`count`) only for side effects no read use case exposes.

```ts
// Wrong way
await create.execute(payload)
expect({entity}Repository.items).toHaveLength(1)

// Correct way
const created = await create.execute(payload)
const listed = await list.execute({ {parent}Id, userId })
expect(listed.items.map((item) => item.id.toValue())).toEqual([created.item.id.toValue()])
```

## What a suite covers

- Per aggregate: create, read, list, update, and delete in a single lifecycle test, ending with the not-found result after deletion.
- Cross-aggregate rules: a linked entity from another parent scope is rejected and leaves no record.
- Per-user or per-scope isolation: another user or scope never sees the data.
- Multi-step workflows of the domain (for example invite then accept, favorite then unfavorite).
- Permission failures expressed with `expectError(..., DomainError)` and the error code.

Do not repeat every branch of a use case here; keep those in the unit suite.
