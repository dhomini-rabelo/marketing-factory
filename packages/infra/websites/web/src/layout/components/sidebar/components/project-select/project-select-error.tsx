type ProjectSelectErrorProps = {
  onRetry: () => void
}

export function ProjectSelectError({ onRetry }: ProjectSelectErrorProps) {
  return (
    <div role="alert" className="px-2 text-sm">
      <p className="text-white/78">Não foi possível carregar os projetos.</p>
      <button
        type="button"
        className="mt-2 rounded-2 border border-white/40 px-3 py-1.5 font-semibold text-white"
        onClick={onRetry}
      >
        Tentar de novo
      </button>
    </div>
  )
}
