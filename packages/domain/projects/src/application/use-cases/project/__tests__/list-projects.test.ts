import { beforeEach, describe, expect, it } from 'vitest'
import { makeProject } from '@domain/projects/application/__tests__/factories/project'
import { InMemoryProjectRepository } from '@domain/projects/application/__tests__/repositories/project'
import { ListProjectsUseCase } from '@domain/projects/application/use-cases/project/list-projects'

describe('ListProjectsUseCase', () => {
  let projectRepository: InMemoryProjectRepository
  let sut: ListProjectsUseCase

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository()
    sut = new ListProjectsUseCase({ project: projectRepository })
  })

  it('returns an empty list when there are no projects', async () => {
    expect(await sut.execute()).toEqual([])
  })

  it('lists the projects in alphabetical order ignoring case', async () => {
    const zebra = makeProject({ name: 'zebra' })
    const apple = makeProject({ name: 'Apple' })
    const mango = makeProject({ name: 'mango' })
    projectRepository.items.push(zebra, apple, mango)

    const result = await sut.execute()

    expect(result).toEqual([apple, mango, zebra])
  })
})
