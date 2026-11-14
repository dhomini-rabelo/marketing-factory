# Zustand Stores Structure

How a web app organizes global and domain client state. Zustand stores live in `layout/stores/`; a store read by a single page lives in `pages/{page}/stores/` until another page or the layout reads it. (`project-mobile` page stores follow [page stores structure](./page-stores-structure.md).) Transient page UI state is not a store: it is a jotai atom in the page's `states/` folder (see [feature folder structure](./feature-folder-structure.md) and [minimum props strategies](../../code-write-code/coding-patterns/frontend/minimum-props-strategies.md)). **All file and folder names use kebab-case**.

## Folder layout

```
layout/stores/
├── {concern-a}-store.ts
├── {concern-b}-store.ts
└── {complex-concern}-store/
    ├── {complex-concern}-store.ts
    ├── {complex-concern}-store-types.ts
    └── {operation}.ts
```

A store that a page needs but that is also read outside the page (for example by the command bar) is a global store: it lives here, not in the page folder. A store read only by one page uses the same file layout under `pages/{page}/stores/`.

## Contract: `{ state, actions }` and a narrow selector

Every store exposes `state` and `actions` as two sub-objects. Components subscribe through a selector that returns one slice, never the whole store.

```ts
interface ThemeStore {
  state: { theme: 'dark' | 'light' }
  actions: { setTheme: (theme: 'dark' | 'light') => void }
}

export const useThemeStore = create<ThemeStore>((set) => ({
  state: { theme: 'dark' },
  actions: {
    setTheme: (theme) => set((store) => ({ state: { ...store.state, theme } })),
  },
}))
```

```tsx
const theme = useThemeStore((store) => store.state.theme)
const { setTheme } = useThemeStore((store) => store.actions)
```

## Callbacks registered by a component live in `state.commands`

`actions` are the store's own setters. A function that one component registers on mount and other components call (run, save, focus of an editor) is data the store holds, so it goes under `state.commands`, is set to `null` on unmount, and is called optionally.

```ts
interface EditorStore {
  state: { commands: { run: () => void; save: () => void } | null }
  actions: { setCommands: (commands: EditorStore['state']['commands']) => void }
}
```

```tsx
const commands = useEditorStore((store) => store.state.commands)
commands?.run()
```

## One store per concern

Split independent slices into one store per concern (theme, toasts, command bar, current workspace, editor) instead of one large store. Components subscribe only to the store they need.

## Reset coordination

When several stores must clear together, keep each store a leaf (it imports no sibling) and put the coordination in a standalone `reset-{scope}.ts` module that imports them all and calls `getState().actions.reset()` on each. The dependency direction stays one-way, so the stores stay acyclic.

```ts
export function resetEditorScope() {
  useEditorStore.getState().actions.reset()
  useResultsStore.getState().actions.reset()
}
```

## Split a large store into a folder

When one store accumulates async side effects and data builders, promote it to a folder. The store file creates the store and keeps action bodies thin; the types file holds the store interface and helper types; each remaining concern (dispatch, builders) moves to its own file and receives `set`/`get` as parameters. Keep a store in a single file until it is large enough to justify the split.
