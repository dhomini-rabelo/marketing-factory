# React Form Patterns

Code-level rules for forms in a web app: react-hook-form (RHF) with zod, fields that read the form through context. For where the files live, see [form structure](../../../code-get-coding-designs/designs/form-structure.md).

## Validate with a zod schema and `zodResolver`

- The schema lives in `{form-name}-form-schema.ts` next to the form; the values type is inferred from it.
- Pass the schema to `useForm` through `zodResolver`; do not hand-write per-field validation in the component.

```tsx
// Wrong way — manual validation and one useState per field
const [email, setEmail] = useState('')
const [emailError, setEmailError] = useState<string | null>(null)

// Correct way — schema owns the rules
export const inviteMemberFormSchema = z.object({
  email: z.string().email('Enter a valid email'),
})
export type InviteMemberFormValues = z.infer<typeof inviteMemberFormSchema>

const form = useForm<InviteMemberFormValues>({
  resolver: zodResolver(inviteMemberFormSchema),
  defaultValues: { email: '' },
})
```

## Fields read the form with `useFormContext`

Wrap the form in `FormProvider` and never pass `register`, `control`, `errors`, or `setValue` as props. A field takes `name`, `label`, and the minimum else.

```tsx
// Wrong way
<TextField register={form.register} error={form.formState.errors.email?.message} label="Email" />

// Correct way
<TextField name="email" label="Email" />
```

## Form props: `defaultValues` and `onSubmit` at most

The form owns `useForm` and the schema. Expose only the initial values and the submit callback; when the form has a single use, call the mutation hook inside the form instead of receiving `onSubmit`.

## Map API errors with `layout/utils/form-errors.ts`

Send the API error through `applyApiErrorToForm` so a mapped error lands on its field and anything else lands on `root.server`, which `FormRootError` renders. The error envelope carries `{ code, message }` and no field name, so a page that wants a field error passes `fieldByCode`. Do not duplicate the mapping inside forms.

```tsx
const mutation = useSaveMemberData({
  onError: (error) => applyApiErrorToForm({ setError: form.setError, error }),
})

const mutation = useSaveMemberData({
  onError: (error) => applyApiErrorToForm({ setError: form.setError, error, fieldByCode: { MEMBER_ALREADY_EXISTS: 'email' } }),
})
```

## One field per file

A domain-specific field (select of connections, role picker) is its own file `{field-name}-field.tsx` in the form folder; it reads the context and its own data hook. Generic fields live in `layout/components/forms/`.
