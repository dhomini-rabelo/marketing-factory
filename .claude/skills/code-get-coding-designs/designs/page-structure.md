# Page Structure

## File layout

Each page lives in its own folder under `src/pages/` and follows this structure. **All file and folder names use kebab-case**; only the exported React component identifiers stay PascalCase.

```
{page-name}/
├── page.tsx
├── components/
│   ├── {unique-component}.tsx
│   ├── {section}/
│   │   ├── {section}.tsx
│   │   ├── {section}-loading.tsx
│   │   ├── {section}-empty.tsx
│   │   ├── {section}-error.tsx
│   │   └── {section}-item.tsx
│   └── {form-name}-form/
│       ├── {form-name}-form.tsx
│       ├── {form-name}-form-schema.ts
│       └── {field-name}-field.tsx
├── contexts/
│   └── {subject}-context.ts
├── states/
│   └── {page-name}-state.ts
├── stores/
│   └── {concern}-store.ts
├── hooks/
│   └── use-{subject}.ts
└── utils/
    └── {topic}.ts
```

A folder exists only when it holds a file. There is no `__shared__/` folder inside a page. In a web app, which folder each file goes to is decided in [feature folder structure](./feature-folder-structure.md):

- UI-state components (loading, empty, error) live next to their section in `components/{section}/`.
- Transient UI state (open dialog, item being edited, shared local filter) is a jotai atom in `states/{page-name}-state.ts`, or in `states/{topic}-state.ts` once the page has more than 3 atoms.
- A React context and its hook live in `contexts/{subject}-context.ts`.
- A zustand store read only by this page lives in `stores/{concern}-store.ts`; a store read outside the page lives in `layout/stores/`. See [zustand stores structure](./zustand-stores-structure.md).

`project-mobile` pages also use `states/` for jotai atoms and `stores/` for the page's zustand stores, with the root-store and reset rules of [page stores structure](./page-stores-structure.md).

## page.tsx

`page.tsx` only composes: layout elements and page sections. It holds no domain `useState`, no long handlers, and no helpers or constants.

```tsx
import { EventActiveList } from '@/pages/events/components/event-active-list/event-active-list'
import { EventTaskList } from '@/pages/events/components/event-task-list/event-task-list'

export function EventsPage() {
  return (
    <Page>
      <EventActiveList />
      <EventTaskList />
    </Page>
  )
}
```

A page that owns jotai atoms wraps its composition in jotai's `Provider`, so the atoms start fresh on every visit instead of living in the default store and surviving navigation:

```tsx
import { Provider } from 'jotai'

export function EventsPage() {
  return (
    <Provider>
      <Page>
        <EventActiveList />
        <EventTaskList />
      </Page>
    </Provider>
  )
}
```

## components/

One component per file.

- **Small unique component** — a single file: `components/{unique-component}.tsx`
- **Section or feature with parts** — a folder: `components/{section}/{section}.tsx`, with sub-components next to it (`{section}-item.tsx`) and nested folders for medium/big sub-components.
- **Section container** — `{section}.tsx` reads its own hook, store or atom and decides `loading > error > empty > content`. Each UI-state is its own file (`{section}-loading.tsx`, `{section}-empty.tsx`, `{section}-error.tsx`). See [feature state components structure](./feature-state-components-structure.md).
- **Domain form exclusive to the page** — `components/{form-name}-form/`, same shape as the shared forms in [form structure](./form-structure.md).

Sections and list items take as few props as possible: an item receives its id or entity and reads actions from the store, hook or atom. Limits are in [react components](../../code-write-code/coding-patterns/frontend/react-components.md).

## hooks/

Custom hooks scoped to the page. File names are kebab-case (`use-run-query.ts`), identifiers camelCase (`useRunQuery`). Hooks return `{ state, actions }`. A complex page has one orchestrating hook that composes smaller hooks, each owning one concern (see [React single responsibility](../../code-write-code/coding-patterns/frontend/react-single-responsibility.md)).

## utils/

Pure functions, constants and shared types of the page (formatters, parsers, option lists), one subject per file: `utils/{topic}.ts`. Never declare them above the component in a component file. When two pages need the same function, move it to `layout/utils/`. In a web app, class names do not go to `utils/`: a class string or variant map used by one component sits in that `.tsx`, and one shared by several components sits in a `{component}-class-names.ts` next to them (see [class names](./feature-folder-structure.md#class-names)).
