# Form Structure

How a web app organizes forms and form fields. Forms use react-hook-form with zod; fields read the form through `useFormContext`, so no form API is passed as props. **All file and folder names use kebab-case**.

## Where things live

```
layout/components/forms/
├── field.tsx  input.tsx  select.tsx  textarea.tsx  label.tsx    # field primitives
├── text-field.tsx  select-field.tsx  ...                        # fields bound to RHF via useFormContext
├── form-root-error.tsx                                          # form-level error read from the context
└── {form-name}-form/                                            # domain form used by more than one screen
    ├── {form-name}-form.tsx
    ├── {form-name}-form-schema.ts
    └── {field-name}-field.tsx

layout/utils/form-errors.ts                                      # API error envelope -> RHF setError

pages/{page-name}/components/{form-name}-form/                   # form exclusive to one page, same shape
```

- `layout/components/ui/` holds primitives with no form behavior (button, chip, sheet). Anything form-related that is shared goes to `forms/`.
- A form used by one page stays in that page's `components/`; when a second screen needs it, move the whole folder to `layout/components/forms/`.

## The form owns schema and `useForm`

The form folder owns the zod schema (`{form-name}-form-schema.ts`) and the `useForm` call. The form receives at most `defaultValues` and `onSubmit`, or calls its mutation hook itself when it has a single use.

```tsx
export function InviteMemberForm({ onSubmit }: InviteMemberFormProps) {
  const form = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberFormSchema),
    defaultValues: { email: '' },
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TextField name="email" label="Email" />
        <FormRootError />
        <Button type="submit">Invite</Button>
      </form>
    </FormProvider>
  )
}
```

## Fields read the context

Generic fields take `name`, `label`, and the minimum else, and read `register` and `formState.errors` from the context. A domain-specific field (for example a select of connections) is its own component in the form folder, reading the context and its own data hook.

```tsx
export function TextField({ name, label }: TextFieldProps) {
  const { register, formState } = useFormContext()
  return (
    <Field label={label} error={formState.errors[name]?.message as string | undefined}>
      <Input {...register(name)} />
    </Field>
  )
}
```

## API errors

`layout/utils/form-errors.ts` exports `applyApiErrorToForm({ setError, error, fieldByCode? })`. The error envelope has no field name, so it sets a field error when `fieldByCode` maps the error code to a field, and `root.server` otherwise. The form calls it from its mutation `onError`; `FormRootError` renders `root.server`.

See [react forms](../../code-write-code/coding-patterns/frontend/react-forms.md) for the code-level rules.
