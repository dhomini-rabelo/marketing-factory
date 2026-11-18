import { DangerErrors, DomainError, UseCase, createID } from '@domain/base'
import type { CompetitorAnalysisRepos } from '@domain/competitor-analysis/application/types/repositories'
import { resolveChannel } from '@domain/competitor-analysis/application/use-cases/channel/resolve-channel'
import { ChannelAnalysis } from '@domain/competitor-analysis/enterprise/entities/channel-analysis'

interface Payload {
  projectId: string
  channel: string
}

type Response = ChannelAnalysis

export class GetChannelAnalysisUseCase implements UseCase<Payload, Response> {
  constructor(private readonly repos: Pick<CompetitorAnalysisRepos, 'project' | 'channelAnalysis'>) {}

  async execute(payload: Payload): Promise<Response> {
    const projectId = createID(payload.projectId)

    await this.repos.project.getOrThrow(projectId)
    const channel = resolveChannel(payload.channel)

    const analysis = await this.repos.channelAnalysis.findByChannel({ projectId, channel })

    if (!analysis) {
      throw new DomainError({ code: 'ANALYSIS_NOT_FOUND', errorType: DangerErrors.NOT_FOUND })
    }

    return analysis
  }
}
