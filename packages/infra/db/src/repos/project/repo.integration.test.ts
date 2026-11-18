import { existsSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createID } from '@domain/base'
import { Project, ProjectPhase, ProjectPlatform } from '@domain/projects'
import { createTempDatabase, TempDatabase } from '@infra/db/__tests__/temp-database'
import { SqliteProjectRepository } from '@infra/db/repos/project/repo'

function buildProject(name: string, overrides: Partial<Project['props']> = {}): Project {
  return Project.create({
    name,
    platform: ProjectPlatform.WEB,
    phase: ProjectPhase.NO_CUSTOMERS,
    description: `About ${name}`,
    createdAt: new Date('2026-01-01T10:00:00.000Z'),
    updatedAt: new Date('2026-01-01T10:00:00.000Z'),
    ...overrides,
  })
}

describe('SqliteProjectRepository', () => {
  let temp: TempDatabase
  let repository: SqliteProjectRepository

  beforeEach(() => {
    temp = createTempDatabase()
    repository = new SqliteProjectRepository(temp.database)
  })

  afterEach(() => {
    temp.dispose()
  })

  it('creates the file and the schema on the first open, in a configurable path', () => {
    const tables = temp.database
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all()

    expect(existsSync(temp.filePath)).toBe(true)
    expect(tables).toEqual(expect.arrayContaining([{ name: 'projects' }, { name: 'documents' }]))
  })

  it('round trips every prop of a saved project', async () => {
    const project = buildProject('Acme', {
      platform: ProjectPlatform.BOTH,
      phase: ProjectPhase.CONSOLIDATED,
    })

    await repository.create(project)
    const found = await repository.getOrThrow(project.id)

    expect(found.id.toValue()).toBe(project.id.toValue())
    expect(found.props).toEqual(project.props)
  })

  it('updates the editable props and keeps the creation date', async () => {
    const project = buildProject('Acme')
    await repository.create(project)

    await repository.update(
      Project.reference(project.id, {
        ...project.props,
        name: 'Acme 2',
        phase: ProjectPhase.FINDING_MARKET_FIT,
        updatedAt: new Date('2026-02-01T10:00:00.000Z'),
      }),
    )
    const found = await repository.getOrThrow(project.id)

    expect(found.props.name).toBe('Acme 2')
    expect(found.props.phase).toBe(ProjectPhase.FINDING_MARKET_FIT)
    expect(found.props.updatedAt).toEqual(new Date('2026-02-01T10:00:00.000Z'))
    expect(found.props.createdAt).toEqual(project.props.createdAt)
  })

  it('keeps the data after the file is opened again', async () => {
    const project = buildProject('Persisted')
    await repository.create(project)

    const reopened = new SqliteProjectRepository(temp.reopen())
    const found = await reopened.getOrThrow(project.id)

    expect(found.props.name).toBe('Persisted')
  })

  it('lists projects by name ignoring case', async () => {
    await repository.create(buildProject('banana'))
    await repository.create(buildProject('Cherry'))
    await repository.create(buildProject('Apple'))

    const projects = await repository.listByName()

    expect(projects.map((project) => project.props.name)).toEqual(['Apple', 'banana', 'Cherry'])
  })

  it('stores text with quotes as data, never as SQL', async () => {
    const project = buildProject("Robert'); DROP TABLE projects;--")

    await repository.create(project)
    const projects = await repository.listByName()

    expect(projects).toHaveLength(1)
    expect(projects[0].props.name).toBe("Robert'); DROP TABLE projects;--")
  })

  it('throws PROJECT_NOT_FOUND for an unknown id', async () => {
    await expect(repository.getOrThrow(createID())).rejects.toMatchObject({
      response: { code: 'PROJECT_NOT_FOUND' },
    })
  })

  it('throws PROJECT_NOT_FOUND when updating an unknown project', async () => {
    await expect(repository.update(buildProject('Ghost'))).rejects.toMatchObject({
      response: { code: 'PROJECT_NOT_FOUND' },
    })
  })

  it('throws a data integrity error when the stored platform is not a known option', async () => {
    const project = buildProject('Broken')
    await repository.create(project)
    temp.database.prepare('UPDATE projects SET platform = ? WHERE id = ?').run('desktop', project.id.toValue())

    await expect(repository.getOrThrow(project.id)).rejects.toMatchObject({
      response: { code: 'INVALID_ENUM_MEMBER', errorType: 'DATA_INTEGRITY' },
    })
  })
})
