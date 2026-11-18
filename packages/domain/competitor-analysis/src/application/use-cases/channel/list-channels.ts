import { UseCase, createID } from '@domain/base'
import type { CompetitorAnalysisRepos } from '@domain/competitor-analysis/application/types/repositories'
import {
  CHANNEL_ORDER,
  Channel,
  ChannelAnalysis,
  isPartialChannel,
} from '@domain/competitor-analysis/enterprise/entities/channel-analysis'

interface Payload {
  projectId: string
}

export type ChannelSummary = {
  channel: Channel
  partial: boolean
  collected: boolean
  score: number | null
  collectedAt: Date | null
}

type Response = ChannelSummary[]

export class ListChannelsUseCase implements UseCase<Payload, Response> {
  constructor(private readonly repos: Pick<CompetitorAnalysisRepos, 'project' | 'channelAnalysis'>) {}

  async execute(payload: Payload): Promise<Response> {
    const projectId = createID(payload.projectId)

    await this.repos.project.getOrThrow(projectId)
    const collectedAnalyses = await this.repos.channelAnalysis.listCollected(projectId)

    const collected = this.sortCollected(collectedAnalyses).map((analysis) =>
      this.buildCollectedSummary(analysis),
    )
    const notCollected = this.listNotCollected(collectedAnalyses).map((channel) =>
      this.buildNotCollectedSummary(channel),
    )

    return [...collected, ...notCollected]
  }

  private sortCollected(analyses: ChannelAnalysis[]): ChannelAnalysis[] {
    return [...analyses].sort((first, second) => {
      const scoreDifference = second.props.score - first.props.score

      return (
        scoreDifference ||
        CHANNEL_ORDER.indexOf(first.props.channel) - CHANNEL_ORDER.indexOf(second.props.channel)
      )
    })
  }

  private listNotCollected(analyses: ChannelAnalysis[]): Channel[] {
    const collectedChannels = analyses.map((analysis) => analysis.props.channel)

    return CHANNEL_ORDER.filter((channel) => !collectedChannels.includes(channel))
  }

  private buildCollectedSummary(analysis: ChannelAnalysis): ChannelSummary {
    return {
      channel: analysis.props.channel,
      partial: isPartialChannel(analysis.props.channel),
      collected: true,
      score: analysis.props.score,
      collectedAt: analysis.props.collectedAt,
    }
  }

  private buildNotCollectedSummary(channel: Channel): ChannelSummary {
    return {
      channel,
      partial: isPartialChannel(channel),
      collected: false,
      score: null,
      collectedAt: null,
    }
  }
}
