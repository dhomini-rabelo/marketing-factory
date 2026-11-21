import { CompetitorRole } from '@/api/models/competitor'
import type { SeoRoundCompetitor } from '@/api/models/seo'

export function sortSeoCompetitors(competitors: SeoRoundCompetitor[]): SeoRoundCompetitor[] {
  const main = competitors.filter((competitor) => competitor.role === CompetitorRole.MAIN)
  const secondary = competitors.filter((competitor) => competitor.role !== CompetitorRole.MAIN)
  return [...main, ...secondary]
}
