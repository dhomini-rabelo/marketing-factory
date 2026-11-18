import { useId } from 'react'
import { useFormContext } from 'react-hook-form'
import { ChoiceCard } from '@/layout/components/forms/choice-card'
import { Field } from '@/layout/components/forms/field'
import { Label } from '@/layout/components/forms/label'

export type ChoiceOption = {
  value: string
  label: string
  hint: string
}

type ChoiceFieldProps = {
  name: string
  label: string
  options: ChoiceOption[]
}

export function ChoiceField({ name, label, options }: ChoiceFieldProps) {
  const { register, formState } = useFormContext()
  const labelId = useId()
  const message = formState.errors[name]?.message as string | undefined

  return (
    <Field error={message}>
      <Label id={labelId}>{label}</Label>
      <div role="radiogroup" aria-labelledby={labelId} className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <ChoiceCard
            key={option.value}
            label={option.label}
            hint={option.hint}
            value={option.value}
            {...register(name)}
          />
        ))}
      </div>
    </Field>
  )
}
