import { beforeEach, describe, expect, it } from 'vitest'
import { createID } from '@domain/base'
import { makeDocument } from '@domain/projects/application/__tests__/factories/document'
import { makeProject } from '@domain/projects/application/__tests__/factories/project'
import { InMemoryDocumentRepository } from '@domain/projects/application/__tests__/repositories/document'
import { InMemoryProjectRepository } from '@domain/projects/application/__tests__/repositories/project'
import { ListDocumentsUseCase } from '@domain/projects/application/use-cases/document/list-documents'

describe('ListDocumentsUseCase', () => {
  let projectRepository: InMemoryProjectRepository
  let documentRepository: InMemoryDocumentRepository
  let sut: ListDocumentsUseCase

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository()
    documentRepository = new InMemoryDocumentRepository()
    sut = new ListDocumentsUseCase({ project: projectRepository, document: documentRepository })
  })

  it('returns an empty list for a project without documents', async () => {
    const project = makeProject()
    await projectRepository.create(project)

    expect(await sut.execute({ projectId: project.id.toValue() })).toEqual([])
  })

  it('lists summaries without the body, most recently updated first, only for the project', async () => {
    const project = makeProject()
    await projectRepository.create(project)
    const oldest = makeDocument({ projectId: project.id, updatedAt: new Date(1000) })
    const newest = makeDocument({ projectId: project.id, updatedAt: new Date(3000) })
    const middle = makeDocument({ projectId: project.id, updatedAt: new Date(2000) })
    const fromOtherProject = makeDocument({ projectId: createID(), updatedAt: new Date(4000) })
    documentRepository.items.push(oldest, newest, middle, fromOtherProject)

    const result = await sut.execute({ projectId: project.id.toValue() })

    expect(result.map((summary) => summary.title)).toEqual([
      newest.props.title,
      middle.props.title,
      oldest.props.title,
    ])
    expect(result.every((summary) => !('body' in summary))).toBe(true)
  })

  it('refuses an unknown project with PROJECT_NOT_FOUND', async () => {
    await expect(sut.execute({ projectId: createID().toValue() })).rejects.toMatchObject({
      response: { code: 'PROJECT_NOT_FOUND' },
    })
  })
})
