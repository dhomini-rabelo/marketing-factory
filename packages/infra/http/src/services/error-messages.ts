import { CompetitorAnalysisErrorCode } from '@domain/competitor-analysis'
import { FieldErrorCode, FieldIssue } from '@domain/projects'

const BODY_FIELD = 'body'

export type FieldIssueHttp = { field: string; code: string; message: string }

export function describeFieldIssue(issue: FieldIssue): FieldIssueHttp {
  return { field: issue.field, code: issue.code, message: buildFieldMessage(issue) }
}

export function describeFieldIssues(issues: FieldIssue[]): string {
  return `Invalid fields: ${issues.map((issue) => issue.field).join(', ')}`
}

export function describeNotFound(code: string, variables?: string[]): string {
  const messages: Record<string, string> = {
    PROJECT_NOT_FOUND: 'Project not found',
    DOCUMENT_NOT_FOUND: 'Document not found',
    CHANNEL_NOT_FOUND: `Channel not found, use one of: ${variables?.join(', ')}`,
    ANALYSIS_NOT_FOUND: 'Channel analysis not collected yet',
    COMPETITOR_NOT_FOUND: 'Competitor not found in the project list',
  }

  return messages[code] ?? 'Resource not found'
}

export function describeNoActiveCompetitors(): string {
  return 'Approval needs at least one competitor not marked as incorrect'
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

  if (issue.code === FieldErrorCode.INVALID_OPTION && issue.variables?.length) {
    return `${issue.field} has an invalid option, use one of: ${issue.variables.join(', ')}`
  }

  if (issue.code === FieldErrorCode.INVALID_OPTION) {
    return `${issue.field} has an invalid option`
  }

  if (issue.code === CompetitorAnalysisErrorCode.INVALID_URL) {
    return `${issue.field} must be an http or https link`
  }

  if (issue.code === CompetitorAnalysisErrorCode.INVALID_SCORE) {
    return `${issue.field} must be an integer from 0 to 10`
  }

  if (issue.code === CompetitorAnalysisErrorCode.TOO_MANY_ITEMS) {
    return `${issue.field} must have at most ${limit} items`
  }

  if (issue.code === CompetitorAnalysisErrorCode.DUPLICATED_NAME) {
    return `${issue.field} is duplicated in the list`
  }

  if (issue.code === FieldErrorCode.INVALID_TITLE) {
    return `${issue.field} must contain letters or numbers`
  }

  return `${issue.field} is invalid`
}
