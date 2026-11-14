---
name: code-write-code
description: Apply general coding practices and project code conventions during both planning and implementation of features, bug fixes, and refactors. Use to guide naming, code organization within files, contracts, and implementation choices before and while writing code.
---

# Writing Code Skill

## When to use

Use these practices during planning to account for code conventions, contracts, and implementation constraints, and during implementation to write code that follows them. Loading this skill while planning does not authorize code changes.

For file and folder layouts, layer boundaries, and module composition, consult [code-get-coding-designs](../code-get-coding-designs/SKILL.md). This skill covers general coding advice and conventions for the code within those structures.

## General rules

1. Write code in English.
2. Write self-explanatory code instead of adding comments.
3. Follow the applicable coding patterns and the project's established conventions.

Read [General coding practices](./general-coding-practices.md) during planning and implementation. Open only the additional pattern files relevant to the task. Check the project's manifests and existing usage before choosing libraries.

Some references were imported from projects with `project-mobile` and `project-backend` components. Apply the [monorepo structure](../code-get-coding-designs/designs/monorepo-structure.md) when initializing new projects and translate these example paths to the owning workspaces. Repository contracts belong inside domain modules; `packages/adapters` contains external-service contracts. Framework-specific rules, helpers, and import paths apply where the project uses the corresponding stack and abstractions. Resolve actual paths and available helpers; do not assume examples already exist or add dependencies just to reproduce them.

### Coding Patterns

Keep cross-cutting patterns at the `coding-patterns/` root. Use `frontend/` for React and client-side conventions, `backend/` for server and domain conventions, and `mobile/` for React Native and mobile-specific conventions. Mobile work may also use the relevant shared frontend patterns.

#### General Patterns

##### Automated Testing

- When to Use: When initializing test execution or creating or changing application behavior, including every backend use case, integration boundaries, and main E2E journeys.
- Coding pattern: [Automated testing](./coding-patterns/automated-testing.md)

##### General Code Preferences

- When to Use: Whenever you write or refactor code in either project and want the cross-cutting preferences captured from review corrections (propagating changes across layers, contract sync, imports, file splitting, deriving types with `Omit`/`Pick` instead of duplicate sibling types).
- Coding pattern: [General code preferences](./coding-patterns/general-code-preferences.md)

##### Lint

- When to Use: Whenever you configure ESLint or write code that must pass it — no comments, no abbreviated names, unused values, and the abbreviation denylist.
- Coding pattern: [Lint](./coding-patterns/lint.md)

#### Frontend Patterns

##### Front-end Code Preferences

- When to Use: Whenever you write or refactor `project-mobile` or web app code and want the preferences captured from review corrections (file naming, `states/`/`stores/`/`contexts/` in pages and feature groups, page `utils/`, class-name placement, component/store organization, api-client naming, state, props).
- Coding pattern: [Front-end code preferences](./coding-patterns/frontend/frontend-code-preferences.md)

##### React Component Patterns

- When to Use: Whenever you create or update React components — `ui/`, `forms/`, `common/` and page components, size and prop limits, helpers outside the component file (single-use class names excepted), `useDialogs`/`useDialogsAtom`, and object-state components.
- Coding pattern: [React component patterns](./coding-patterns/frontend/react-components.md)

##### React Single Responsibility

- When to Use: Whenever a store, hook, or component takes on more than one responsibility and should be split and composed.
- Coding pattern: [React single responsibility](./coding-patterns/frontend/react-single-responsibility.md)

##### React Form Patterns

- When to Use: Whenever you create or change a form or a form field in a web app — react-hook-form with zod, `FormProvider` and `useFormContext` fields, `defaultValues`/`onSubmit` props only, and `layout/utils/form-errors.ts` for API errors.
- Coding pattern: [React form patterns](./coding-patterns/frontend/react-forms.md)

##### Minimum Props Strategies

- When to Use: Whenever you create many components that may share states or actions, or choose where state lives — the "who holds what" table (TanStack Query, zustand `{ state, actions }` with narrow selectors, jotai in `states/{topic}-state.ts`, `useDialogs`, RHF, `useState`).
- Coding pattern: [Minimum props strategies](./coding-patterns/frontend/minimum-props-strategies.md)

##### API Data Hooks

- When to Use: Whenever you consume the backend API in `project-mobile` — the `{ state, actions }` return shape of the generic hooks, the thin per-domain `use{Domain}{Action}Data` wrappers, and the `enabled` gate.
- Coding pattern: [API data hooks](./coding-patterns/frontend/api-data-hooks.md)

##### Component Variant Maps

- When to Use: Whenever a component resolves a variant prop to classes or sub-components — a `Record<Variant, ...>` map (in the component file, or in a shared `{component}-class-names.ts` when several web files use it; at module level in `project-mobile`) merged with `cn()`.
- Coding pattern: [Component variant maps](./coding-patterns/frontend/component-variant-maps.md)

##### Frontend E2E Testing

- When to Use: Whenever you write or change Playwright specs for a web app — per-spec isolated data, API sign-in, `page.route` mocks for external services, production build, and waiting on state instead of sleeping.
- Coding pattern: [Frontend E2E testing](./coding-patterns/frontend/frontend-e2e-testing.md)

#### Mobile Patterns

##### Mobile Icon Colors

