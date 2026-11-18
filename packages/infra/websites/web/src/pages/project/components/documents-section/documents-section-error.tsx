import { useDocumentsData } from '@/layout/hooks/api/use-documents-data'

type DocumentsSectionErrorProps = {
  projectId: string
}

export function DocumentsSectionError({ projectId }: DocumentsSectionErrorProps) {
  const documentsRequest = useDocumentsData(projectId)

  return (
    <section aria-label="Documentos" role="alert" className="pt-5">
      <p className="font-semibold text-attention">Não foi possível carregar os documentos.</p>
      <button
        type="button"
        className="mt-3 rounded-2 bg-card px-3.5 py-2 text-sm font-semibold shadow-1"
        onClick={() => documentsRequest.actions.refetch()}
      >
        Tentar de novo
      </button>
    </section>
  )
}
