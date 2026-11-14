# Minimum Props Strategies

Strategies used in this project to keep component interfaces lean, avoid prop drilling, and improve local component ownership.

## Who holds what

Pick the holder by the kind of state, then read it where it is used instead of passing it down.

| Kind of state | Holder | Where |
|---|---|---|
| Server data | TanStack Query via `use-{subject}-data.ts` (`{ state, actions }`) | the consuming component calls the hook; the cache deduplicates; do not pass `data` as props |
| Global or client-domain (theme, toasts, command bar, current workspace, editor) | zustand store | `layout/stores/{concern}-store.ts`, `{ state, actions }`, narrow selector |
| Transient page UI (open dialog, item being edited or selected, local filter shared by siblings) | jotai `atom` | `states/{page}-state.ts` or `states/{topic}-state.ts` in the page |
| Dialogs | `useDialogs` / `useDialogsAtom` | `layout/hooks/use-dialogs.ts` |
| Form | react-hook-form + zod, `FormProvider` | the form folder; fields use `useFormContext` |
| One component's private state | one `useState` with a typed object | the component, only when nobody else reads it |

## 1 Zustand stores with `{ state, actions }` and narrow selectors

Every store exposes `state` and `actions`. Components select one slice, never the whole store, so they re-render only when that slice changes.

```tsx
const workspace = useWorkspaceStore((store) => store.state.workspace)
const { setWorkspace } = useWorkspaceStore((store) => store.actions)

// Wrong way — subscribes to the whole store
const { state, actions } = useWorkspaceStore()
```

In web apps, stores are global or domain state and live in `layout/stores/{concern}-store.ts`; a store read by a single page lives in `pages/{page}/stores/` until another page or the layout reads it; `project-mobile` page-level stores follow [page stores structure](../../../code-get-coding-designs/designs/page-stores-structure.md). See [zustand stores structure](../../../code-get-coding-designs/designs/zustand-stores-structure.md).

## 2 Jotai atoms for shared UI state

Use jotai for transient, feature-scoped UI state shared by sibling components (editing item, selected row, active dialog, shared filter). It removes the need to lift state into a parent.

```tsx
// states/connections-state.ts
export const editingConnectionIdAtom = atom<string | null>(null)
```

