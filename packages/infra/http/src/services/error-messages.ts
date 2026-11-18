import { FieldErrorCode, FieldIssue } from '@domain/projects'

const BODY_FIELD = 'body'

export type FieldIssueHttp = { field: string; code: string; message: string }

export function describeFieldIssue(issue: FieldIssue): FieldIssueHttp {
  return { field: issue.field, code: issue.code, message: buildFieldMessage(issue) }
}

export function describeFieldIssues(issues: FieldIssue[]): string {
  return `Invalid fields: ${issues.map((issue) => issue.field).join(', ')}`
}

export function describeNotFound(code: string): string {
  const messages: Record<string, string> = {
    PROJECT_NOT_FOUND: 'Project not found',
    DOCUMENT_NOT_FOUND: 'Document not found',
  }

  return messages[code] ?? 'Resource not found'
}

function buildFieldMessage(issue: FieldIssue): string {
  const limit = issue.variables?.[0]

  if (issue.code === FieldErrorCode.REQUIRED) {
    return `${issue.field} is required`
  }

  if (issue.code === FieldErrorCode.TOO_LONG && issue.field === BODY_FIELD) {
    return `${issue.field} must have at most ${limit} characters, split the content into smaller documents`
  }

  if (issue.code === FieldErrorCode.TOO_LONG) {
    return `${issue.field} must have at most ${limit} characters`
  }

  if (issue.code === FieldErrorCode.INVALID_OPTION) {
    return `${issue.field} has an invalid option`
  }

  if (issue.code === FieldErrorCode.INVALID_TITLE) {
    return `${issue.field} must contain letters or numbers`
  }

  return `${issue.field} is invalid`
}
