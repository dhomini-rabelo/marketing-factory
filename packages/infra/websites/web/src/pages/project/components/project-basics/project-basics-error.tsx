type ProjectBasicsErrorProps = {
  onRetry: () => void
}

export function ProjectBasicsError({ onRetry }: ProjectBasicsErrorProps) {
  return (
    <div role="alert" className="border-b border-line pb-5">
      <p className="font-semibold text-attention">Não foi possível carregar o projeto.</p>
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
