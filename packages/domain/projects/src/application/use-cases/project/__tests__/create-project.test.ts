import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryProjectRepository } from '@domain/projects/application/__tests__/repositories/project'
import { some } from '@domain/projects/application/__tests__/utils/some'
import { FieldsValidationError } from '@domain/projects/application/errors/fields-validation-error'
import { CreateProjectUseCase } from '@domain/projects/application/use-cases/project/create-project'
import {
  PROJECT_DESCRIPTION_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
} from '@domain/projects/application/validation/project'
import { ProjectPhase, ProjectPlatform } from '@domain/projects/enterprise/entities/project'

describe('CreateProjectUseCase', () => {
  let projectRepository: InMemoryProjectRepository
  let sut: CreateProjectUseCase

  const makeInputData = () => ({
    name: some.name(),
    description: some.string(),
    platform: some.valueBetween(...Object.values(ProjectPlatform)),
    phase: some.valueBetween(...Object.values(ProjectPhase)),
  })

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository()
    sut = new CreateProjectUseCase({ project: projectRepository })
  })

  it('creates and stores a project with the given data', async () => {
    const inputData = makeInputData()

    const project = await sut.execute(inputData)

    expect(project.props.name).toBe(inputData.name)
    expect(project.props.description).toBe(inputData.description)
    expect(project.props.platform).toBe(inputData.platform)
    expect(project.props.phase).toBe(inputData.phase)
    expect(project.props.createdAt).toEqual(project.props.updatedAt)
    expect(projectRepository.items).toEqual([project])
  })

  it('trims the name and the description', async () => {
    const inputData = makeInputData()

    const project = await sut.execute({
      ...inputData,
      name: `  ${inputData.name}  `,
      description: `  ${inputData.description}  `,
    })

    expect(project.props.name).toBe(inputData.name)
    expect(project.props.description).toBe(inputData.description)
  })

  it('accepts a name with the maximum length', async () => {
    const name = some.stringWithLength(PROJECT_NAME_MAX_LENGTH)

    const project = await sut.execute({ ...makeInputData(), name })

    expect(project.props.name).toBe(name)
  })

  it('accepts a name already used by another project', async () => {
    const inputData = makeInputData()

    await sut.execute(inputData)
    await sut.execute(inputData)

    expect(projectRepository.items).toHaveLength(2)
  })

  it.each([
    { scenario: 'empty', name: '' },
    { scenario: 'only spaces', name: '   ' },
  ])('refuses a name that is $scenario with REQUIRED', async ({ name }) => {
    await expect(sut.execute({ ...makeInputData(), name })).rejects.toMatchObject({
      fields: [{ field: 'name', code: 'REQUIRED' }],
    })
    expect(projectRepository.items).toHaveLength(0)
  })

  it('refuses a name above the limit with TOO_LONG and the limit', async () => {
    const name = some.stringWithLength(PROJECT_NAME_MAX_LENGTH + 1)

    await expect(sut.execute({ ...makeInputData(), name })).rejects.toMatchObject({
      fields: [{ field: 'name', code: 'TOO_LONG', variables: [String(PROJECT_NAME_MAX_LENGTH)] }],
    })
    expect(projectRepository.items).toHaveLength(0)
  })

  it('refuses an empty description with REQUIRED', async () => {
    await expect(sut.execute({ ...makeInputData(), description: '' })).rejects.toMatchObject({
      fields: [{ field: 'description', code: 'REQUIRED' }],
    })
    expect(projectRepository.items).toHaveLength(0)
  })

  it('refuses a description above the limit with TOO_LONG', async () => {
    const description = some.stringWithLength(PROJECT_DESCRIPTION_MAX_LENGTH + 1)

    await expect(sut.execute({ ...makeInputData(), description })).rejects.toMatchObject({
      fields: [
        { field: 'description', code: 'TOO_LONG', variables: [String(PROJECT_DESCRIPTION_MAX_LENGTH)] },
      ],
    })
  })

  it('refuses a platform outside the list with INVALID_OPTION', async () => {
    await expect(sut.execute({ ...makeInputData(), platform: some.string() })).rejects.toMatchObject({
      fields: [{ field: 'platform', code: 'INVALID_OPTION' }],
    })
    expect(projectRepository.items).toHaveLength(0)
  })

  it('refuses a phase outside the list with INVALID_OPTION', async () => {
    await expect(sut.execute({ ...makeInputData(), phase: some.string() })).rejects.toMatchObject({
      fields: [{ field: 'phase', code: 'INVALID_OPTION' }],
    })
    expect(projectRepository.items).toHaveLength(0)
  })

  it('reports every invalid field at once', async () => {
    const rejection = sut.execute({ name: '', description: '', platform: some.string(), phase: some.string() })

    await expect(rejection).rejects.toBeInstanceOf(FieldsValidationError)
    await expect(rejection).rejects.toMatchObject({
      fields: [{ field: 'name' }, { field: 'description' }, { field: 'platform' }, { field: 'phase' }],
    })
  })
})
