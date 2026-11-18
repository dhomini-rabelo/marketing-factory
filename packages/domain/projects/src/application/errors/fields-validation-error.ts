export enum FieldErrorCode {
  REQUIRED = 'REQUIRED',
  TOO_LONG = 'TOO_LONG',
  INVALID_OPTION = 'INVALID_OPTION',
  INVALID_TITLE = 'INVALID_TITLE',
}

export type FieldIssue = {
  field: string
  code: string
  variables?: string[]
}

export class FieldsValidationError extends Error {
  constructor(public readonly fields: FieldIssue[]) {
    super(`FieldsValidationError ${fields.map((issue) => `${issue.field}:${issue.code}`).join(', ')}`)
  }
}
