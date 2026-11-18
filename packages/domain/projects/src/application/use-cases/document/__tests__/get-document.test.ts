import { beforeEach, describe, expect, it } from 'vitest'
import { createID } from '@domain/base'
import { makeDocument } from '@domain/projects/application/__tests__/factories/document'
import { makeProject } from '@domain/projects/application/__tests__/factories/project'
import { InMemoryDocumentRepository } from '@domain/projects/application/__tests__/repositories/document'
import { InMemoryProjectRepository } from '@domain/projects/application/__tests__/repositories/project'
import { some } from '@domain/projects/application/__tests__/utils/some'
import { GetDocumentUseCase } from '@domain/projects/application/use-cases/document/get-document'

describe('GetDocumentUseCase', () => {
  let projectRepository: InMemoryProjectRepository
  let documentRepository: InMemoryDocumentRepository
  let sut: GetDocumentUseCase

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository()
    documentRepository = new InMemoryDocumentRepository()
    sut = new GetDocumentUseCase({ project: projectRepository, document: documentRepository })
  })

  it('returns title, description and body of an existing document', async () => {
    const project = makeProject()
    await projectRepository.create(project)
    const document = makeDocument({ projectId: project.id })
    documentRepository.items.push(document)

    const result = await sut.execute({
      projectId: project.id.toValue(),
      slug: document.props.slug,
    })

    expect(result.props.title).toBe(document.props.title)
    expect(result.props.description).toBe(document.props.description)
    expect(result.props.body).toBe(document.props.body)
  })

  it('refuses an unknown document with DOCUMENT_NOT_FOUND', async () => {
    const project = makeProject()
    await projectRepository.create(project)

    await expect(
      sut.execute({ projectId: project.id.toValue(), slug: some.string() }),
    ).rejects.toMatchObject({ response: { code: 'DOCUMENT_NOT_FOUND' } })
  })

  it('refuses an unknown project with PROJECT_NOT_FOUND', async () => {
    await expect(
      sut.execute({ projectId: createID().toValue(), slug: some.string() }),
    ).rejects.toMatchObject({ response: { code: 'PROJECT_NOT_FOUND' } })
  })
})
