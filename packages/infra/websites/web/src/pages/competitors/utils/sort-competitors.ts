import { CompetitorRole, type Competitor } from '@/api/models/competitor'

export type SortedCompetitors = {
  active: Competitor[]
  marked: Competitor[]
  mainCount: number
  secondaryCount: number
}

export function sortCompetitors(competitors: Competitor[]): SortedCompetitors {
  const marked = competitors.filter((competitor) => competitor.incorrect)
  const activeCompetitors = competitors.filter((competitor) => !competitor.incorrect)
  const main = activeCompetitors.filter((competitor) => competitor.role === CompetitorRole.MAIN)
  const secondary = activeCompetitors.filter((competitor) => competitor.role === CompetitorRole.SECONDARY)

  return {
    active: [...main, ...secondary],
    marked,
    mainCount: main.length,
    secondaryCount: secondary.length,
  }
}
