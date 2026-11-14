# Component Variant Map Patterns

How components resolve a variant prop to classes or sub-components. Use these patterns when a component exposes a finite set of variants (a typography scale, a tone, an icon kind).

## Map variants with a `Record`

- Define a `Record<{Variant}, string>` (for classes) or `Record<{Variant}, ComponentType<...>>` (for sub-components), keyed by a string-literal union type.
- Web apps: when only the component uses the map, declare it in the component file right after the imports, without `export`; export the variant type when another file needs it. When two or more files use the map, move it to `{component}-class-names.ts` in the nearest folder that holds every consumer, never to `utils/`. See [class names](../../../code-get-coding-designs/designs/feature-folder-structure.md#class-names).
- `project-mobile`: the map stays at module level in the component file, exported alongside the component.
- Look the variant up in the map inside the component instead of branching with `if`/`switch` in JSX.

```tsx
// Wrong way — variant logic tangled in the render
export function Typography({ variant, children }: TypographyProps) {
  let className = ''
  if (variant === 'wordmark') className = 'text-wordmark'
  else if (variant === 'body-md') className = 'text-body-md'
  return <span className={className}>{children}</span>
}

// Correct way — typography.tsx, the only file that uses the map
import { cn } from '@/layout/utils/styles'

export type TypographyVariant = 'wordmark' | 'body-md' | 'label-caps'

const VARIANT_CLASSES: Record<TypographyVariant, string> = {
  wordmark: 'text-wordmark',
  'body-md': 'text-body-md',
  'label-caps': 'text-label-caps font-mono uppercase',
}

export function Typography({ variant, className, children }: TypographyProps) {
  return (
    <Component className={cn(VARIANT_CLASSES[variant], className)}>
      {children}
    </Component>
  )
}
```

## Merge the resolved classes with `cn()`

- Combine the variant classes with an optional incoming `className` through the `cn()` helper (from `@/layout/utils/styles`) so callers can extend styling without the map losing precedence.

```tsx
// Correct way
<div className={cn('flex items-center', orientation === 'row' ? 'flex-row gap-2.5' : 'flex-col', className)} />
```

## Keep variant values on theme tokens

- Classes inside a variant map use theme-token utilities (`bg-surface`, `text-accent`), not arbitrary values such as `bg-[#3b82f6]`. Add a missing token to `global.css` first.

```tsx
// Wrong way
const toneClasses: Record<Tone, string> = { danger: 'bg-[#ef4444] text-[#ffffff]' }

// Correct way
const toneClasses: Record<Tone, string> = { danger: 'bg-danger text-on-danger' }
```
