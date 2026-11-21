import type { CompetitorRole } from '@/api/models/competitor'

export enum SeoTool {
  CLAUDE_CODE = 'claude-code',
  GROK_BOT = 'grok-bot',
}

export enum SeoRoundStatus {
  COMPLETE = 'complete',
  PARTIAL = 'partial',
}

export enum SeoWarningCheck {
  PAGE_TYPE_SUM = 'pageTypeSum',
  AUDIENCE_SHARE = 'audienceShare',
}

export type SeoWarning = {
  check: SeoWarningCheck
  competitor: string
  message: string
}

export type SeoRoundSummary = {
  id: string
  number: number
  tool: SeoTool
  collectedAt: string
  status: SeoRoundStatus
  isLatest: boolean
}

export type SeoRoundCompetitor = {
  name: string
  role: CompetitorRole
  collected: boolean
  pagesRead: number | null
  profile: Record<string, unknown> | null
  comparisons: object[]
  clusters: object[]
}

export type SeoRoundDocument = {
  title: string
  fileName: string
  about: string
  size: number
  body: string
}

export type SeoRound = {
  id: string
  tool: SeoTool
  collectedAt: string
  note: string
  market: string
  status: SeoRoundStatus
  missing: string[]
  warnings: SeoWarning[]
  searches: object[]
  pagesRead: number
  competitors: SeoRoundCompetitor[]
  documents: SeoRoundDocument[]
}

export type SeoCompetitor = {
  name: string
  profile: Record<string, unknown>
  categories: object[]
  clusters: object[]
  comparisons: object[]
  examples: object[]
  folders: object[]
  items: object[]
  audiences: object[]
  documents: SeoRoundDocument[]
}
