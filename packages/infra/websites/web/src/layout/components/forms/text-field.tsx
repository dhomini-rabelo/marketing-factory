import { useFormContext } from 'react-hook-form'
import { Field } from '@/layout/components/forms/field'
import { Input } from '@/layout/components/forms/input'
import { Label } from '@/layout/components/forms/label'

type TextFieldProps = {
  name: string
  label: string
  hint?: string
}

export function TextField({ name, label, hint }: TextFieldProps) {
  const { register, formState } = useFormContext()
  const message = formState.errors[name]?.message as string | undefined

  return (
    <Field error={message}>
      <Label htmlFor={name} hint={hint}>
        {label}
      </Label>
      <Input id={name} aria-invalid={Boolean(message)} {...register(name)} />
    </Field>
  )
}
