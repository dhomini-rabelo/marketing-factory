import {
  FieldErrorCode,
  FieldIssue,
  FieldsValidationError,
} from '@domain/projects/application/errors/fields-validation-error'

export function checkTextField(input: {
  field: string
  value: string
  maxLength: number
}): FieldIssue | null {
  const trimmedValue = input.value.trim()
  const isEmpty = trimmedValue.length === 0
  const isTooLong = trimmedValue.length > input.maxLength

  if (isEmpty) {
    return { field: input.field, code: FieldErrorCode.REQUIRED }
  }

  if (isTooLong) {
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
  const isOptionAllowed = input.options.includes(input.value)

  return isOptionAllowed ? null : { field: input.field, code: FieldErrorCode.INVALID_OPTION }
}

export function validateFieldIssues(candidates: (FieldIssue | null)[]): void {
  const issues = candidates.filter((issue): issue is FieldIssue => issue !== null)

  if (issues.length > 0) {
    throw new FieldsValidationError(issues)
  }
}
