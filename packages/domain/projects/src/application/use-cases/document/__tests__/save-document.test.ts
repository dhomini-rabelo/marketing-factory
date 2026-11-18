import { beforeEach, describe, expect, it } from 'vitest'
import { createID } from '@domain/base'
import { makeProject } from '@domain/projects/application/__tests__/factories/project'
import { InMemoryDocumentRepository } from '@domain/projects/application/__tests__/repositories/document'
import { InMemoryProjectRepository } from '@domain/projects/application/__tests__/repositories/project'
import { some } from '@domain/projects/application/__tests__/utils/some'
import { SaveDocumentUseCase } from '@domain/projects/application/use-cases/document/save-document/save-document'
import {
  DOCUMENT_BODY_MAX_LENGTH,
  DOCUMENT_DESCRIPTION_MAX_LENGTH,
  DOCUMENT_TITLE_MAX_LENGTH,
} from '@domain/projects/application/use-cases/document/save-document/validate-document-fields'

describe('SaveDocumentUseCase', () => {
  let projectRepository: InMemoryProjectRepository
  let documentRepository: InMemoryDocumentRepository
  let sut: SaveDocumentUseCase
  let projectId: string

  beforeEach(async () => {
    projectRepository = new InMemoryProjectRepository()
    documentRepository = new InMemoryDocumentRepository()
    sut = new SaveDocumentUseCase({ project: projectRepository, document: documentRepository })
    const project = makeProject()
    await projectRepository.create(project)
    projectId = project.id.toValue()
  })

  const makeInputData = () => ({
    title: some.string(),
    description: some.string(),
    body: some.string(),
  })

  describe('saving', () => {
    it('creates a document for a new title', async () => {
      const inputData = makeInputData()

      const result = await sut.execute({ projectId, ...inputData })

      expect(result.wasCreated).toBe(true)
      expect(result.document.props.title).toBe(inputData.title)
      expect(result.document.props.description).toBe(inputData.description)
      expect(result.document.props.body).toBe(inputData.body)
      expect(result.document.props.projectId.toValue()).toBe(projectId)
      expect(documentRepository.items).toHaveLength(1)
    })

    it('updates the same document when the title is saved again', async () => {
      const inputData = makeInputData()
      const first = await sut.execute({ projectId, ...inputData })
      const newBody = some.string()

      const second = await sut.execute({ projectId, ...inputData, body: newBody })

      expect(second.wasCreated).toBe(false)
      expect(second.document.id.isEqual(first.document.id)).toBe(true)
      expect(second.document.props.createdAt).toEqual(first.document.props.createdAt)
      expect(second.document.props.body).toBe(newBody)
      expect(documentRepository.items).toHaveLength(1)
    })

    it('treats case and accent variations of the title as the same document', async () => {
      const baseTitle = `Café ${some.string()}`
      const titleWithOtherCase = baseTitle.toUpperCase().replace('É', 'E')
      await sut.execute({ projectId, ...makeInputData(), title: baseTitle })

      const result = await sut.execute({ projectId, ...makeInputData(), title: titleWithOtherCase })

      expect(result.wasCreated).toBe(false)
      expect(result.document.props.title).toBe(titleWithOtherCase)
      expect(documentRepository.items).toHaveLength(1)
    })

    it('keeps documents with the same title in different projects apart', async () => {
      const otherProject = makeProject()
      await projectRepository.create(otherProject)
      const inputData = makeInputData()

      await sut.execute({ projectId, ...inputData })
      const result = await sut.execute({ projectId: otherProject.id.toValue(), ...inputData })

      expect(result.wasCreated).toBe(true)
      expect(documentRepository.items).toHaveLength(2)
    })

    it('saves a title with accent, slash and emoji', async () => {
      const title = `Ação/Preço 🚀 ${some.string()}`

      const result = await sut.execute({ projectId, ...makeInputData(), title })

      expect(result.document.props.title).toBe(title)
      expect(result.document.props.slug).toContain('ac')
      expect(result.document.props.slug).not.toMatch(/[/ 🚀]/u)
    })

    it('trims the displayed title', async () => {
      const inputData = makeInputData()

      const result = await sut.execute({ projectId, ...inputData, title: `  ${inputData.title}  ` })

      expect(result.document.props.title).toBe(inputData.title)
    })

    it('accepts a body with the maximum length', async () => {
      const body = some.stringWithLength(DOCUMENT_BODY_MAX_LENGTH)

      const result = await sut.execute({ projectId, ...makeInputData(), body })

      expect(result.document.props.body).toBe(body)
    })
  })

  describe('refusals', () => {
    it.each([
      { scenario: 'empty', title: '' },
      { scenario: 'only spaces', title: '   ' },
    ])('refuses a title that is $scenario with REQUIRED', async ({ title }) => {
      await expect(sut.execute({ projectId, ...makeInputData(), title })).rejects.toMatchObject({
        fields: [{ field: 'title', code: 'REQUIRED' }],
      })
      expect(documentRepository.items).toHaveLength(0)
    })

    it('refuses a title made only of symbols with INVALID_TITLE', async () => {
      await expect(sut.execute({ projectId, ...makeInputData(), title: '!!! 🚀 ///' })).rejects.toMatchObject({
        fields: [{ field: 'title', code: 'INVALID_TITLE' }],
      })
      expect(documentRepository.items).toHaveLength(0)
    })

    it('refuses a title above the limit with TOO_LONG', async () => {
      const title = some.stringWithLength(DOCUMENT_TITLE_MAX_LENGTH + 1)

      await expect(sut.execute({ projectId, ...makeInputData(), title })).rejects.toMatchObject({
        fields: [{ field: 'title', code: 'TOO_LONG', variables: [String(DOCUMENT_TITLE_MAX_LENGTH)] }],
      })
    })

    it('refuses a description above the limit with TOO_LONG', async () => {
      const description = some.stringWithLength(DOCUMENT_DESCRIPTION_MAX_LENGTH + 1)

      await expect(sut.execute({ projectId, ...makeInputData(), description })).rejects.toMatchObject({
        fields: [
          { field: 'description', code: 'TOO_LONG', variables: [String(DOCUMENT_DESCRIPTION_MAX_LENGTH)] },
        ],
      })
    })

    it('lists every empty field when description and body are empty', async () => {
      await expect(
        sut.execute({ projectId, title: some.string(), description: '', body: '   ' }),
      ).rejects.toMatchObject({
        fields: [
          { field: 'description', code: 'REQUIRED' },
          { field: 'body', code: 'REQUIRED' },
        ],
      })
      expect(documentRepository.items).toHaveLength(0)
    })

    it('refuses a body one character above the limit with TOO_LONG and the limit', async () => {
      const body = some.stringWithLength(DOCUMENT_BODY_MAX_LENGTH + 1)

      await expect(sut.execute({ projectId, ...makeInputData(), body })).rejects.toMatchObject({
        fields: [{ field: 'body', code: 'TOO_LONG', variables: [String(DOCUMENT_BODY_MAX_LENGTH)] }],
      })
      expect(documentRepository.items).toHaveLength(0)
    })

    it('refuses an unknown project with PROJECT_NOT_FOUND and creates nothing', async () => {
      await expect(
        sut.execute({ projectId: createID().toValue(), ...makeInputData() }),
      ).rejects.toMatchObject({ response: { code: 'PROJECT_NOT_FOUND' } })
      expect(documentRepository.items).toHaveLength(0)
    })
  })
})
