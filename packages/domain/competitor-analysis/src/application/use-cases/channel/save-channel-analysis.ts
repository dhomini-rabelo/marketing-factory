import { UseCase, createID } from '@domain/base'
import type { CompetitorAnalysisRepos } from '@domain/competitor-analysis/application/types/repositories'
import {
  ChannelAnalysisInput,
  FindingInput,
  validateChannelAnalysisInput,
} from '@domain/competitor-analysis/application/validation/channel-analysis'
import { resolveChannel } from '@domain/competitor-analysis/application/use-cases/channel/resolve-channel'
import {
  ChannelAnalysis,
  Finding,
  FindingAspect,
  FindingKind,
} from '@domain/competitor-analysis/enterprise/entities/channel-analysis'
import { getNow } from '@modules/utils'

interface Payload extends ChannelAnalysisInput {
  projectId: string
  channel: string
}

type Response = { analysis: ChannelAnalysis; wasCreated: boolean }

export class SaveChannelAnalysisUseCase implements UseCase<Payload, Response> {
  constructor(private readonly repos: Pick<CompetitorAnalysisRepos, 'project' | 'channelAnalysis'>) {}

  async execute(payload: Payload): Promise<Response> {
    const projectId = createID(payload.projectId)

    await this.repos.project.getOrThrow(projectId)
    const channel = resolveChannel(payload.channel)
    validateChannelAnalysisInput(payload)

    const analysis = ChannelAnalysis.create({
      projectId,
      channel,
      score: payload.score,
      rationale: payload.rationale.trim(),
      bestContent: {
        type: payload.bestContent.type.trim(),
        evidence: payload.bestContent.evidence.trim(),
        basis: payload.bestContent.basis as FindingKind,
      },
      findings: payload.findings.map((finding) => this.buildFinding(finding)),
      collectedAt: getNow(),
    })

    return this.repos.channelAnalysis.replaceForChannel(analysis)
  }

  private buildFinding(finding: FindingInput): Finding {
    return {
      competitor: finding.competitor.trim(),
      aspect: finding.aspect as FindingAspect,
      kind: finding.kind as FindingKind,
      statement: finding.statement.trim(),
      url: this.trimToNull(finding.url),
      excerpt: this.trimToNull(finding.excerpt),
      tool: this.trimToNull(finding.tool),
    }
  }

  private trimToNull(value: string | null | undefined): string | null {
    const trimmedValue = value?.trim()

    return trimmedValue ? trimmedValue : null
  }
}
