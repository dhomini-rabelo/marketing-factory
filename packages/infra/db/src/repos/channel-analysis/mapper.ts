import { createID } from '@domain/base'
import {
  BestContent,
  Channel,
  ChannelAnalysis,
  Finding,
  FindingAspect,
  FindingKind,
} from '@domain/competitor-analysis'
import { toEnumMember } from '@infra/db/repos/_base/enum-member'

export type ChannelAnalysisRecord = {
  id: string
  projectId: string
  channel: string
  score: number
  rationale: string
  bestContentType: string
  bestContentEvidence: string
  bestContentBasis: string
  collectedAt: string
}

export type ChannelFindingRecord = {
  projectId: string
  channel: string
  position: number
  competitor: string
  aspect: string
  kind: string
  statement: string
  url: string | null
  excerpt: string | null
  tool: string | null
}

export class ChannelAnalysisMapper {
  static toPersistence(analysis: ChannelAnalysis): {
    analysis: ChannelAnalysisRecord
    findings: ChannelFindingRecord[]
  } {
    const { props } = analysis
    const projectId = props.projectId.toValue()

    return {
      analysis: {
        id: analysis.id.toValue(),
        projectId,
        channel: props.channel,
        score: props.score,
        rationale: props.rationale,
        bestContentType: props.bestContent.type,
        bestContentEvidence: props.bestContent.evidence,
        bestContentBasis: props.bestContent.basis,
        collectedAt: props.collectedAt.toISOString(),
      },
      findings: props.findings.map((finding, position) => ({
        projectId,
        channel: props.channel,
        position,
        competitor: finding.competitor,
        aspect: finding.aspect,
        kind: finding.kind,
        statement: finding.statement,
        url: finding.url,
        excerpt: finding.excerpt,
        tool: finding.tool,
      })),
    }
  }

  static toDomain(input: {
    analysis: ChannelAnalysisRecord
    findings: ChannelFindingRecord[]
  }): ChannelAnalysis {
    const { analysis, findings } = input
    const bestContent: BestContent = {
      type: analysis.bestContentType,
      evidence: analysis.bestContentEvidence,
      basis: toEnumMember(FindingKind, analysis.bestContentBasis),
    }

    return ChannelAnalysis.reference(createID(analysis.id), {
      projectId: createID(analysis.projectId),
      channel: toEnumMember(Channel, analysis.channel),
      score: analysis.score,
      rationale: analysis.rationale,
      bestContent,
      findings: findings.map((finding) => ChannelAnalysisMapper.toFinding(finding)),
      collectedAt: new Date(analysis.collectedAt),
    })
  }

  private static toFinding(record: ChannelFindingRecord): Finding {
    return {
      competitor: record.competitor,
      aspect: toEnumMember(FindingAspect, record.aspect),
      kind: toEnumMember(FindingKind, record.kind),
      statement: record.statement,
      url: record.url,
      excerpt: record.excerpt,
      tool: record.tool,
    }
  }
}
