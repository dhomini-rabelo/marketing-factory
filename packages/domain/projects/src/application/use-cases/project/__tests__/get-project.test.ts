import { beforeEach, describe, expect, it } from 'vitest'
import { createID } from '@domain/base'
import { makeProject } from '@domain/projects/application/__tests__/factories/project'
import { InMemoryProjectRepository } from '@domain/projects/application/__tests__/repositories/project'
import { GetProjectUseCase } from '@domain/projects/application/use-cases/project/get-project'

describe('GetProjectUseCase', () => {
  let projectRepository: InMemoryProjectRepository
  let sut: GetProjectUseCase

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository()
    sut = new GetProjectUseCase({ project: projectRepository })
  })

  it('returns the basic data of the project', async () => {
    const project = makeProject()
    await projectRepository.create(project)

    const result = await sut.execute({ id: project.id.toValue() })

    expect(result.props.name).toBe(project.props.name)
    expect(result.props.description).toBe(project.props.description)
    expect(result.props.platform).toBe(project.props.platform)
    expect(result.props.phase).toBe(project.props.phase)
  })

  it('refuses an unknown code with PROJECT_NOT_FOUND', async () => {
    await expect(sut.execute({ id: createID().toValue() })).rejects.toMatchObject({
      response: { code: 'PROJECT_NOT_FOUND' },
    })
  })
})
