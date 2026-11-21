import { SeoRoundStatus, SeoTool, SeoWarningCheck } from '@/api/models/seo'

export const SEO_TOOL_LABELS: Record<SeoTool, string> = {
  [SeoTool.CLAUDE_CODE]: 'Claude Code',
  [SeoTool.GROK_BOT]: 'Grok Bot',
}

export const SEO_STATUS_LABELS: Record<SeoRoundStatus, string> = {
  [SeoRoundStatus.COMPLETE]: 'completa',
  [SeoRoundStatus.PARTIAL]: 'parcial',
}

export const SEO_WARNING_LABELS: Record<SeoWarningCheck, string> = {
  [SeoWarningCheck.PAGE_TYPE_SUM]: 'Soma dos tipos de página',
  [SeoWarningCheck.AUDIENCE_SHARE]: 'Fatias de público',
}
