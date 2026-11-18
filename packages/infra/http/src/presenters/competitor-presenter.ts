import type { Competitor } from '@domain/competitor-analysis'

export type CompetitorHttp = {
  id: string
  name: string
  role: string
  marketFocus: string
  services: string
  features: string
  audience: string
  rationale: string
  url: string | null
  incorrect: boolean
  qualifiedAt: string
}

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
