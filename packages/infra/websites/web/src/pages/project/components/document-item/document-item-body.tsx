import { useDocumentData } from '@/layout/hooks/api/use-document-data'
import { DocumentItemBodyError } from '@/pages/project/components/document-item/document-item-body-error'
import { DocumentItemBodyLoading } from '@/pages/project/components/document-item/document-item-body-loading'
import { DocumentItemMarkdown } from '@/pages/project/components/document-item/document-item-markdown'
import { DocumentItemSheet } from '@/pages/project/components/document-item/document-item-sheet'

type DocumentItemBodyProps = {
  projectId: string
  slug: string
}

export function DocumentItemBody({ projectId, slug }: DocumentItemBodyProps) {
  const documentRequest = useDocumentData({ projectId, slug, enabled: true })
  const { data, isLoading, isError } = documentRequest.state

  if (isLoading) return <DocumentItemBodyLoading />
  if (isError || !data) return <DocumentItemBodyError onRetry={() => documentRequest.actions.refetch()} />

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_200px] gap-6 bg-brand-soft px-5 pb-5 pt-1">
      <div className="max-h-96 overflow-y-auto">
        <DocumentItemMarkdown body={data.body} />
      </div>
      <DocumentItemSheet createdAt={data.createdAt} updatedAt={data.updatedAt} />
    </div>
  )
}
