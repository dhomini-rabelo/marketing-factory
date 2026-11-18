import { createID } from '@domain/base'
import { some } from '@domain/competitor-analysis/application/__tests__/utils/some'
import {
  Channel,
  ChannelAnalysis,
  ChannelAnalysisProps,
  Finding,
  FindingAspect,
  FindingKind,
} from '@domain/competitor-analysis/enterprise/entities/channel-analysis'

export function makeFinding(overrides: Partial<Finding> = {}): Finding {
  return {
    competitor: some.name(),
    aspect: some.valueBetween(...Object.values(FindingAspect)),
    kind: FindingKind.HYPOTHESIS,
    statement: some.string(),
    url: null,
    excerpt: null,
    tool: null,
    ...overrides,
  }
}

export function makeChannelAnalysis(
  overrides: Partial<ChannelAnalysisProps> = {},
): ChannelAnalysis {
  return ChannelAnalysis.create({
    projectId: createID(),
    channel: some.valueBetween(...Object.values(Channel)),
    score: some.valueBetween(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10),
    rationale: some.string(),
    bestContent: {
      type: some.string(),
      evidence: some.string(),
      basis: FindingKind.HYPOTHESIS,
    },
    findings: [makeFinding()],
    collectedAt: new Date(),
    ...overrides,
  })
}
