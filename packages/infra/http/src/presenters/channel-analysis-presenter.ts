import type { ChannelAnalysis, ChannelSummary, Finding } from '@domain/competitor-analysis'
import { isPartialChannel } from '@domain/competitor-analysis'

export type ChannelAnalysisHttp = {
  channel: string
  partial: boolean
  score: number
  rationale: string
  bestContent: { type: string; evidence: string; basis: string }
  findings: Finding[]
  collectedAt: string
}

export type ChannelSummaryHttp = {
  channel: string
  partial: boolean
  collected: boolean
  score: number | null
  collectedAt: string | null
}

export class ChannelAnalysisPresenter {
  static toHttp(analysis: ChannelAnalysis): ChannelAnalysisHttp {
    return {
      channel: analysis.props.channel,
      partial: isPartialChannel(analysis.props.channel),
      score: analysis.props.score,
      rationale: analysis.props.rationale,
      bestContent: analysis.props.bestContent,
      findings: analysis.props.findings,
      collectedAt: analysis.props.collectedAt.toISOString(),
    }
  }

  static toSummaryHttp(summary: ChannelSummary): ChannelSummaryHttp {
    return {
      channel: summary.channel,
      partial: summary.partial,
      collected: summary.collected,
      score: summary.score,
      collectedAt: summary.collectedAt?.toISOString() ?? null,
    }
  }
}
