import { ID } from '@domain/base'
import { ChannelAnalysisRepository } from '@domain/competitor-analysis/application/repositories/channel-analysis'
import {
  Channel,
  ChannelAnalysis,
} from '@domain/competitor-analysis/enterprise/entities/channel-analysis'

export class InMemoryChannelAnalysisRepository extends ChannelAnalysisRepository {
  public items: ChannelAnalysis[] = []

  async replaceForChannel(
    analysis: ChannelAnalysis,
  ): Promise<{ analysis: ChannelAnalysis; wasCreated: boolean }> {
    const existing = this.items.find((item) => this.isSameChannel(item, analysis))

    if (!existing) {
      this.items.push(analysis)
      return { analysis, wasCreated: true }
    }

    const replaced = ChannelAnalysis.reference(existing.id, analysis.props)
    this.items[this.items.indexOf(existing)] = replaced

    return { analysis: replaced, wasCreated: false }
  }

  async findByChannel(input: { projectId: ID; channel: Channel }): Promise<ChannelAnalysis | null> {
    const analysis = this.items.find(
      (item) =>
        item.props.projectId.isEqual(input.projectId) && item.props.channel === input.channel,
    )

    return analysis ?? null
  }

  async listCollected(projectId: ID): Promise<ChannelAnalysis[]> {
    return this.items.filter((item) => item.props.projectId.isEqual(projectId))
  }

  private isSameChannel(first: ChannelAnalysis, second: ChannelAnalysis): boolean {
    return (
      first.props.projectId.isEqual(second.props.projectId) &&
      first.props.channel === second.props.channel
    )
  }
}
