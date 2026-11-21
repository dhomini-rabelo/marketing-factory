import { useParams } from 'react-router'
import { useSeoCompetitorData } from '@/layout/hooks/api/use-seo-competitor-data'
import { useDismissOnOutsideClick } from '@/layout/hooks/use-dismiss-on-outside-click'
import { ComparisonsTable } from '@/pages/seo/components/overview/comparisons-table'
import { useSeoRoundId } from '@/pages/seo/hooks/use-seo-round-id'
import { readComparisons } from '@/pages/seo/utils/seo-comparisons'

type ComparisonsDialogProps = {
  competitorName: string
  onClose: () => void
}

export function ComparisonsDialog({ competitorName, onClose }: ComparisonsDialogProps) {
  const { projectId = '' } = useParams()
  const { state: roundIdState } = useSeoRoundId()
  const panelRef = useDismissOnOutsideClick(true, onClose)
  const { state, actions } = useSeoCompetitorData({
    projectId,
    roundId: roundIdState.roundId,
    competitorName,
    enabled: true,
  })

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-6">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Comparações de ${competitorName}`}
        className="flex max-h-full w-full max-w-3xl flex-col rounded-3 bg-card shadow-2"
      >
        <header className="flex items-center justify-between gap-3 px-5 py-4">
          <h3 className="text-[15px] font-bold">Comparações de {competitorName}</h3>
          <button type="button" aria-label="Fechar" className="text-lg font-bold text-ink-3" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="overflow-y-auto px-5 pb-5">
          {state.isLoading && <p role="status" className="text-ink-2">Carregando as comparações...</p>}
          {state.isError && (
            <div role="alert">
              <p className="font-semibold text-attention">
                Não foi possível carregar as comparações de {competitorName}. Tente de novo.
              </p>
              <button
                type="button"
                className="mt-3 rounded-2 bg-card px-3.5 py-2 text-sm font-semibold shadow-1"
                onClick={() => actions.refetch()}
              >
                Tentar de novo
              </button>
            </div>
          )}
          {state.data && <ComparisonsTable comparisons={readComparisons(state.data.comparisons)} />}
        </div>
      </div>
    </div>
  )
}
