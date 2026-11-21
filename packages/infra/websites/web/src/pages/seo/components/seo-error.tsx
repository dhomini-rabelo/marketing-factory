type SeoErrorProps = {
  onRetry: () => void
}

export function SeoError({ onRetry }: SeoErrorProps) {
  return (
    <div role="alert" className="mt-6">
      <p className="font-semibold text-attention">Não foi possível carregar a rodada.</p>
      <button
        type="button"
        className="mt-3 rounded-2 bg-card px-3.5 py-2 text-sm font-semibold shadow-1"
        onClick={onRetry}
      >
        Tentar de novo
      </button>
    </div>
  )
}
