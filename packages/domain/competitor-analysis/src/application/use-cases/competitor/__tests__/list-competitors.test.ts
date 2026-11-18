import { beforeEach, describe, expect, it } from 'vitest'
import { createID } from '@domain/base'
import { makeCompetitorInput } from '@domain/competitor-analysis/application/__tests__/factories/competitor-input'
import { makeProject } from '@domain/competitor-analysis/application/__tests__/factories/project'
import { InMemoryCompetitorRepository } from '@domain/competitor-analysis/application/__tests__/repositories/competitor'
import { InMemoryProjectRepository } from '@domain/competitor-analysis/application/__tests__/repositories/project'
import { ListCompetitorsUseCase } from '@domain/competitor-analysis/application/use-cases/competitor/list-competitors'
import { SaveCompetitorsUseCase } from '@domain/competitor-analysis/application/use-cases/competitor/save-competitors'
import {
  CompetitorApproval,
  CompetitorRole,
} from '@domain/competitor-analysis/enterprise/entities/competitor'
import { Project } from '@domain/projects'

describe('ListCompetitorsUseCase', () => {
  let projectRepository: InMemoryProjectRepository
  let competitorRepository: InMemoryCompetitorRepository
  let project: Project
  let saveCompetitors: SaveCompetitorsUseCase
  let sut: ListCompetitorsUseCase

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository()
    competitorRepository = new InMemoryCompetitorRepository()
    project = makeProject()
    projectRepository.items.push(project)
    const repos = { project: projectRepository, competitor: competitorRepository }
    saveCompetitors = new SaveCompetitorsUseCase(repos)
    sut = new ListCompetitorsUseCase(repos)
  })

  it('returns an empty list with pending approval when nothing was saved', async () => {
    const result = await sut.execute({ projectId: project.id.toValue() })

    expect(result).toEqual({ approval: CompetitorApproval.PENDING, competitors: [] })
  })

  it('returns the competitors with the approval of the list', async () => {
    await saveCompetitors.execute({
      projectId: project.id.toValue(),
      competitors: [makeCompetitorInput({ name: 'Acme' })],
    })
    competitorRepository.approvals.set(project.id.toValue(), CompetitorApproval.APPROVED)

    const { competitors, approval } = await sut.execute({ projectId: project.id.toValue() })

    expect(approval).toBe(CompetitorApproval.APPROVED)
    expect(competitors.map((competitor) => competitor.props.name)).toEqual(['Acme'])
  })

  it('orders main, secondary and incorrect competitors', async () => {
    await saveCompetitors.execute({
      projectId: project.id.toValue(),
      competitors: [
        makeCompetitorInput({ name: 'Marked', role: CompetitorRole.MAIN }),
        makeCompetitorInput({ name: 'Secondary', role: CompetitorRole.SECONDARY }),
        makeCompetitorInput({ name: 'Main', role: CompetitorRole.MAIN }),
      ],
    })
    await competitorRepository.setIncorrect({
      projectId: project.id,
      competitorId: createID('marked'),
      incorrect: true,
    })

    const { competitors } = await sut.execute({ projectId: project.id.toValue() })

    expect(competitors.map((competitor) => competitor.props.name)).toEqual([
      'Main',
      'Secondary',
      'Marked',
    ])
  })

  it('does not return competitors of another project', async () => {
    const otherProject = makeProject()
    projectRepository.items.push(otherProject)
    await saveCompetitors.execute({
      projectId: otherProject.id.toValue(),
      competitors: [makeCompetitorInput({ name: 'Elsewhere' })],
    })

    const { competitors } = await sut.execute({ projectId: project.id.toValue() })

    expect(competitors).toEqual([])
  })

  it('rejects an unknown project', async () => {
    await expect(sut.execute({ projectId: createID().toValue() })).rejects.toMatchObject({
      response: { code: 'PROJECT_NOT_FOUND' },
    })
  })
})
