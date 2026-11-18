type DocumentsSectionErrorProps = {
  onRetry: () => void
}

export function DocumentsSectionError({ onRetry }: DocumentsSectionErrorProps) {
  return (
    <section aria-label="Documentos" role="alert" className="pt-5">
      <p className="font-semibold text-attention">Não foi possível carregar os documentos.</p>
      <button
        type="button"
        className="mt-3 rounded-2 bg-card px-3.5 py-2 text-sm font-semibold shadow-1"
        onClick={onRetry}
      >
        Tentar de novo
      </button>
    </section>
  )
}
