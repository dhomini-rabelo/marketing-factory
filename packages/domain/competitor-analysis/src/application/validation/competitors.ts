import { FieldErrorCode, FieldIssue } from '@domain/projects'
import { CompetitorAnalysisErrorCode } from '@domain/competitor-analysis/application/errors/competitor-analysis-error-code'
import {
  checkItemsLimit,
  checkOption,
  checkOptionalUrl,
  checkTextField,
  validateFieldIssues,
} from '@domain/competitor-analysis/application/validation/field-issues'
import { CompetitorRole, normalizeCompetitorName } from '@domain/competitor-analysis/enterprise/entities/competitor'

export const COMPETITORS_MIN_ITEMS = 1
export const COMPETITORS_MAX_ITEMS = 15
export const COMPETITOR_NAME_MAX_LENGTH = 120
export const COMPETITOR_PROFILE_MAX_LENGTH = 300
export const COMPETITOR_RATIONALE_MAX_LENGTH = 500

export type CompetitorInput = {
  name: string
  role: string
  marketFocus: string
  services: string
  features: string
  audience: string
  rationale: string
  url?: string | null
}

export function validateCompetitorsInput(input: { competitors: CompetitorInput[] }): void {
  validateFieldIssues([
    checkCompetitorsCount(input.competitors.length),
    ...input.competitors.flatMap((competitor, position) => checkCompetitor(competitor, position)),
    ...checkDuplicatedNames(input.competitors),
  ])
}

function checkCompetitorsCount(count: number): FieldIssue | null {
  if (count < COMPETITORS_MIN_ITEMS) {
    return { field: 'competitors', code: FieldErrorCode.REQUIRED }
  }

  return checkItemsLimit({ field: 'competitors', count, maxItems: COMPETITORS_MAX_ITEMS })
}

function checkCompetitor(competitor: CompetitorInput, position: number): (FieldIssue | null)[] {
  const prefix = `competitors[${position}]`
  const profileFields = ['marketFocus', 'services', 'features', 'audience'] as const

  return [
    checkTextField({
      field: `${prefix}.name`,
      value: competitor.name,
      maxLength: COMPETITOR_NAME_MAX_LENGTH,
    }),
    checkOption({
      field: `${prefix}.role`,
      value: competitor.role,
      options: Object.values(CompetitorRole),
    }),
    ...profileFields.map((profileField) =>
      checkTextField({
        field: `${prefix}.${profileField}`,
        value: competitor[profileField],
        maxLength: COMPETITOR_PROFILE_MAX_LENGTH,
      }),
    ),
    checkTextField({
      field: `${prefix}.rationale`,
      value: competitor.rationale,
      maxLength: COMPETITOR_RATIONALE_MAX_LENGTH,
    }),
    checkOptionalUrl({ field: `${prefix}.url`, value: competitor.url }),
  ]
}

function checkDuplicatedNames(competitors: CompetitorInput[]): FieldIssue[] {
  const seenNames = new Set<string>()
  const issues: FieldIssue[] = []

  competitors.forEach((competitor, position) => {
    const normalizedName = normalizeCompetitorName(competitor.name)

    if (normalizedName.length === 0) {
      return
    }

    if (seenNames.has(normalizedName)) {
      issues.push({
        field: `competitors[${position}].name`,
        code: CompetitorAnalysisErrorCode.DUPLICATED_NAME,
      })
    }

    seenNames.add(normalizedName)
  })

  return issues
}
