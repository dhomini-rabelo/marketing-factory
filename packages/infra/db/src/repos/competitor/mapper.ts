import { createID } from '@domain/base'
import {
  Competitor,
  CompetitorApproval,
  CompetitorRole,
  normalizeCompetitorName,
} from '@domain/competitor-analysis'
import { toEnumMember } from '@infra/db/repos/_base/enum-member'

export type CompetitorRecord = {
  id: string
  projectId: string
  normalizedName: string
  name: string
  role: string
  marketFocus: string
  services: string
  features: string
  audience: string
  rationale: string
  url: string | null
  incorrect: number
  position: number
  qualifiedAt: string
}

export class CompetitorMapper {
  static toPersistence(competitor: Competitor, position: number): CompetitorRecord {
    const { props } = competitor

    return {
      id: competitor.id.toValue(),
      projectId: props.projectId.toValue(),
      normalizedName: normalizeCompetitorName(props.name),
      name: props.name,
      role: props.role,
      marketFocus: props.marketFocus,
      services: props.services,
      features: props.features,
      audience: props.audience,
      rationale: props.rationale,
      url: props.url,
      incorrect: props.incorrect ? 1 : 0,
      position,
      qualifiedAt: props.qualifiedAt.toISOString(),
    }
  }

  static toDomain(record: CompetitorRecord): Competitor {
    return Competitor.reference(createID(record.id), {
      projectId: createID(record.projectId),
      name: record.name,
      role: toEnumMember(CompetitorRole, record.role),
      marketFocus: record.marketFocus,
      services: record.services,
      features: record.features,
      audience: record.audience,
      rationale: record.rationale,
      url: record.url,
      incorrect: record.incorrect === 1,
      qualifiedAt: new Date(record.qualifiedAt),
    })
  }

  static toApproval(value: string): CompetitorApproval {
    return toEnumMember(CompetitorApproval, value)
  }
}
