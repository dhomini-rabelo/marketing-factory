import { FieldErrorCode, FieldIssue } from '@domain/projects/application/errors/fields-validation-error'
import { checkTextField, validateFieldIssues } from '@domain/projects/application/validation/field-issues'
import { buildDocumentSlug } from '@domain/projects/application/use-cases/document/save-document/build-document-slug'

export const DOCUMENT_TITLE_MAX_LENGTH = 120
export const DOCUMENT_DESCRIPTION_MAX_LENGTH = 300
export const DOCUMENT_BODY_MAX_LENGTH = 100000

export function validateDocumentFields(input: {
  title: string
  description: string
  body: string
}): void {
  validateFieldIssues([
    checkDocumentTitle(input.title),
    checkTextField({
      field: 'description',
      value: input.description,
      maxLength: DOCUMENT_DESCRIPTION_MAX_LENGTH,
    }),
    checkTextField({ field: 'body', value: input.body, maxLength: DOCUMENT_BODY_MAX_LENGTH }),
  ])
}

function checkDocumentTitle(title: string): FieldIssue | null {
  const textIssue = checkTextField({
    field: 'title',
    value: title,
    maxLength: DOCUMENT_TITLE_MAX_LENGTH,
  })
  const isSlugEmpty = buildDocumentSlug(title).length === 0

  if (textIssue) {
    return textIssue
  }

  return isSlugEmpty ? { field: 'title', code: FieldErrorCode.INVALID_TITLE } : null
}
