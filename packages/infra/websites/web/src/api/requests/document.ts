import { apiFetch } from '@/api/client'
import type { Document, DocumentSummary } from '@/api/models/document'
import { API_ROUTES } from '@/api/routes'
import type { DocumentsResponse } from '@/api/types'

export async function listDocuments(projectId: string): Promise<DocumentSummary[]> {
  const response = await apiFetch<DocumentsResponse>(API_ROUTES.documents.list(projectId))
  return response.documents
}

export function getDocument(projectId: string, slug: string): Promise<Document> {
  return apiFetch<Document>(API_ROUTES.documents.detail(projectId, slug))
}
