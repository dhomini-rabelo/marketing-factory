import type { ChannelAnalysisRepository } from '@domain/competitor-analysis/application/repositories/channel-analysis'
import type { CompetitorRepository } from '@domain/competitor-analysis/application/repositories/competitor'
import type { SeoRoundRepository } from '@domain/competitor-analysis/application/repositories/seo-round'
import type { ProjectRepository } from '@domain/projects'

export type CompetitorAnalysisRepos = {
  project: ProjectRepository
  channelAnalysis: ChannelAnalysisRepository
  competitor: CompetitorRepository
  seoRound: SeoRoundRepository
}
