import type { ChannelSummary } from '@/api/models/channel-analysis'
import type { CompetitorApproval } from '@/api/models/competitor'
import type { DocumentSummary } from '@/api/models/document'
import type { Project } from '@/api/models/project'
import type { SeoRoundSummary } from '@/api/models/seo'

export type ProjectsResponse = { projects: Project[] }

export type DocumentsResponse = { documents: DocumentSummary[] }

export type ChannelsResponse = { channels: ChannelSummary[] }

export type SeoRoundsResponse = { rounds: SeoRoundSummary[] }

export type CompetitorsApprovalResponse = { approval: CompetitorApproval }

export type FieldIssueResponse = { field: string; code: string; message: string }

export type ErrorResponse = {
  error: { code: string; message: string; fields?: FieldIssueResponse[] }
}
