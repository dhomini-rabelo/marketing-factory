import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, type DefaultValues } from 'react-hook-form'
import { FormRootError } from '@/layout/components/forms/form-root-error'
import { Button } from '@/layout/components/ui/button'
import { applyApiErrorToForm } from '@/layout/utils/form-errors'
import { ProjectFormFields } from '@/pages/project/components/project-form/project-form-fields'
import {
  projectFormSchema,
  type ProjectFormValues,
} from '@/pages/project/components/project-form/project-form-schema'

type ProjectFormProps = {
  defaultValues?: DefaultValues<ProjectFormValues>
  onSubmit: (values: ProjectFormValues) => Promise<unknown>
  submitLabel: string
  onCancel?: () => void
}

const EMPTY_VALUES: DefaultValues<ProjectFormValues> = { name: '', description: '' }

export function ProjectForm({
  defaultValues = EMPTY_VALUES,
  onSubmit,
  submitLabel,
  onCancel,
}: ProjectFormProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues,
  })

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      applyApiErrorToForm({ setError: form.setError, error })
    }
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate>
        <ProjectFormFields />
        <FormRootError onRetry={submit} />
        <div className="flex gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Salvando...' : submitLabel}
          </Button>
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  )
}
