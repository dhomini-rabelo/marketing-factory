---
name: code-get-coding-designs
description: Consult project structures and architectural conventions for organizing files, folders, layers, and modules. Use primarily during planning of features or refactors, and during implementation when a structural decision needs clarification.
---

# Coding Designs

Coding designs describe project structure: file organization, module composition, and boundaries between layers. Use the relevant designs when planning where code belongs and how its parts fit together. Revisit them during implementation when the structure changes or needs clarification.

Read only the design files relevant to the task. For code-level practices and conventions that also inform planning, consult [code-write-code](../code-write-code/SKILL.md).

For new projects, start with [Monorepo structure](./designs/monorepo-structure.md): domain modules live under `packages/domain/`, and implementation packages, web apps, and mobile apps live under `packages/infra/`. Apply it together with the smaller designs for each package's internal organization.

Some references were imported from projects with `project-mobile` and `project-backend` components. Translate those names and technology-specific paths to the monorepo's owning workspaces; do not generate separate root apps from the examples. In existing projects, verify the adopted architecture before changing it; reading this skill does not authorize a migration. Do not introduce a framework solely to match an example.

## Designs

- **Monorepo Structure**:
  - Purpose: Define domain modules, adapter contracts, infrastructure workspaces, and the placement of web and mobile apps in projects started from the factory.
  - When to Use: During project initialization and when locating new features or changing package boundaries.
  - Coding structures: [Monorepo structure](./designs/monorepo-structure.md)

- **Web App Structure**:
  - Purpose: Define how a web app's `src/` is organized — flat `core/` and `utils/` files, `layout/components/{ui,forms,common}` subfolders, `layout/stores`, per-page and per-group `components/contexts/states/stores/hooks/utils`, pages with named exports loaded through `lazy`, Tailwind tokens in `global.css`, and renaming rules for identifiers and URL params.
  - When to Use: Use when creating a web app, adding files to `layout/`, `api/` or `pages/`, or renaming identifiers and route/search params.
  - Coding structures: [Web app structure](./designs/web-app-structure.md)

- **Page Structure Patterns**:
  - Purpose: Define the page-level file organization and composition pattern for frontend pages, including `page.tsx`, section folders with UI-state components, the jotai `Provider`, `contexts/`, `states/`, `stores/`, hooks, and `utils/`, for web and `project-mobile` pages.
  - When to Use: Use when creating or refactoring frontend pages to keep folder hierarchy and component boundaries consistent.
  - Coding structures: [Page structure](./designs/page-structure.md)

- **Feature Folder Structure**:
  - Purpose: Define which folder each file of a web page or feature group (`layout/components/{group}/`) goes to — entries-only group root, `contexts/`, `states/` with 1 to 3 atoms per file, page-only `stores/`, `utils/` for shared types and data, per-consumer class-name placement with the `-class-names.ts` suffix, and folders for multi-file `ui/` primitives.
  - When to Use: Use when creating, moving or splitting a component, context, atom, store, type or class-name constant in a web app.
  - Coding structures: [Feature folder structure](./designs/feature-folder-structure.md)

- **Form Structure**:
  - Purpose: Define how a web app organizes forms — react-hook-form with zod, `layout/components/forms/`, fields that read the form through `useFormContext`, and the shared API-error mapper.
  - When to Use: Use when creating or refactoring a form or form field in a web app.
  - Coding structures: [Form structure](./designs/form-structure.md)

- **Zustand Stores Structure**:
  - Purpose: Define how a web app organizes global and domain client state — stores in `layout/stores/` (and a single-page store in `pages/{page}/stores/`), the `{ state, actions }` contract with narrow selectors, `state.commands`, reset coordination, and splitting a large store into a folder.
  - When to Use: Use when adding or refactoring a global or domain store in a web app.
  - Coding structures: [Zustand stores structure](./designs/zustand-stores-structure.md)

- **Backend Domain Structure**:
  - Purpose: Define the entities, repository ports, use cases, utilities, and validation inside each `packages/domain/<module>` workspace.
  - When to Use: Use when creating or refactoring backend domain code.
  - Coding structures: [Backend domain structure](./designs/backend-domain-structure.md)

