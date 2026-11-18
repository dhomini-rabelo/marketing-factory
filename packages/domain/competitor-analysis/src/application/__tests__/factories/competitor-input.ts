import { some } from '@domain/competitor-analysis/application/__tests__/utils/some'
import { CompetitorInput } from '@domain/competitor-analysis/application/validation/competitors'
import { CompetitorRole } from '@domain/competitor-analysis/enterprise/entities/competitor'

export function makeCompetitorInput(overrides: Partial<CompetitorInput> = {}): CompetitorInput {
  return {
    name: some.name(),
    role: CompetitorRole.MAIN,
    marketFocus: some.string(),
    services: some.string(),
    features: some.string(),
    audience: some.string(),
    rationale: some.string(),
    url: null,
    ...overrides,
  }
}
