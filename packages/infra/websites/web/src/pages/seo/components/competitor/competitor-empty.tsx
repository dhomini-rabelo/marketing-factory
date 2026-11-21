type CompetitorEmptyProps = {
  message: string
  limits: string
}

export function CompetitorEmpty({ message, limits }: CompetitorEmptyProps) {
  return (
    <div className="px-4 py-3 text-[13px] text-ink-3">
      <p>{message}</p>
      {limits && (
        <p className="mt-1 text-xs">
          <b className="text-ink-2">Motivo (limites da coleta):</b> {limits}
        </p>
      )}
    </div>
  )
}
