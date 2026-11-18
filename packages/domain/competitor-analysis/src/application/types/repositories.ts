import type { ChannelAnalysisRepository } from '@domain/competitor-analysis/application/repositories/channel-analysis'
import type { CompetitorRepository } from '@domain/competitor-analysis/application/repositories/competitor'
import type { ProjectRepository } from '@domain/projects'

export type CompetitorAnalysisRepos = {
  project: ProjectRepository
  channelAnalysis: ChannelAnalysisRepository
  competitor: CompetitorRepository
}