- **Domain Ownership**:
  - Purpose: Define the owner/consumer relationship between feature domain modules — identity plus the owner's public contract, never shared entity classes or copied owner object data.
  - When to Use: Use when one domain needs a concept owned by another (fields, imports, authorization), or when deciding whether a type belongs in `domain/base`.
  - Coding structures: [Domain ownership](./designs/domain-ownership.md)

- **Service Structure**:
  - Purpose: Define how a large infrastructure service file is split into a folder — `index.ts` holds the service class and shared setup, one subfolder per operation groups that operation's schemas, prompts, and tools, and shared helpers live at the folder root.
  - When to Use: Use when an infrastructure service file grows large and bundles a class together with its schemas, prompt builders, tools, or client setup, and you want to break it into a folder without changing its import path.
  - Coding structures: [Service structure](./designs/service-structure.md)

- **Backend Adapters and Services Structure**:
  - Purpose: Define external-service ports in `packages/adapters`, repository ports within domain modules, and concrete implementations in infrastructure workspaces.
  - When to Use: Use when adding or refactoring an external integration or a repository, so the domain depends on the port and the implementation can be swapped.
  - Coding structures: [Backend adapters and services structure](./designs/backend-adapters-and-services-structure.md)

- **Backend HTTP Layer Structure**:
  - Purpose: Define the HTTP infrastructure workspace — one route handler per file under `routes/{feature}/`, centralized dependency composition, one presenter per entity, and route registration plus the error handler in `app.ts`.
  - When to Use: Use when adding or refactoring a backend HTTP endpoint, presenter, or route registration.
  - Coding structures: [Backend http layer structure](./designs/backend-http-layer-structure.md)

- **API Client Structure**:
  - Purpose: Define how `project-mobile`'s `src/api/` layer is organized — axios clients and interceptors in `client.ts`, the `API_ROUTES` map, per-feature `request{Action}` functions, entity `models/` vs list-item `responses/`, and envelope `types.ts`.
  - When to Use: Use when adding or refactoring a backend API call, route, request function, or response/model contract in `project-mobile`.
  - Coding structures: [Api client structure](./designs/api-client-structure.md)

- **Page Stores Structure**:
  - Purpose: Define how a `project-mobile` page organizes its Zustand state — one store per concern, a root store that coordinates `reset()`, and splitting a large store into a folder.
  - When to Use: Use when a page needs more than a single store, or when a store grows enough to split its async logic and builders into a folder.
  - Coding structures: [Page stores structure](./designs/page-stores-structure.md)

- **Feature State Components Structure**:
  - Purpose: Define how a data-fetching feature splits into a container view, per-state status components (loading/error/empty/gone), and a presentational component, with a fixed render order; includes the web section variant and the state-holder table.
  - When to Use: Use when building or refactoring a feature that fetches data and must render loading, error, empty, and loaded states consistently.
  - Coding structures: [Feature state components structure](./designs/feature-state-components-structure.md)

- **Mobile Services Layer Structure**:
  - Purpose: Define how `project-mobile` isolates native SDK integrations behind `src/services/` — one `{capability}-service.ts` module is the sole importer of a native SDK and exposes intent-named functions that screens, stores, and bootstrap call.
  - When to Use: Use when adding or refactoring a native platform integration (notifications, location, camera, …) in `project-mobile`, so the SDK stays behind a single swappable boundary.
  - Coding structures: [Mobile services layer structure](./designs/mobile-services-layer-structure.md)

- **Mobile Token Persistence Structure**:
  - Purpose: Define how `project-mobile` splits auth persistence in `src/storage/` — SecureStore holds the JWT + provider token with an in-memory synchronous cache so the sync axios interceptor can read a token, while AsyncStorage holds the user profile.
  - When to Use: Use when adding or refactoring token/auth persistence in `project-mobile`, or whenever a synchronous caller needs a value from an async-only native store.
  - Coding structures: [Mobile token persistence structure](./designs/mobile-token-persistence-structure.md)
