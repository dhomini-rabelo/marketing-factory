# Frontend E2E Testing

Playwright specs for a web app live in `e2e/` as `{screen}.spec.ts`, one spec per screen, covering the success flows and the main error of that screen.

## Folder layout

```
e2e/
  {screen}.spec.ts
  helpers/
    unique-name.ts
    api-session.ts
    auth.ts
    fixture-test.ts
    {screen}.ts
    mock-{external-service}.ts
```

One helper per subject. Specs import helpers through an `@e2e/*` alias.

## Isolated data per test

Never depend on seed data for mutations. Create the user and every owned resource through the API with a Playwright `APIRequestContext`, using unique names (`uniqueName`, `uniqueEmail`), and expose them as a test-scoped fixture.

```ts
// Wrong way
await loginAsDemo(page)
await page.goto('/w/seeded-workspace/members')

// Correct way
test('lists the owner', async ({ page, workspaceFixture }) => {
  await page.goto(`/w/${workspaceFixture.workspace.slug}/members`)
})
```

Read-only checks against the seed are acceptable only for the demo sign-in journey.

## Authentication

Sign in through the API and inject the session cookies (`signInWithCookies`). Use the login form (`signInViaForm`) only in the login spec. To act as another user, call `page.context().clearCookies()` and inject that user's cookies.

## External services

Mock network adapters (AI, payments, mail) at the browser boundary with `page.route`, one helper per success and failure.

## Selectors and waiting

Prefer `getByRole`, `getByLabel` and `getByPlaceholder`. Use `exact: true` when a name is a substring of another control. Assert on user-visible text, not CSS classes.

Wait for state, never for time. Rely on web-first assertions (`expect(locator).toBeVisible()`) or wait for the data a feature needs (a list rendered, a response received) before interacting.

```ts
// Wrong way
await page.goto('/connections')
await page.waitForTimeout(2000)
await page.getByRole('button', { name: 'Ask AI' }).click()

// Correct way
await page.goto('/connections')
await expect(page.getByRole('listitem').first()).toBeVisible()
await page.getByRole('button', { name: 'Ask AI' }).click()
```

## Running

Specs run against the production build served by the real server (`scripts/e2e-web-server.sh`). While iterating, start the server once and rely on `reuseExistingServer`; rebuild the web and restart the server after changing `src/`, because the server caches the built `index.html`.
