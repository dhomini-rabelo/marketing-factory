type CompetitorTabErrorProps = {
  name: string
  onRetry: () => void
}

export function CompetitorTabError({ name, onRetry }: CompetitorTabErrorProps) {
  return (
    <div role="alert" className="mt-6">
      <p className="font-semibold text-attention">Não foi possível carregar os dados de {name}. Tente de novo.</p>
      <button type="button" className="mt-3 rounded-2 bg-card px-3.5 py-2 text-sm font-semibold shadow-1" onClick={onRetry}>
        Tentar de novo
      </button>
    </div>
  )
}
