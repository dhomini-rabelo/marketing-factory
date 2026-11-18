import { ID } from '@domain/base'
import {
  Channel,
  ChannelAnalysis,
} from '@domain/competitor-analysis/enterprise/entities/channel-analysis'

export abstract class ChannelAnalysisRepository {
  abstract replaceForChannel(
    analysis: ChannelAnalysis,
  ): Promise<{ analysis: ChannelAnalysis; wasCreated: boolean }>
  abstract findByChannel(input: { projectId: ID; channel: Channel }): Promise<ChannelAnalysis | null>
  abstract listCollected(projectId: ID): Promise<ChannelAnalysis[]>
}
