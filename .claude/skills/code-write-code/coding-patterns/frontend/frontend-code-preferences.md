# Front-end Code Preferences

Preferences for `project-mobile`, captured from review corrections. They complement the focused front-end patterns; when a rule here overlaps a dedicated pattern, the dedicated pattern still applies for its own topic. See also the [general](../general-code-preferences.md) and [back-end](../backend/backend-code-preferences.md) preferences.

## File names are kebab-case

```
// Wrong way
useChatMessages.ts
MenuSidebar.tsx

// Correct way
use-chat-messages.ts
menu-sidebar.tsx
```

## Prefer `*-root` over `*-shell` for top-level wrappers

```tsx
// Wrong way
export function TaskWorkspaceShell() { ... }

// Correct way
export function TaskWorkspaceRoot() { ... }
```

## Shared components live in `layout/components`

When two or more pages share the same component (backed by shared stores/hooks), move it to `src/layout/components` instead of duplicating a per-page `{component}-design` variant in each page. In web apps, shared forms and form fields go to `src/layout/components/forms/` (see [React form patterns](./react-forms.md)); primitives with no form behavior stay in `layout/components/ui/`. A web app has no `__shared__` folder.

## `states/`, `stores/` and `contexts/` in pages and feature groups

In web apps, UI-state components (`{section}-loading.tsx`, `-empty.tsx`, `-error.tsx`) live in the section folder under `components/`. Jotai atoms live in `states/{page}-state.ts` or `states/{topic}-state.ts`, 1 to 3 per file. A React context and its hook live in `contexts/{subject}-context.ts`. Zustand stores live in `layout/stores/{concern}-store.ts` (or `pages/{page}/stores/` when only that page reads them) and expose `{ state, actions }`, read through a narrow selector (`useXStore((store) => store.state.value)`). Full placement rules: [feature folder structure](../../../code-get-coding-designs/designs/feature-folder-structure.md). `project-mobile` pages also keep `states/` and `stores/` (see [page structure](../../../code-get-coding-designs/designs/page-structure.md)).

## Page helpers and constants go to `{page}/utils`

In web apps, pure functions, constants, and shared types of a page live in `{page}/utils/{topic}.ts`, not above the component in its file. Shared ones go to `layout/utils/`.

## Class names live with their consumers

In web apps, a class string, variant map or className function used by one component is declared in that `.tsx`, after the imports, without `export`. One used by several files goes to `{component}-class-names.ts` in the nearest folder holding all of them; a page-only one stays inside the page. `-class-names.ts` is the only suffix, and class names never go to `utils/`. See [class names](../../../code-get-coding-designs/designs/feature-folder-structure.md#class-names).

## Keep components small and props few

At most 80 lines per component file, 2 to 3 props, and never more than 5 on any component, `ui/` primitives included. Reach for a hook, atom, store selector, or form context before adding a prop. See [minimum props strategies](./minimum-props-strategies.md) and [React component patterns](./react-components.md).

## API-call function names signal the network call

Files that only wrap API-route calls live in the api-client location, and their functions carry a marker that makes the network call explicit instead of a generic verb.

```typescript
// Wrong way — reads like a plain in-memory helper
listActiveTasks()

// Correct way — name signals an API request
fetchActiveTasksRequest()
```

## `api/models` holds only models; DTOs go to `api/responses`

Keep model files limited to the model definition; move response/payload shapes to a dedicated `api/responses` folder.

## Declare routes via the `routes.ts` pattern

Do not introduce ad-hoc path builders (`buildTaskWorkspacePath`); declare routes following the established `api/routes.ts` pattern.

## Do not over-split a small store

When a store folder would hold only two files, keep it in a single file; do not create separate `index.ts` + `types.ts` until size justifies the split. Avoid duplicated exports.

## Lazy-load list data on interaction

Do not eagerly load list data (notes, reminders, tasks) at a container root; defer loading to the inner component that actually needs it, triggered by user interaction.

## Use `useAtom` when reading and writing the same atom

```tsx
// Wrong way
const draft = useAtomValue(draftAtom)
const setDraft = useSetAtom(draftAtom)

// Correct way
const [draft, setDraft] = useAtom(draftAtom)
```

## Collapse multiple boolean props into one state param

```tsx
// Wrong way
<Card isLoading isSelected isDisabled />

// Correct way
<Card state={cardState} />
```

## Identifiers, route params and search params use full names

Name variables, lambda parameters, route params and URL search params in full (`workspace`, `event`, `error`, `:connectionId`, `?savedQueryId=`). When renaming a param, update every link that builds it and every `searchParams.get` that reads it. Lint enforces this (see [lint](../lint.md)).

## No comments

Names carry the intent; extract a well-named function or variable instead of writing a comment.

## One subject per file

One component, hook or util subject per file, with kebab-case file names; group related files in a folder.
