import type { Serialize, WithID } from '@domain/base'
import type { Competitor, CompetitorProps } from '@domain/competitor-analysis'

export type CompetitorHttp = Omit<Serialize<WithID<CompetitorProps>>, 'projectId'>

export class CompetitorPresenter {
  static toHttp(competitor: Competitor): CompetitorHttp {
    return {
      id: competitor.id.toValue(),
      name: competitor.props.name,
      role: competitor.props.role,
      marketFocus: competitor.props.marketFocus,
      services: competitor.props.services,
      features: competitor.props.features,
      audience: competitor.props.audience,
      rationale: competitor.props.rationale,
      url: competitor.props.url,
      incorrect: competitor.props.incorrect,
      qualifiedAt: competitor.props.qualifiedAt.toISOString(),
    }
  }
}