- When to Use: Whenever you render an icon (`lucide-react-native` / `react-native-svg`) in `project-mobile` — NativeWind `text-*`/`size-*` classNames do not propagate to icons, so pass explicit `color`/`size` props sourced from the shared `@/layout/utils/colors` theme-hex module.
- Coding pattern: [Mobile icon colors](./coding-patterns/mobile/mobile-icon-colors.md)

##### Keyboard-Aware Absolute Footer

- When to Use: Whenever you have an absolutely-positioned input footer in `project-mobile` that must lift above the keyboard — track keyboard height with a `Keyboard` hook instead of `KeyboardAvoidingView`, subtract the safe-area bottom inset, and apply the offset to both the footer and the scroll content inset.
- Coding pattern: [Keyboard-aware absolute footer](./coding-patterns/mobile/keyboard-aware-absolute-footer.md)

##### Mobile Bottom Sheet Overlay

- When to Use: Whenever you build a slide-up bottom sheet in `project-mobile` — a single reusable transparent `Modal` + Reanimated `withTiming` overlay with a dimmed `bg-inverse-surface/30` scrim and tap-to-dismiss, rather than duplicated inline absolute blocks.
- Coding pattern: [Mobile bottom sheet overlay](./coding-patterns/mobile/mobile-bottom-sheet-overlay.md)

#### Backend Patterns

##### Back-end Code Preferences

- When to Use: Whenever you write or refactor `project-backend` code and want the preferences captured from review corrections (domain folder boundaries, use-case responsibility, ownership queries, contracts, presenter typing).
- Coding pattern: [Back-end code preferences](./coding-patterns/backend/backend-code-preferences.md)

##### Use Case Structure

- When to Use: Whenever you create or refactor a use case class and want `execute` to read as a clear summary of smaller, well-named private steps (guards, branch resolvers, build/apply methods), or when deciding whether a step stays `private` versus a pure sibling file in the use-case folder.
- Coding pattern: [Use case structure](./coding-patterns/backend/use-case-structure.md)

##### Service Class Structure

- When to Use: Whenever you write an infrastructure class that implements an adapter port (hasher, crypto, token generator, AI client) — config and collaborators through the constructor, `private readonly` members, and the provider SDK (AI SDK with OpenRouter) instead of hand-written HTTP.
- Coding pattern: [Service class structure](./coding-patterns/backend/service-class-structure.md)

##### Use Case Response Structure

- When to Use: Whenever you type the `Response` of a use case. Use the shared types instead of inline shapes: `ItemResponse<T>` (`{ item }`) and `ListingResponse<T>` (`{ items }`) from `@/modules/domain/responses`, and `CursorPaginationResponse<T>` (`{ items, hasMore, nextCursor }`) and `PaginationResponse<T>` (`{ items, totalItems, page }`) from `@/modules/domain/repository/repository`.
- Coding pattern: [Use case response structure](./coding-patterns/backend/use-case-response-structure.md)

##### Domain Entity Declaration

- When to Use: Whenever you add or refactor a domain entity in `project-backend` — extending `Entity`/`AggregateRoot<Props>`, typing the `{Entity}Props` (including structured array/object props that persist as a JSON column in the mapper), and exposing the `create`/`reference` static factories with `ID`-typed fields.
- Coding pattern: [Domain entity declaration](./coding-patterns/backend/domain-entity-declaration.md)

##### HTTP Route Handler

- When to Use: Whenever you write or refactor a route handler in the HTTP infrastructure workspace — module-level schemas (the only place for HTTP request shape: required, length, format, request enum), use-case instantiation, and a thin parse → execute → present flow with `next(err)`.
- Coding pattern: [HTTP route handler](./coding-patterns/backend/http-route-handler.md)

##### HTTP Presenter

- When to Use: Whenever you map a domain entity to an HTTP response — a stateless presenter class with static `toHttp`/`toListItemHttp` methods typed from the entity props via `Serialize`/`WithID`.
- Coding pattern: [HTTP presenter](./coding-patterns/backend/http-presenter.md)

##### DB Mapper

- When to Use: Whenever you write or refactor a persistence mapper — a stateless `{Entity}Mapper` with `toPersistence`/`toDomain`, a record type derived from the entity props, conversion rules for ids, dates, enums and JSON fields, and join includes.
- Coding pattern: [DB mapper](./coding-patterns/backend/db-mapper.md)

##### DB Repository

- When to Use: Whenever you write or refactor a persistence repository — the three-member subclass of the generic base, hooks, constructor-injected client, ORM API over raw SQL, errors from the base, atomic multi-step writes, migrations, and the per-repo integration test.
- Coding pattern: [DB repository](./coding-patterns/backend/db-repository.md)

##### Backend E2E Testing

- When to Use: Whenever you create or change backend E2E suites that start the real HTTP server on a free port over a throwaway database — location, separate config, server helper, API client, per-route status assertions, and faked external adapters.
- Coding pattern: [Backend E2E testing](./coding-patterns/backend/backend-e2e-testing.md)

##### Domain Integration Testing

- When to Use: Whenever you write integration suites that chain real use cases over shared in-memory repositories to prove a domain's flows — location, separate unit/integration configs, repository wiring, reset, and assertions through read use cases.
- Coding pattern: [Domain integration testing](./coding-patterns/backend/domain-integration-testing.md)
