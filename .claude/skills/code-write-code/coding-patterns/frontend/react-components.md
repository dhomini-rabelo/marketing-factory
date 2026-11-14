# React Component Coding Patterns

## Organize reusable components by scope

- `layout/components/ui/` holds small foundational primitives with no business rule and no form behavior (button, chip, sheet, toasts, confirm dialog). In web apps, a primitive made of several files is a folder (`ui/sheet/`, `ui/toasts/`).
- `layout/components/forms/` (web apps) holds everything form-related that is shared: field primitives (`field`, `input`, `select`, `textarea`, `label`), RHF-bound fields, and domain forms used by more than one screen. See [React form patterns](./react-forms.md).
- `layout/components/common/` and the other `layout/components/{group}/` folders compose primitives into larger shared parts (page shell, app shell, command bar). In web apps, a feature group keeps only its entries at the root and the rest in `components/`, `contexts/`, `states/`, `hooks/` and `utils/` (see [feature folder structure](../../../code-get-coding-designs/designs/feature-folder-structure.md)). The same size and prop limits apply.
- Components used by a single page live in that page's `components/`.

```tsx
// Correct way
import { Button } from '@/layout/components/ui/button'
import { TextField } from '@/layout/components/forms/text-field'

export function AppHeader() {
  return <Button>Save</Button>
}

// Wrong way — foundational and composed components mixed in a single shared folder
export function SharedButtonHeader() {
  return <button>Save</button>
}
```

## Keep components small and props few

- Aim for at most 80 lines per `.tsx` file; past about 120 lines, split it.
- Aim for 2 to 3 props; more than 5 props is not allowed on any component, `ui/` primitives included. Extract a hook, a jotai atom, a store selector, a form context, or a compound component instead.
- Variants collapse into one `variant` prop (`Chip variant="on"`, `Sheet variant="wide"`), never loose `on`/`tone`/`wide` booleans.
- A dialog or sheet has no `open` prop: the caller renders it conditionally (`useDialogs`/`useDialogsAtom`) and it mounts open.
- Optional regions become compound parts (`Sheet` + `SheetBody` + `SheetFooter`) instead of `footer={...}` props; a pending state of an async action (`ConfirmDialog` `onConfirm`) lives inside the component instead of a `loading` prop.
- Props that only forward native HTML attributes (`Omit<InputProps, ...>`, `HTMLAttributes`) do not count; count only the props the component declares itself.
- A section or list takes no props when it can read its own data hook, store, or atom. A list item takes its id or entity (one prop) and reads actions from the store or hook.
- One component per file. A second component in the same file moves to its own file.
- Props types stay in the component file.

```tsx
// Wrong way — parent threads data and callbacks through
<ConnectionRow connection={connection} isSelected={isSelected} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} />

// Correct way — the row reads state and actions itself
<ConnectionRow connectionId={connection.id} />
```

## Follow component declaration and import conventions, and use destructuring for props

```tsx
// Correct way
import { useEffect, useRef, useState } from "react";

export function MyComponent({ title }: MyComponentProps) {
  return <h1>{title}</h1>;
}

// Avoid
import React from "react";

export default function MyComponent(props: MyComponentProps) {
  return <h1>{props.title}</h1>;
}
```

## Use Tailwind v4 with global theme colors

