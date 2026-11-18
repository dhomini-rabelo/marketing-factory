import { beforeEach, describe, expect, it } from 'vitest'
import { createID } from '@domain/base'
import { makeProject } from '@domain/projects/application/__tests__/factories/project'
import { InMemoryProjectRepository } from '@domain/projects/application/__tests__/repositories/project'
import { some } from '@domain/projects/application/__tests__/utils/some'
import { UpdateProjectUseCase } from '@domain/projects/application/use-cases/project/update-project'
import {
  PROJECT_DESCRIPTION_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
} from '@domain/projects/application/validation/project'
import { ProjectPhase, ProjectPlatform } from '@domain/projects/enterprise/entities/project'

describe('UpdateProjectUseCase', () => {
  let projectRepository: InMemoryProjectRepository
  let sut: UpdateProjectUseCase

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository()
    sut = new UpdateProjectUseCase({ project: projectRepository })
  })

  async function storeProject() {
    const project = makeProject({
      platform: ProjectPlatform.WEB,
      phase: ProjectPhase.NO_CUSTOMERS,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    })
    await projectRepository.create(project)
    return project
  }

  function makeInputData(projectId: string) {
    return {
      id: projectId,
      name: some.name(),
      description: some.string(),
      platform: ProjectPlatform.BOTH,
      phase: ProjectPhase.CONSOLIDATED,
    }
  }

  it('updates every field and refreshes updatedAt', async () => {
    const project = await storeProject()
    const inputData = makeInputData(project.id.toValue())

    const updated = await sut.execute(inputData)

    expect(updated.id.isEqual(project.id)).toBe(true)
    expect(updated.props.name).toBe(inputData.name)
    expect(updated.props.description).toBe(inputData.description)
    expect(updated.props.platform).toBe(inputData.platform)
    expect(updated.props.phase).toBe(inputData.phase)
    expect(updated.props.createdAt).toEqual(new Date(0))
    expect(updated.props.updatedAt.getTime()).toBeGreaterThan(0)
  })

  it('refuses an unknown project with PROJECT_NOT_FOUND', async () => {
    const inputData = makeInputData(createID().toValue())

    await expect(sut.execute(inputData)).rejects.toMatchObject({
      response: { code: 'PROJECT_NOT_FOUND' },
    })
  })

  it.each([
    { scenario: 'empty name', field: 'name', override: { name: '' }, code: 'REQUIRED' },
    {
      scenario: 'long name',
      field: 'name',
      override: { name: some.stringWithLength(PROJECT_NAME_MAX_LENGTH + 1) },
      code: 'TOO_LONG',
    },
    { scenario: 'empty description', field: 'description', override: { description: '' }, code: 'REQUIRED' },
    {
      scenario: 'long description',
      field: 'description',
      override: { description: some.stringWithLength(PROJECT_DESCRIPTION_MAX_LENGTH + 1) },
      code: 'TOO_LONG',
    },
    {
      scenario: 'unknown platform',
      field: 'platform',
      override: { platform: some.string() },
      code: 'INVALID_OPTION',
    },
    { scenario: 'unknown phase', field: 'phase', override: { phase: some.string() }, code: 'INVALID_OPTION' },
  ])('refuses $scenario and keeps the previous data', async ({ field, override, code }) => {
    const project = await storeProject()
    const previousProps = { ...project.props }
    const inputData = { ...makeInputData(project.id.toValue()), ...override }

    await expect(sut.execute(inputData)).rejects.toMatchObject({ fields: [{ field, code }] })

    expect(projectRepository.items[0].props).toEqual(previousProps)
  })
})
