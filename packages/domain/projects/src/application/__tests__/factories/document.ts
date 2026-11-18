import { createID } from '@domain/base'
import { some } from '@domain/projects/application/__tests__/utils/some'
import { buildDocumentSlug } from '@domain/projects/application/use-cases/document/save-document/build-document-slug'
import { Document, DocumentProps } from '@domain/projects/enterprise/entities/document'

export function makeDocument(overrides: Partial<DocumentProps> = {}): Document {
  const title = overrides.title ?? some.string()

  return Document.create({
    projectId: createID(),
    slug: buildDocumentSlug(title),
    title,
    description: some.string(),
    body: some.string(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })
}
