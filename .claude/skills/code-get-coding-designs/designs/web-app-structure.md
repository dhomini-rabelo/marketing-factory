# Web app structure

How a web app workspace (`packages/infra/{web-app}`) organizes `src/`. **All file and folder names use kebab-case**; only exported identifiers follow their own casing.

```
src/
  core/          main.tsx, routes, global.css (Tailwind import and @theme tokens)
  api/           client.ts, routes.ts, query-keys.ts, models/{entity}.ts, requests/{feature}.ts
  layout/
    components/
      ui/        primitives without business rules and without forms ({component}.tsx, one per file); a multi-file primitive is a folder ({primitive}/)
      forms/     everything form-related that is shared: field primitives, RHF-bound fields, shared domain forms
      common/    {layout-piece}.tsx (page shell, page head, section, card grid, auth shell)
      {group}/   app shell, command bar: entries at the root, plus components/, contexts/, states/, hooks/, utils/
    hooks/       use-dialogs.ts, use-api-request.ts, use-api-mutation.ts, use-debounced-value.ts, api/use-{subject}-data.ts
    stores/      zustand global stores, {concern}-store.ts
    utils/       styles.ts (cn), form-errors.ts, one subject per file ({subject}.ts, format/format-{x}.ts)
  pages/{page}/  page.tsx, components/, contexts/, states/, stores/, hooks/, utils/
```

## Core and utils stay flat files

- `core/` holds app bootstrap (entry, router, `global.css`) as plain files, no subfolders.
- `layout/utils/` has one subject per file; `layout/hooks/` has one hook per file.

## Layout and components use subfolders

- Components are grouped into folders by role (`ui`, `forms`, `common`, `{group}`), one component per file.
- Anything shared between pages goes to `layout/components/`; shared forms and fields go to `layout/components/forms/` (see [Form structure](./form-structure.md)). A page has no `__shared__/` folder. Inside a page or a feature group, contexts go to `contexts/`, jotai atoms to `states/` (1 to 3 per file), and a store read only by that page to `stores/`; a store read outside its page lives in `layout/stores/`. See [Feature folder structure](./feature-folder-structure.md) and [Zustand stores structure](./zustand-stores-structure.md).
- A `{page}/utils/` folder holds the page's pure functions, constants and shared types, one subject per file; they never sit above the component in its file.
- Repeated layout shapes live in `layout/components/common/`, not copied class strings. A class string or variant map used by one component stays in that `.tsx` after the imports; one used by several files goes to `{component}-class-names.ts` in the nearest folder holding them (see [class names](./feature-folder-structure.md#class-names)).

## Pages export by name and load lazily

- `page.tsx` has a named export `{Name}Page` (no default export) and only composes; unrelated components go to the page's `components/`.
- The router loads each page with `lazy`:

```tsx
const {Name}Page = lazy(() =>
  import('@/pages/{page}/page').then((module) => ({ default: module.{Name}Page })),
)
```

See [Page structure](./page-structure.md) for the inside of a page and [Feature state components structure](./feature-state-components-structure.md) for which tool holds which state.

## Styling lives in Tailwind tokens

- Style with Tailwind utility classes in the component; no CSS Modules.
- Colors, type scale, radii, shadows, spacing and animations are `@theme` tokens in `core/global.css`; add a missing token there instead of hardcoding a value. See [React component patterns](../../code-write-code/coding-patterns/frontend/react-components.md).

## Renaming rules

- No abbreviations in identifiers, lambda parameters or route params (`workspace`, `event`, `error`, `:{entity}Id`); no comments, names carry the intent.
- URL search params use the same full names as identifiers (`?{entity}Id=`). When renaming a param, update every link that builds it and every `searchParams.get` that reads it.
