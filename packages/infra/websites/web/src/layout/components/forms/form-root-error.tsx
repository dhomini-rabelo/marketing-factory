import { useFormContext } from 'react-hook-form'
import { Button } from '@/layout/components/ui/button'

type FormRootErrorProps = {
  onRetry: () => void
}

export function FormRootError({ onRetry }: FormRootErrorProps) {
  const { formState } = useFormContext()
  if (!formState.errors.root?.server) return null

  return (
    <div role="alert" className="mb-[22px] rounded-2 bg-card p-3.5 shadow-1">
      <p className="font-semibold text-attention">Não foi possível salvar</p>
      <p className="mt-1 text-[13px] text-ink-2">O que você preencheu continua aqui.</p>
      <Button type="button" variant="secondary" className="mt-3" onClick={onRetry}>
        Tentar de novo
      </Button>
    </div>
  )
}
