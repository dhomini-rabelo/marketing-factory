import { useDocumentsData } from '@/layout/hooks/api/use-documents-data'
import { DocumentsSectionEmpty } from '@/pages/project/components/documents-section/documents-section-empty'
import { DocumentsSectionError } from '@/pages/project/components/documents-section/documents-section-error'
import { DocumentsSectionList } from '@/pages/project/components/documents-section/documents-section-list'
import { DocumentsSectionLoading } from '@/pages/project/components/documents-section/documents-section-loading'

type DocumentsSectionProps = {
  projectId: string
}

export function DocumentsSection({ projectId }: DocumentsSectionProps) {
  const documentsRequest = useDocumentsData(projectId)
  const { data, isLoading, isError } = documentsRequest.state

  if (isLoading) return <DocumentsSectionLoading />
  if (isError || !data) return <DocumentsSectionError projectId={projectId} />
  if (data.length === 0) return <DocumentsSectionEmpty />

  return <DocumentsSectionList projectId={projectId} documents={data} />
}
