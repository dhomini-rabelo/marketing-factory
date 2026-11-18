import { some } from '@domain/competitor-analysis/application/__tests__/utils/some'
import {
  ChannelAnalysisInput,
  FindingInput,
} from '@domain/competitor-analysis/application/validation/channel-analysis'
import { FindingAspect, FindingKind } from '@domain/competitor-analysis/enterprise/entities/channel-analysis'

export function makeHypothesisFindingInput(overrides: Partial<FindingInput> = {}): FindingInput {
  return {
    competitor: some.name(),
    aspect: some.valueBetween(...Object.values(FindingAspect)),
    kind: FindingKind.HYPOTHESIS,
    statement: some.string(),
    ...overrides,
  }
}

export function makeFactFindingInput(overrides: Partial<FindingInput> = {}): FindingInput {
  return makeHypothesisFindingInput({
    kind: FindingKind.FACT,
    url: 'https://example.com/post',
    excerpt: some.string(),
    tool: 'browser',
    ...overrides,
  })
}

export function makeChannelAnalysisInput(
  overrides: Partial<ChannelAnalysisInput> = {},
): ChannelAnalysisInput {
  return {
    score: 7,
    rationale: some.string(),
    bestContent: {
      type: some.string(),
      evidence: some.string(),
      basis: FindingKind.HYPOTHESIS,
    },
    findings: [makeFactFindingInput(), makeHypothesisFindingInput()],
    ...overrides,
  }
}
