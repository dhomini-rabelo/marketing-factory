import type { Serialize } from '@domain/base'
import type {
  ChannelAnalysis,
  ChannelAnalysisProps,
  ChannelSummary,
} from '@domain/competitor-analysis'
import { isPartialChannel } from '@domain/competitor-analysis'
import type { OverWrite } from '@modules/utils'

export type ChannelAnalysisHttp = OverWrite<
  Omit<Serialize<ChannelAnalysisProps>, 'projectId'>,
  { partial: boolean }
>

export type ChannelSummaryHttp = Serialize<ChannelSummary>

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
