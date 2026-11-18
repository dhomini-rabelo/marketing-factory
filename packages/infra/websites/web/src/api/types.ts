import type { DocumentSummary } from '@/api/models/document'
import type { Project } from '@/api/models/project'

export type ProjectsResponse = { projects: Project[] }

export type DocumentsResponse = { documents: DocumentSummary[] }

export type FieldIssueResponse = { field: string; code: string; message: string }

export type ErrorResponse = {
  error: { code: string; message: string; fields?: FieldIssueResponse[] }
}
