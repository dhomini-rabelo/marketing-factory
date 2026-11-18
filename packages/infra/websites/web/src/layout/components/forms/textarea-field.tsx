import { useFormContext } from 'react-hook-form'
import { Field } from '@/layout/components/forms/field'
import { Label } from '@/layout/components/forms/label'
import { Textarea } from '@/layout/components/forms/textarea'

type TextareaFieldProps = {
  name: string
  label: string
  hint?: string
}

export function TextareaField({ name, label, hint }: TextareaFieldProps) {
  const { register, formState } = useFormContext()
  const message = formState.errors[name]?.message as string | undefined

  return (
    <Field error={message}>
      <Label htmlFor={name} hint={hint}>
        {label}
      </Label>
      <Textarea id={name} rows={3} aria-invalid={Boolean(message)} {...register(name)} />
    </Field>
  )
}
