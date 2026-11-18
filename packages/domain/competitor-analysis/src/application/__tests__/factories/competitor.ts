import { createID } from '@domain/base'
import { some } from '@domain/competitor-analysis/application/__tests__/utils/some'
import {
  Competitor,
  CompetitorProps,
  CompetitorRole,
} from '@domain/competitor-analysis/enterprise/entities/competitor'

export function makeCompetitor(overrides: Partial<CompetitorProps> = {}): Competitor {
  return Competitor.create({
    projectId: createID(),
    name: some.name(),
    role: some.valueBetween(...Object.values(CompetitorRole)),
    marketFocus: some.string(),
    services: some.string(),
    features: some.string(),
    audience: some.string(),
    rationale: some.string(),
    url: null,
    incorrect: false,
    qualifiedAt: new Date(),
    ...overrides,
  })
}
