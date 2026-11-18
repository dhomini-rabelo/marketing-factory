import {
  Competitor,
  CompetitorRole,
} from '@domain/competitor-analysis/enterprise/entities/competitor'

const INCORRECT_GROUP_RANK = 2

const ROLE_RANK: Record<CompetitorRole, number> = {
  [CompetitorRole.MAIN]: 0,
  [CompetitorRole.SECONDARY]: 1,
}

export function sortCompetitors(competitors: Competitor[]): Competitor[] {
  return [...competitors].sort((first, second) => getGroupRank(first) - getGroupRank(second))
}

function getGroupRank(competitor: Competitor): number {
  return competitor.props.incorrect ? INCORRECT_GROUP_RANK : ROLE_RANK[competitor.props.role]
}
