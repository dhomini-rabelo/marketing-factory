import { ChoiceField } from '@/layout/components/forms/choice-field'
import { TextField } from '@/layout/components/forms/text-field'
import { PHASE_OPTIONS, PLATFORM_OPTIONS } from '@/pages/project/utils/project-options'

export function ProjectFormFields() {
  return (
    <>
      <TextField name="name" label="Nome" hint="até 80 caracteres" />
      <ChoiceField name="platform" label="Plataforma" options={PLATFORM_OPTIONS} />
      <ChoiceField name="phase" label="Fase" options={PHASE_OPTIONS} />
      <TextField name="description" label="Descrição curta" hint="até 200 caracteres" />
    </>
  )
}
