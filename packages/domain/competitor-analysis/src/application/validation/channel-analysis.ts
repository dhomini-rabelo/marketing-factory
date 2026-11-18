import { FieldIssue } from '@domain/projects'
import { CompetitorAnalysisErrorCode } from '@domain/competitor-analysis/application/errors/competitor-analysis-error-code'
import {
  checkItemsLimit,
  checkOptionalText,
  checkOptionalUrl,
  checkOption,
  checkRequiredWhen,
  checkTextField,
  validateFieldIssues,
} from '@domain/competitor-analysis/application/validation/field-issues'
import { FindingAspect, FindingKind } from '@domain/competitor-analysis/enterprise/entities/channel-analysis'

export const CHANNEL_SCORE_MIN = 0
export const CHANNEL_SCORE_MAX = 10
export const CHANNEL_RATIONALE_MAX_LENGTH = 1000
export const BEST_CONTENT_TYPE_MAX_LENGTH = 200
export const BEST_CONTENT_EVIDENCE_MAX_LENGTH = 500
export const FINDING_COMPETITOR_MAX_LENGTH = 120
export const FINDING_STATEMENT_MAX_LENGTH = 300
export const FINDING_EXCERPT_MAX_LENGTH = 500
export const FINDING_TOOL_MAX_LENGTH = 100
export const FINDINGS_MAX_ITEMS = 30

export type FindingInput = {
  competitor: string
  aspect: string
  kind: string
  statement: string
  url?: string | null
  excerpt?: string | null
  tool?: string | null
}

export type ChannelAnalysisInput = {
  score: number
  rationale: string
  bestContent: {
    type: string
    evidence: string
    basis: string
  }
  findings: FindingInput[]
}

export function validateChannelAnalysisInput(input: ChannelAnalysisInput): void {
  validateFieldIssues([
    checkScore(input.score),
    checkTextField({
      field: 'rationale',
      value: input.rationale,
      maxLength: CHANNEL_RATIONALE_MAX_LENGTH,
    }),
    checkTextField({
      field: 'bestContent.type',
      value: input.bestContent.type,
      maxLength: BEST_CONTENT_TYPE_MAX_LENGTH,
    }),
    checkTextField({
      field: 'bestContent.evidence',
      value: input.bestContent.evidence,
      maxLength: BEST_CONTENT_EVIDENCE_MAX_LENGTH,
    }),
    checkOption({
      field: 'bestContent.basis',
      value: input.bestContent.basis,
      options: Object.values(FindingKind),
    }),
    checkItemsLimit({
      field: 'findings',
      count: input.findings.length,
      maxItems: FINDINGS_MAX_ITEMS,
    }),
    ...input.findings.flatMap((finding, position) => checkFinding(finding, position)),
  ])
}

export function checkScore(score: number): FieldIssue | null {
  const isValidScore =
    Number.isInteger(score) && score >= CHANNEL_SCORE_MIN && score <= CHANNEL_SCORE_MAX

  if (isValidScore) {
    return null
  }

  return {
    field: 'score',
    code: CompetitorAnalysisErrorCode.INVALID_SCORE,
    variables: [String(CHANNEL_SCORE_MIN), String(CHANNEL_SCORE_MAX)],
  }
}

function checkFinding(finding: FindingInput, position: number): (FieldIssue | null)[] {
  const prefix = `findings[${position}]`
  const isFact = finding.kind === FindingKind.FACT

  return [
    checkTextField({
      field: `${prefix}.competitor`,
      value: finding.competitor,
      maxLength: FINDING_COMPETITOR_MAX_LENGTH,
    }),
    checkOption({
      field: `${prefix}.aspect`,
      value: finding.aspect,
      options: Object.values(FindingAspect),
    }),
    checkOption({
      field: `${prefix}.kind`,
      value: finding.kind,
      options: Object.values(FindingKind),
    }),
    checkTextField({
      field: `${prefix}.statement`,
      value: finding.statement,
      maxLength: FINDING_STATEMENT_MAX_LENGTH,
    }),
    checkRequiredWhen({ field: `${prefix}.url`, value: finding.url, isRequired: isFact }),
    checkOptionalUrl({ field: `${prefix}.url`, value: finding.url }),
    checkRequiredWhen({ field: `${prefix}.excerpt`, value: finding.excerpt, isRequired: isFact }),
    checkOptionalText({
      field: `${prefix}.excerpt`,
      value: finding.excerpt,
      maxLength: FINDING_EXCERPT_MAX_LENGTH,
    }),
    checkRequiredWhen({ field: `${prefix}.tool`, value: finding.tool, isRequired: isFact }),
    checkOptionalText({
      field: `${prefix}.tool`,
      value: finding.tool,
      maxLength: FINDING_TOOL_MAX_LENGTH,
    }),
  ]
}