- Prefer Tailwind utility classes using project theme tokens from `global.css`.
- Add missing colors to global theme tokens when needed instead of hardcoding new colors in components.
- Style with utility classes only: no CSS Modules, no global component classes, and no inline `style` for values a utility can express (inline `style` is acceptable only for runtime values such as a dynamic color or size).
- Colors, type scale, radii, shadows, spacing and animations are `@theme` tokens in `global.css`.
- Compose and conditionally merge classes with `cn()`; pass overrides through `className`.
- Repeated layout shapes become small components or class strings in a shared `{component}-class-names.ts`, not copied class strings.
- Web apps: variants and tones resolve through a `Record<Variant, string>` declared in the component file, or in a shared `{component}-class-names.ts` when several files use it (see [component variant maps](./component-variant-maps.md) and [class names](../../../code-get-coding-designs/designs/feature-folder-structure.md#class-names)).

```tsx
// Correct way
<button className="bg-primary-500 text-neutral-0 hover:bg-primary-600" />

// Avoid hardcoded colors that bypass theme tokens
<button className="bg-[#3b82f6] text-[#ffffff]" />
```

## Use lucide-react for icons

```tsx
// Correct way
import { CalendarCheck } from "lucide-react";

export function HeaderIcon() {
  return <CalendarCheck size={20} className="text-primary-400" />;
}
```

## Prefer explicit handlers and function declarations

- Use function declarations for components and event handlers.
- Prefix event handlers with `handle`.
- Keep helper functions without `handle` prefix.
- Avoid inline functions in JSX when no arguments are needed.
- Inline arrow functions are acceptable when parameters must be passed.

```tsx
// Correct way
function handleIncrementCounter() {
  setState((previousState) => ({
    ...previousState,
    counter: previousState.counter + 1,
  }));
}

<button onClick={handleIncrementCounter}>Increment</button>

// Exception for parameter passing
<button onClick={() => editTask(taskId)}>Edit</button>

// Exception for parameter passing
<button onClick={() => activateDialog("create-event")}>Edit</button>

// Avoid
<button onClick={() => setState((previousState) => ({
  ...previousState,
  counter: previousState.counter + 1,
}))}>Increment</button>
```

## Keep helpers outside the component when they do not depend on component scope

- Keep a function inside the component only when it depends on its state, refs, props, or hooks (event handlers).
- Logic with effects or state goes to a `use-{subject}.ts` hook that returns `{ state, actions }`.
- Web apps: a component file contains the component and its props type only. A pure function or constant goes to `{page}/utils/{topic}.ts`, or to `layout/utils/{topic}.ts` when shared. Never declare them above the component.
- Web apps exception: a class string, variant map or className function used only by this component is declared in its `.tsx`, right after the imports, without `export`. When several files use it, it goes to a shared `{component}-class-names.ts` (see [class names](../../../code-get-coding-designs/designs/feature-folder-structure.md#class-names)).
- `project-mobile`: a pure helper that does not use component scope may stay at module level in the component file.

```tsx
// Wrong way — helper above the component (web app)
function getCounterValueGoal(counter: number) {
  return counter * 2
}

export function CounterGoal({ counter }: CounterGoalProps) {
  return <p>Counter value goal: {getCounterValueGoal(counter)}</p>
}

// Correct way — helper in {page}/utils/counter.ts
import { getCounterValueGoal } from '@/pages/counter/utils/counter'

export function CounterGoal({ counter }: CounterGoalProps) {
  return <p>Counter value goal: {getCounterValueGoal(counter)}</p>
}
```

## Use object state for state management

- If the component has multiple related state values, use a single state object and an interface for its shape.
- For short components, naming the pair as `state` and `setState` is acceptable.
- For longer components, use specific names such as `deletionState` and `setDeletionState`.

```tsx
interface DeleteItemDialogState {
  isDeleting: boolean;
  formError: string | null;
}

export function DeleteItemDialog() {
  const [state, setState] = useState<DeleteItemDialogState>({
    isDeleting: false,
    formError: null,
  });

  async function handleDelete() {
    try {
      setState({ isDeleting: true, formError: null });
      await authClient.delete(deleteURL);
      onDeleteSuccess();
      close();
    } catch {
      setState({ isDeleting: false, formError: "Failed to delete item." });
    } finally {
      setState({ isDeleting: false, formError: null });
    }
  }

  return (
    <>
      <Button disabled={state.isDeleting}>Cancel</Button>
      <Button isLoading={state.isDeleting}>Delete</Button>
    </>
  );
}
```

## Do not build sub-UI through local renderX() functions

- Never extract chunks of JSX into local `renderX()` helper functions inside a component.
- Inline the JSX directly in the body; if it is reused, promote it to a real component instead.
- Inline conditional state branches (loading / error / empty / data) in the JSX body rather than wrapping them in a `renderContent()` function.

```tsx
// Wrong way
export function ChatPanel() {
  function renderBanner() {
    return <Banner>{message}</Banner>;
  }

  function renderContent() {
    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState />;
    return <MessageList messages={messages} />;
  }

  return (
    <>
      {renderBanner()}
      {renderContent()}
    </>
  );
}

// Correct way
export function ChatPanel() {
  return (
    <>
      <Banner>{message}</Banner>
      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState />
      ) : (
        <MessageList messages={messages} />
      )}
    </>
  );
}
```

## Keep the context payload minimal

- Put a value in a component's context only when it is genuinely shared or repeated across the subtree.
- When a single prop is threaded through many composition children, lift that prop into context instead of prop-drilling it.

```tsx
// Wrong way — context carries values only one child uses
const CardContext = createContext<{ isDisabled: boolean; title: string; icon: ReactNode }>();

// Correct way — context carries only the genuinely shared value
const CardContext = createContext<{ isDisabled: boolean }>();
```

## Use useDialogs and useDialogsAtom for dialogs by key

- `useDialogs<'a' | 'b'>()` (from `layout/hooks/use-dialogs.ts`) keeps the active dialog key in the component that renders the dialogs.
- `useDialogsAtom(atom)` does the same over a jotai atom in `states/{topic}-state.ts`, so a sibling or child opens a dialog without props.
- Both return `{ currentActiveDialog, activateDialog, disableDialog }`.
- Behavior every overlay needs (Escape to close, body scroll lock) is a hook in `layout/hooks/` that the overlay calls itself (`useSheetBehavior(onClose)`), not code repeated in each caller.

```tsx
// states/event-dialogs-state.ts
export const eventDialogsAtom = atom<'create-event' | 'edit-event' | null>(null)

// components/event-row-actions.tsx
export function EventRowActions() {
  const { activateDialog } = useDialogsAtom(eventDialogsAtom)
  return <Button onClick={() => activateDialog('edit-event')}>Edit</Button>
}
```

```tsx
export function EventsPage() {
  const { currentActiveDialog, activateDialog, disableDialog } =
    useDialogs<"create-event">();

  return (
    <>
      <Button onClick={() => activateDialog("create-event")}>New Event</Button>
      {currentActiveDialog === "create-event" && (
        <CreateEventDialog onClose={disableDialog} />
      )}
    </>
  );
}
```

```tsx
// Wrong way
<div className={styles.card} style={{ padding: 'var(--sp-4)', background: '#141311' }} />

// Correct way
<div className={cn('rounded-3 border border-border bg-surface px-4 py-3', isActive && 'border-accent')} />
```
