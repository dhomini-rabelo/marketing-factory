import { FieldErrorCode, FieldIssue, FieldsValidationError } from '@domain/projects'
import { CompetitorAnalysisErrorCode } from '@domain/competitor-analysis/application/errors/competitor-analysis-error-code'

const ALLOWED_URL_PROTOCOLS = ['http:', 'https:']

export function checkTextField(input: {
  field: string
  value: string
  maxLength: number
}): FieldIssue | null {
  const trimmedValue = input.value.trim()

  if (trimmedValue.length === 0) {
    return { field: input.field, code: FieldErrorCode.REQUIRED }
  }

  return checkMaxLength(input)
}

export function checkMaxLength(input: {
  field: string
  value: string
  maxLength: number
}): FieldIssue | null {
  if (input.value.trim().length > input.maxLength) {
    return {
      field: input.field,
      code: FieldErrorCode.TOO_LONG,
      variables: [String(input.maxLength)],
    }
  }

  return null
}

export function checkOption(input: {
  field: string
  value: string
  options: string[]
}): FieldIssue | null {
  if (input.options.includes(input.value)) {
    return null
  }

  return { field: input.field, code: FieldErrorCode.INVALID_OPTION, variables: input.options }
}

export function checkUrl(input: { field: string; value: string }): FieldIssue | null {
  const invalidUrlIssue = { field: input.field, code: CompetitorAnalysisErrorCode.INVALID_URL }

  try {
    const url = new URL(input.value.trim())

    return ALLOWED_URL_PROTOCOLS.includes(url.protocol) ? null : invalidUrlIssue
  } catch {
    return invalidUrlIssue
  }
}

export function checkOptionalText(input: {
  field: string
  value: string | null | undefined
  maxLength: number
}): FieldIssue | null {
  if (isBlank(input.value)) {
    return null
  }

  return checkMaxLength({ field: input.field, value: input.value, maxLength: input.maxLength })
}

export function checkOptionalUrl(input: {
  field: string
  value: string | null | undefined
}): FieldIssue | null {
  if (isBlank(input.value)) {
    return null
  }

  return checkUrl({ field: input.field, value: input.value })
}

export function checkRequiredWhen(input: {
  field: string
  value: string | null | undefined
  isRequired: boolean
}): FieldIssue | null {
  if (input.isRequired && isBlank(input.value)) {
    return { field: input.field, code: FieldErrorCode.REQUIRED }
  }

  return null
}

export function checkItemsLimit(input: {
  field: string
  count: number
  maxItems: number
}): FieldIssue | null {
  if (input.count > input.maxItems) {
    return {
      field: input.field,
      code: CompetitorAnalysisErrorCode.TOO_MANY_ITEMS,
      variables: [String(input.maxItems)],
    }
  }

  return null
}

export function validateFieldIssues(candidates: (FieldIssue | null)[]): void {
  const issues = candidates.filter((issue): issue is FieldIssue => issue !== null)

  if (issues.length > 0) {
    throw new FieldsValidationError(issues)
  }
}

function isBlank(value: string | null | undefined): value is null | undefined {
  return value === null || value === undefined || value.trim().length === 0
}
