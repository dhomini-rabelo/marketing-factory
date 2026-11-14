# Backend E2E testing

Backend E2E suites start the real HTTP server inside the Vitest process, bound to a free port, over a throwaway database, and exercise it with `fetch`. They prove that routing, authentication, validation, error mapping, use cases, persistence and engines work together. Behavior of a single use case still belongs to the unit suites described in [Automated testing](../automated-testing.md).

## Location and naming

Keep the suites in an `e2e/` folder at the root of the server package, outside `src/`, with the `.e2e.test.ts` suffix. Name each file after the feature whose routes it covers, and put shared helpers in `e2e/support/`.

```
packages/infra/{server-name}/
  vitest.e2e.config.ts
  e2e/
    {feature}.e2e.test.ts
    support/
      test-server.ts
      api-client.ts
      scenarios.ts
```

## Separate E2E runs

Use a dedicated Vitest config that includes only the `.e2e.test.ts` suffix, so integration and unit runs never start the server. Expose it as `test:e2e` in the package and chain it in the root `test:e2e` before the browser suites.

```ts
// Correct way: vitest.e2e.config.ts
test: {
  environment: 'node',
  globalSetup: ['../db/vitest.global-setup.ts'],
  env: { NODE_ENV: 'test' },
  include: ['e2e/**/*.e2e.test.ts'],
}
```

```json
// Correct way: package.json
"scripts": {
  "test:e2e": "vitest run --config vitest.e2e.config.ts"
}
```

```ts
// Wrong way: e2e files named *.integration.test.ts inside src/
```

## Start the server in a helper

Expose one `start{Server}()` helper that copies the migrated database template provided by the global setup into a fresh temporary data directory, sets the data directory variable before importing the app (modules read the environment at import time), listens on port `0`, and returns the base URL plus a `stop()` that closes external connections and the app and removes the directory. Each suite file starts its own server in `beforeAll` and stops it in `afterAll`, which keeps files isolated and parallel-safe.

```ts
// Wrong way
await app.listen({ port: 4000 })

// Correct way
await app.listen({ port: 0, host: '127.0.0.1' })
const { port } = app.server.address() as AddressInfo
```

## Talk to the server through a client

Wrap `fetch` in a small client class that keeps the session cookie from `set-cookie`, sends JSON, and returns `{ status, body }`. One client instance equals one signed user, so permission cases use a second client. Build state through the API itself using scenario helpers (`register{User}`, `create{Resource}`) with unique emails, never by writing to the database.

## Cover every route

For each route assert the success status and envelope, then the main failures that apply: `400 validation_error` for invalid input, `401` without a session, `403` for a non member, `404` for an unknown resource, `409` for conflicts. Assert the exact status and error `code`; a range such as "between 400 and 500" hides regressions.

```ts
// Wrong way
expect([401, 403]).toContain(response.status)

// Correct way
expect(response.status).toBe(401)
expect(response.body.error.code).toBe('unauthorized')
```

## Real engines and external services

Use real local engines that need no service (for example embedded database files created in the test data directory). Replace network-bound ports in the test file with `vi.mock` of the adapter package, returning a fake class with the same contract, so no suite reaches the internet.

```ts
// Correct way
vi.mock('{adapters-package}', async (importOriginal) => {
  const original = await importOriginal<typeof import('{adapters-package}')>()
  class Fake{Service} {
    async {operation}() {
      return {}
    }
  }
  return { ...original, {Service}: Fake{Service} }
})
```
