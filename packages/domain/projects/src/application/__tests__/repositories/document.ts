import { DangerErrors, DomainError, ID } from '@domain/base'
import { DocumentRepository } from '@domain/projects/application/repositories/document'
import { Document, DocumentSummary } from '@domain/projects/enterprise/entities/document'

export class InMemoryDocumentRepository extends DocumentRepository {
  public items: Document[] = []

  async saveByTitle(document: Document): Promise<{ document: Document; wasCreated: boolean }> {
    const existing = this.items.find((item) => this.isSameDocument(item, document))

    if (!existing) {
      this.items.push(document)
      return { document, wasCreated: true }
    }

    const updated = Document.reference(existing.id, {
      ...document.props,
      createdAt: existing.props.createdAt,
    })
    this.items[this.items.indexOf(existing)] = updated

    return { document: updated, wasCreated: false }
  }

  async listSummaries(projectId: ID): Promise<DocumentSummary[]> {
    return this.items
      .filter((item) => item.props.projectId.isEqual(projectId))
      .sort((first, second) => second.props.updatedAt.getTime() - first.props.updatedAt.getTime())
      .map((item) => ({
        id: item.id,
        projectId: item.props.projectId,
        slug: item.props.slug,
        title: item.props.title,
        description: item.props.description,
        createdAt: item.props.createdAt,
        updatedAt: item.props.updatedAt,
      }))
  }

  async getOrThrow(input: { projectId: ID; slug: string }): Promise<Document> {
    const document = this.items.find(
      (item) => item.props.projectId.isEqual(input.projectId) && item.props.slug === input.slug,
    )

    if (!document) {
      throw new DomainError({ code: 'DOCUMENT_NOT_FOUND', errorType: DangerErrors.NOT_FOUND })
    }

    return document
  }

  private isSameDocument(first: Document, second: Document): boolean {
    return first.props.projectId.isEqual(second.props.projectId) && first.props.slug === second.props.slug
  }
}
