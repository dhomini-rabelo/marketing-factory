type CompetitorsErrorProps = {
  onRetry: () => void
}

export function CompetitorsError({ onRetry }: CompetitorsErrorProps) {
  return (
    <div role="alert" className="px-9 pb-10 pt-7">
      <p className="font-semibold text-attention">Não foi possível carregar os concorrentes.</p>
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
