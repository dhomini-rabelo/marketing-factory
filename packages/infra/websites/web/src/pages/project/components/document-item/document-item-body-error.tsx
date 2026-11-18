import { useDocumentData } from '@/layout/hooks/api/use-document-data'

type DocumentItemBodyErrorProps = {
  projectId: string
  slug: string
}

export function DocumentItemBodyError({ projectId, slug }: DocumentItemBodyErrorProps) {
  const documentRequest = useDocumentData({ projectId, slug, enabled: true })

  return (
    <div role="alert" className="bg-brand-soft px-5 pb-5 pt-1">
      <p className="font-semibold text-attention">Não foi possível abrir o documento.</p>
      <button
        type="button"
        className="mt-3 rounded-2 bg-card px-3.5 py-2 text-sm font-semibold shadow-1"
        onClick={() => documentRequest.actions.refetch()}
      >
        Tentar de novo
      </button>
    </div>
  )
}
