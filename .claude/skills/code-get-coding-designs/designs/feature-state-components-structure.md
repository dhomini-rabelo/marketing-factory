# Feature State Components Structure

How a `project-mobile` feature that fetches data composes its UI states. A feature splits into a **container** that owns data and orchestration, a set of **status components** for the non-data states, and a **presentational** component for the data itself. **All file and folder names use kebab-case**; only exported component identifiers stay PascalCase.

## Folder layout

```
{feature}/
├── {feature}-view.tsx       # container: fetches data, orchestrates which state renders
├── {feature}-list.tsx       # presentational: renders the loaded data
├── {feature}-loading.tsx    # loading state (skeleton)
├── {feature}-error.tsx      # error state (message + retry)
└── {feature}-empty.tsx      # empty state (title + description)
```

A detail feature uses the same shape with a `-gone.tsx` (not-found) state instead of `-empty.tsx`, and a `-content.tsx` as the presentational part.

## The container view

The `{feature}-view.tsx` container calls the data hook, derives the state, and renders exactly one branch. It owns no presentation beyond the shell; each state is delegated to its own stateless component. The branch order is fixed: **loading → error/gone → empty → data → null**.

```tsx
export function MenuNotesView() {
  const { actions, state } = useNoteListData()
  const notes = state.data?.items ?? []

  return (
    <MenuListShell title="Notes">
      {state.isLoading ? (
        <MenuListLoading />
      ) : state.isError ? (
        <MenuListError onRetry={() => actions.refetch()} />
      ) : notes.length === 0 ? (
        <MenuListEmpty title="no notes yet" description="..." />
      ) : (
        <MenuNotesList notes={notes} onSelect={handleSelect} />
      )}
    </MenuListShell>
  )
}
```

## Status components

Each status component (`loading`, `error`, `empty`, `gone`) is a pure, stateless function in its own file. It receives only what it renders (a message, an `onRetry` callback) and never fetches data. This keeps the non-data states reusable and the container readable as a single state machine.

## Presentational component

The `{feature}-list.tsx` (or `{feature}-content.tsx`) receives the already-loaded data plus minimal callbacks (e.g. `onSelect`) and renders it. It performs no fetching and no loading/error handling — those belong to the container.

## Web sections

A web page section follows the same branch order (**loading > error/gone > empty > data**) with these differences:

- The folder is `pages/{page}/components/{section}/`, the container is `{section}.tsx`, and the UI-state components are `{section}-loading.tsx`, `{section}-error.tsx` and `{section}-empty.tsx` (`-gone.tsx` for a detail section). The page's `states/` folder holds jotai atoms, not UI-state components.
- The container takes no props whenever possible: it calls its own `use-{subject}-data` hook (TanStack Query deduplicates through the cache) and renders exactly one branch with early returns.
- A UI-state component takes no `onRetry` prop; when it offers retry it reads the refetch action from the data hook.
- `{section}-item.tsx` receives an id or the entity (one prop) and reads actions from the store, hook, or atom.

```tsx
export function NoteList() {
  const { state } = useNotesData()
  const notes = state.data ?? []

  if (state.isPending) return <NoteListLoading />
  if (state.isError) return <NoteListError />
  if (notes.length === 0) return <NoteListEmpty />

  return (
    <ul>
      {notes.map((note) => (
        <NoteListItem key={note.id} note={note} />
      ))}
    </ul>
  )
}
```

Choose the holder by the kind of state and read it where it is used. Web apps use jotai for transient page UI state (the web rule that replaces the mobile preference below):

| Kind of state | Holder | Where |
|---|---|---|
| Server data | TanStack Query via `layout/hooks/api/use-{subject}-data.ts` (`{ state, actions }`) | the component that needs it calls the hook; `data` is not passed down |
| Global or client-domain state | zustand store | `layout/stores/{concern}-store.ts`, `{ state, actions }`, narrow selector |
| Transient page UI state (open dialog, item being edited, local filter shared between siblings) | jotai atom | `states/{page}-state.ts` or `states/{topic}-state.ts`, see [feature folder structure](./feature-folder-structure.md#states) |
| Dialogs | `useDialogs` (local) or `useDialogsAtom(atom)` (shared) | `layout/hooks/use-dialogs.ts` |
| Form | react-hook-form + zod | the form folder, see [form structure](./form-structure.md) |
| One component's private state | one `useState` with a typed object | the component, only when nobody else reads it |

See [zustand stores structure](./zustand-stores-structure.md) and [minimum props strategies](../../code-write-code/coding-patterns/frontend/minimum-props-strategies.md).

## State ownership (`project-mobile`)

A feature's structured state lives in a **zustand** store, and the feature's components read it directly instead of receiving it through prop-drilling.

- Use **zustand** for complex/structured feature state and its actions.
- Reserve **jotai** for simple shared primitives between components (e.g. a shared input string) where a full store would be overkill.
- Do not add a new state library without confirming it is necessary.
- Child components of a feature consume the store directly; only genuinely local or parent-owned values are passed as props.

```tsx
// Wrong way — parent reads the store and drills many props down
export function ChatRoot() {
  const recordingState = useChatStore((s) => s.recordingState);
  const draft = useChatStore((s) => s.draft);
  return <ChatInput recordingState={recordingState} draft={draft} />;
}

// Correct way — the child reads the store directly
export function ChatInput() {
  const draft = useChatStore((s) => s.draft);
  const recordingState = useChatStore((s) => s.recordingState);
  return <input value={draft} disabled={recordingState.isActive} />;
}
```
