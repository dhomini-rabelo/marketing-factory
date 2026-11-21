type CompetitorTabLoadingProps = {
  name: string
}

export function CompetitorTabLoading({ name }: CompetitorTabLoadingProps) {
  return (
    <div role="status" className="mt-6 text-ink-2">
      Carregando os dados de {name}...
    </div>
  )
}