- Put atoms in the page's `states/` folder, 1 to 3 related atoms per file: `states/{page}-state.ts`, or `states/{topic}-state.ts` once the page has more than 3 atoms. The atom's value type lives in the same file. See [feature folder structure](../../../code-get-coding-designs/designs/feature-folder-structure.md#states).
- The page that owns the atoms wraps its composition in jotai `<Provider>` so they reset when the user leaves the page. See [page structure](../../../code-get-coding-designs/designs/page-structure.md).
- Use `useAtom` when a component reads and writes the same atom; `useAtomValue` or `useSetAtom` when it only does one.

```tsx
export function ConnectionRowEditButton({ connectionId }: ConnectionRowEditButtonProps) {
  const setEditingConnectionId = useSetAtom(editingConnectionIdAtom)
  return <Button onClick={() => setEditingConnectionId(connectionId)}>Edit</Button>
}
```

## 3 Dialog state hooks

Encapsulate the dialog lifecycle in `layout/hooks/use-dialogs.ts` so parents pass an intent (a dialog key), not open/close flags and handlers.

```tsx
const { currentActiveDialog, activateDialog, disableDialog } = useDialogs<'create' | 'edit'>()

// states/connection-dialogs-state.ts
export const connectionDialogsAtom = atom<'create' | 'edit' | null>(null)

// in a component
const { currentActiveDialog, disableDialog } = useDialogsAtom(connectionDialogsAtom)
```

Use `useDialogs` when one component owns the dialogs; use `useDialogsAtom` when siblings or children open them.

## 4 Form context instead of form props

Wrap the form in `FormProvider` and let fields read the form API through `useFormContext`. This removes `control`, `formState`, `setValue`, and `watch` from props. See [React form patterns](./react-forms.md).

```tsx
<TextField name="name" label="Name" />
```

## 5 Custom hooks for derived state and local logic

Encapsulate filtering, derivation, and local orchestration in `{page}/hooks/use-{subject}.ts` hooks that return `{ state, actions }`, so parents do not compute and pass derived lists. A complex page has one orchestrating hook composing smaller ones.

```tsx
export function useListingTasks() {
  const tasks = useTasksStore((store) => store.state.tasks);
  const selectedWorkflowId = useWorkflowsStore((store) => store.state.selectedWorkflowId);
  // ...derive listingTasks, activeTasks, completedTasks
  return { state: { tasks, listingTasks, activeTasks, completedTasks }, actions: {} };
}
```

Similarly, hooks like useMultipleSelect and useSelect package state/actions into a coherent local API.

## 6 Granular component decomposition

Split large components into focused sub-components that pull their own data from hooks/context/atoms.
Parents should pass only minimal identity or rendering props.

Examples:
- an add-input component: one or two identity props
- a list item: the entity or its id (one prop), actions read from the store
- an error message component: no props (reads an atom or hook internally)

Targets: at most 80 lines per component file and 2 to 3 props; more than 5 props is not allowed on any component, `ui/` primitives included (see [React component patterns](./react-components.md)).

## 7 Composition with children

Prefer composition over configuration-heavy props when defining layout/content structures.
A configuration-heavy component (one `tone`, `icon`, `action`, `dismissible`, `onDismiss`, `children` API) becomes a set of focused parts the caller composes, passing only what each part needs:

```tsx
<ChatBanner.Root tone="error">
  <ChatBanner.Icon icon={AlertCircle} />
  <ChatBanner.Text>mic glitched — try again or type it</ChatBanner.Text>
  <ChatBanner.Action label="Retry" onClick={retryVoice} />
  <ChatBanner.Dismiss onClick={dismissError} />
</ChatBanner.Root>
```

### File organization

Give each compound component its own folder, one file per part, and expose the namespace from `index.tsx`. Callers keep importing the folder (`.../chat-banner`), so `index.tsx` resolves automatically.

```
chat-banner/
  index.tsx              # builds and exports the ChatBanner namespace object
  chat-banner-root.tsx   # ChatBannerRoot — container, owns shared state
  chat-banner-icon.tsx   # ChatBannerIcon
  chat-banner-text.tsx   # ChatBannerText
  chat-banner-action.tsx # ChatBannerAction
  chat-banner-dismiss.tsx# ChatBannerDismiss
  contexts/
    tone-context.ts      # shared state context + hook consumed by the parts
```

Rules:
- One part per file. The file is named after the part in kebab-case (`chat-banner-action.tsx`), and exports a single named function component (`ChatBannerAction`).
- State shared across parts (here the `tone`) lives in `contexts/{subject}-context.ts` as a React context plus a `use…` hook. `Root` provides it; the other parts consume it instead of receiving it as a prop.
- `index.tsx` only imports the parts and assembles the namespace — it declares no components:

```tsx
import { ChatBannerAction } from "./chat-banner-action";
import { ChatBannerDismiss } from "./chat-banner-dismiss";
import { ChatBannerIcon } from "./chat-banner-icon";
import { ChatBannerRoot } from "./chat-banner-root";
import { ChatBannerText } from "./chat-banner-text";

export const ChatBanner = {
  Root: ChatBannerRoot,
  Icon: ChatBannerIcon,
  Text: ChatBannerText,
  Action: ChatBannerAction,
  Dismiss: ChatBannerDismiss,
};
```

Keeping the namespace object alone in `index.tsx` (no component declarations beside it) also satisfies `react-refresh/only-export-components` without a disable directive.

For a small compound component that does not need shared state, a single file that declares the parts and exports the namespace object is acceptable — split into a folder once it grows or needs a shared context.

## Quick mapping: pattern to props eliminated

| Pattern | Props avoided |
|---|---|
| Zustand `{ state, actions }` selectors | action callbacks, domain data threading |
| Jotai atoms | ephemeral UI flags and sibling coordination props |
| Dialog hooks | open/close booleans and handler chains |
| FormProvider + useFormContext | form API props (control, setValue, formState, etc.) |
| Custom hooks | derived lists and orchestration props |
| Granular components | intermediary forwarding props |
| Composition with children | configuration-style content props |

## Practical rule of thumb

Before adding a new prop, check this order:
1. Is this server data? Call its `use-{subject}-data` hook in the component that needs it.
2. Is this global/domain state? Use a zustand selector.
3. Is this feature-local shared UI state? Use an atom in `states/{topic}-state.ts`.
4. Is this dialog state? Use `useDialogs` or `useDialogsAtom`.
5. Is this form state? Use FormProvider + useFormContext.
6. Is this derivation/logic? Move it to a custom hook.
7. Is this layout/content customization? Use children composition.
8. If none apply, pass the prop directly and keep it minimal.
