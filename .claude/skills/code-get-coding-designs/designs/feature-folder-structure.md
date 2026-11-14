# Feature Folder Structure

Where each kind of file goes inside a web app page (`src/pages/{page}/`) and inside a feature group (`src/layout/components/{group}/`, such as an app shell or a command bar): components, contexts, jotai states, zustand stores, hooks, utils and class names. **All file and folder names use kebab-case**. The page-level composition rules (`page.tsx`, sections, forms) are in [page structure](./page-structure.md); this file decides which folder a file belongs to.

## Folder layout

Pages and feature groups use the same set of folders. A folder exists only when it holds at least one file.

```
pages/{page}/                          layout/components/{group}/
├── page.tsx                           ├── {group}.tsx           # entries only
├── components/                        ├── components/
├── contexts/{subject}-context.ts      ├── contexts/{subject}-context.ts
├── states/{page}-state.ts             ├── states/{topic}-state.ts
├── stores/{concern}-store.ts          ├── hooks/use-{subject}.ts
├── hooks/use-{subject}.ts             └── utils/{topic}.ts
└── utils/{topic}.ts
```

A page with more than 3 atoms (illustrative names):

```
pages/{page}/
├── page.tsx
├── components/
│   ├── {unique-component}.tsx
│   └── {section}/
│       ├── {section}.tsx
│       └── {section}-loading.tsx
├── states/
│   ├── {page}-state.ts                # dialogAtom, editorViewAtom, selectedItemIdAtom
│   └── {topic}-state.ts               # resultAtom, runStateAtom
├── hooks/
│   └── use-{subject}.ts
└── utils/
    └── {topic}.ts
```

A feature group with one entry:

```
layout/components/{group}/
├── {group}.tsx                        # the only entry: imported from outside the group
├── components/
│   ├── {group}-input.tsx
│   ├── {group}-list.tsx
│   └── {sub-feature}/
│       ├── {sub-feature}.tsx          # also exports the {SubFeature}State view type
│       ├── {sub-feature}-loading.tsx
│       └── {sub-feature}-error.tsx
├── contexts/
│   └── {group}-context.ts
├── hooks/
│   └── use-{group}.ts
└── utils/
    ├── {group}-item.ts                # type read by several files of the group
    └── {topic}.ts
```

## Group root holds only entries

An entry is a file imported from outside the group. The root of a feature group holds only its entries; everything else goes to `components/`, `contexts/`, `states/`, `hooks/` or `utils/`.

- A group whose files are all entries (each one imported by `core/` or another group) keeps them at the root and has no `components/`.
- `ui/`, `forms/` and `common/` are libraries of primitives, not feature groups: they get no `components/` folder. See [ui primitives](#ui-primitives) and [form structure](./form-structure.md).

In a page, `page.tsx` is the entry, and single components may sit loose in `components/` (see [page structure](./page-structure.md)).

## contexts/

A React context and its `use{Subject}Context` hook live together in `contexts/{subject}-context.ts`, one context per file. `createContext` appears only in `contexts/`. The component that renders the provider imports the context from there; consumers under `components/` call the hook instead of receiving the value as props.

```ts
// {group}/contexts/{group}-context.ts
export const CommandBarContext = createContext<CommandBarContextValue | null>(null)

export function useCommandBarContext() {
  const value = useContext(CommandBarContext)
  if (!value) throw new Error('useCommandBarContext must be used inside CommandBar')
  return value
}
```

A compound component follows the same rule inside its own folder (see [minimum props strategies](../../code-write-code/coding-patterns/frontend/minimum-props-strategies.md)).

## states/

Jotai atoms are declared only in `states/`, and the `-state.ts` suffix is used only there.

- One file holds 1 to 3 related atoms. When all atoms of a page fit in one file, name it `states/{page}-state.ts`.
- Past 3 atoms, split by topic into `states/{topic}-state.ts`, grouping atoms that the same consumers read together. Do not split a file just to balance the counts.
- The type of an atom's value lives in the atom's file (`RunState` next to `runStateAtom`).
- Each consumer imports from the state file that declares the atom; there is no barrel.
- A file that only declares a type is not a state file: a component's view-state type is exported from the component `.tsx`, not from a `{component}-state.ts`.

The page that owns the atoms wraps its composition in jotai's `Provider` (see [page structure](./page-structure.md)).

## stores/

Zustand stores read by more than one page, or by the layout, live in `layout/stores/{concern}-store.ts`. A store read by a single page lives in `pages/{page}/stores/{concern}-store.ts` and moves to `layout/stores/` as soon as another page or the layout reads it. Contract and splitting rules: [zustand stores structure](./zustand-stores-structure.md).

## hooks/ and utils/

- `hooks/use-{subject}.ts` returns `{ state, actions }`.
- `utils/{topic}.ts` holds pure functions, constants, data and types shared by files of the page or group, one subject per file. Code shared between pages goes to `layout/utils/`.
- Types follow their owner: an atom's value type sits in its state file; a component's props or view type (and the hook that feeds it) is exported from the component `.tsx`; a type shared by several files of the group goes to `utils/{topic}.ts`. There is no `types/` folder.

## Class names

Class-name symbols are class-string constants, `Record<Variant, string>` maps and functions that only compute a className (`tabClassName`). Place each symbol by how many files import it:

| Consumers | Where | Example |
|---|---|---|
| 1 file | in that `.tsx`, right after the imports, not exported; a variant type keeps `export type` | `SHEET_VARIANT_CLASSES` in `ui/sheet/sheet.tsx` |
| 2+ files | `{component}-class-names.ts` in the nearest folder that contains every consumer | `ui/sheet/sheet-class-names.ts`, read by the sheet and by two groups that reuse its backdrop |
| 2+ files of one page | inside that page, never in `layout/components/common/` | `pages/{page}/components/{component}-class-names.ts` |

- The only suffix is `-class-names.ts`; `-class-name.ts` and `-classes.ts` are not used. A class-names file never lives in `utils/`.
- When consumers change, move the symbol: a shared file left with one consumer is inlined into it, and a file left with no symbol is deleted.
- Functions that return something other than a className (colors, chip variants) stay in `utils/`.

```tsx
// ui/sheet/sheet.tsx
import { BACKDROP_CLASSES, SHEET_PANEL_CLASSES } from '@/layout/components/ui/sheet/sheet-class-names'
import { cn } from '@/layout/utils/styles'

export type SheetVariant = 'default' | 'wide'

const SHEET_VARIANT_CLASSES: Record<SheetVariant, string> = {
  default: '',
  wide: 'md:w-[min(720px,calc(100vw-48px))]',
}
```

## ui primitives

- A primitive made of one file sits at the root of `ui/`, with its class strings and variant maps inline (`ui/button.tsx`, `ui/alert.tsx`).
- A primitive made of 2+ files becomes a folder `ui/{primitive}/` (`ui/sheet/`, `ui/toasts/`), imported by full path (`@/layout/components/ui/sheet/sheet`).
- A shared style with no component of its own is a single file at the root of `ui/` (`ui/card-class-names.ts`).
