import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createID, ID } from '@domain/base'
import { Document, Project, ProjectPhase, ProjectPlatform } from '@domain/projects'
import { createTempDatabase, TempDatabase } from '@infra/db/__tests__/temp-database'
import { SqliteDocumentRepository } from '@infra/db/repos/document/repo'
import { SqliteProjectRepository } from '@infra/db/repos/project/repo'

function slugOf(title: string): string {
  return title
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}

function buildDocument(projectId: ID, title: string, body: string, updatedAt: Date): Document {
  return Document.create({
    projectId,
    slug: slugOf(title),
    title,
    description: `About ${title}`,
    body,
    createdAt: updatedAt,
    updatedAt,
  })
}

describe('SqliteDocumentRepository', () => {
  let temp: TempDatabase
  let repository: SqliteDocumentRepository
  let projectId: ID

  beforeEach(async () => {
    temp = createTempDatabase()
    repository = new SqliteDocumentRepository(temp.database)
    const project = Project.create({
      name: 'Acme',
      platform: ProjectPlatform.WEB,
      phase: ProjectPhase.NO_CUSTOMERS,
      description: 'Acme project',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await new SqliteProjectRepository(temp.database).create(project)
    projectId = project.id
  })

  afterEach(() => {
    temp.dispose()
  })

  it('creates a document with an accented title and an emoji', async () => {
    const document = buildDocument(projectId, 'Visão 🚀 Geral', '# Body', new Date())

    const result = await repository.saveByTitle(document)
    const found = await repository.getOrThrow({ projectId, slug: 'visao-geral' })

    expect(result.wasCreated).toBe(true)
    expect(found.props).toEqual(document.props)
  })

  it('updates the same document when the title changes only in case or accents', async () => {
    const first = buildDocument(projectId, 'Visão Geral', 'first', new Date('2026-01-01T10:00:00.000Z'))
    const second = buildDocument(projectId, 'VISAO geral', 'second', new Date('2026-01-02T10:00:00.000Z'))

    const created = await repository.saveByTitle(first)
    const updated = await repository.saveByTitle(second)
    const summaries = await repository.listSummaries(projectId)

    expect(updated.wasCreated).toBe(false)
    expect(updated.document.id.toValue()).toBe(created.document.id.toValue())
    expect(updated.document.props.title).toBe('VISAO geral')
    expect(updated.document.props.body).toBe('second')
    expect(updated.document.props.createdAt).toEqual(first.props.createdAt)
    expect(updated.document.props.updatedAt).toEqual(second.props.updatedAt)
    expect(summaries).toHaveLength(1)
  })

  it('keeps one row with the last content when two saves of the same title run together', async () => {
    const first = buildDocument(projectId, 'Mercado', 'content of the first', new Date('2026-01-01T10:00:00.000Z'))
    const last = buildDocument(projectId, 'mercado', 'content of the last', new Date('2026-01-02T10:00:00.000Z'))

    await Promise.all([repository.saveByTitle(first), repository.saveByTitle(last)])
    const rows = temp.database.prepare('SELECT title, body FROM documents').all()

    expect(rows).toEqual([{ title: 'mercado', body: 'content of the last' }])
  })

  it('keeps documents with the same title in different projects apart', async () => {
    const other = Project.create({
      name: 'Other',
      platform: ProjectPlatform.MOBILE,
      phase: ProjectPhase.NO_CUSTOMERS,
      description: 'Other project',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await new SqliteProjectRepository(temp.database).create(other)

    await repository.saveByTitle(buildDocument(projectId, 'Mercado', 'a', new Date()))
    const result = await repository.saveByTitle(buildDocument(other.id, 'Mercado', 'b', new Date()))

    expect(result.wasCreated).toBe(true)
    expect(await repository.listSummaries(projectId)).toHaveLength(1)
    expect(await repository.listSummaries(other.id)).toHaveLength(1)
  })

  it('lists summaries without the body, newest update first', async () => {
    await repository.saveByTitle(buildDocument(projectId, 'Old', 'old body', new Date('2026-01-01T10:00:00.000Z')))
    await repository.saveByTitle(buildDocument(projectId, 'New', 'new body', new Date('2026-03-01T10:00:00.000Z')))

    const summaries = await repository.listSummaries(projectId)

    expect(summaries.map((summary) => summary.title)).toEqual(['New', 'Old'])
    expect(summaries.every((summary) => !('body' in summary))).toBe(true)
    expect(summaries[0].projectId.toValue()).toBe(projectId.toValue())
  })

  it('stores a markdown body with quotes as data, never as SQL', async () => {
    const body = "'); DROP TABLE documents;-- \n\n```ts\nconst a = 'b'\n```"

    await repository.saveByTitle(buildDocument(projectId, 'Code', body, new Date()))
    const found = await repository.getOrThrow({ projectId, slug: 'code' })

    expect(found.props.body).toBe(body)
  })

  it('throws DOCUMENT_NOT_FOUND for an unknown slug', async () => {
    await expect(repository.getOrThrow({ projectId, slug: 'missing' })).rejects.toMatchObject({
      response: { code: 'DOCUMENT_NOT_FOUND' },
    })
  })

  it('refuses a document for a project that does not exist', async () => {
    await expect(
      repository.saveByTitle(buildDocument(createID(), 'Orphan', 'body', new Date())),
    ).rejects.toThrow()
  })
})
