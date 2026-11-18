import { beforeEach, describe, expect, it } from 'vitest'
import { createID } from '@domain/base'
import { makeCompetitorInput } from '@domain/competitor-analysis/application/__tests__/factories/competitor-input'
import { makeProject } from '@domain/competitor-analysis/application/__tests__/factories/project'
import { InMemoryCompetitorRepository } from '@domain/competitor-analysis/application/__tests__/repositories/competitor'
import { InMemoryProjectRepository } from '@domain/competitor-analysis/application/__tests__/repositories/project'
import { MarkCompetitorUseCase } from '@domain/competitor-analysis/application/use-cases/competitor/mark-competitor'
import { SaveCompetitorsUseCase } from '@domain/competitor-analysis/application/use-cases/competitor/save-competitors'
import { CompetitorApproval } from '@domain/competitor-analysis/enterprise/entities/competitor'
import { Project } from '@domain/projects'

describe('MarkCompetitorUseCase', () => {
  let projectRepository: InMemoryProjectRepository
  let competitorRepository: InMemoryCompetitorRepository
  let project: Project
  let sut: MarkCompetitorUseCase

  const mark = (incorrect: boolean, competitorId = 'acme') =>
    sut.execute({ projectId: project.id.toValue(), competitorId, incorrect })

  beforeEach(async () => {
    projectRepository = new InMemoryProjectRepository()
    competitorRepository = new InMemoryCompetitorRepository()
    project = makeProject()
    projectRepository.items.push(project)
    const repos = { project: projectRepository, competitor: competitorRepository }
    sut = new MarkCompetitorUseCase(repos)
    await new SaveCompetitorsUseCase(repos).execute({
      projectId: project.id.toValue(),
      competitors: [makeCompetitorInput({ name: 'Acme' }), makeCompetitorInput({ name: 'Other' })],
    })
  })

  it('marks a competitor as incorrect', async () => {
    const competitor = await mark(true)

    expect(competitor.props.incorrect).toBe(true)
    expect(competitorRepository.items.find((item) => item.id.toValue() === 'acme')?.props.incorrect).toBe(
      true,
    )
    expect(competitorRepository.items.find((item) => item.id.toValue() === 'other')?.props.incorrect).toBe(
      false,
    )
  })

  it('unmarks a competitor', async () => {
    await mark(true)

    const competitor = await mark(false)

    expect(competitor.props.incorrect).toBe(false)
  })

  it('accepts marking and unmarking twice', async () => {
    await mark(true)
    const markedAgain = await mark(true)
    await mark(false)
    const unmarkedAgain = await mark(false)

    expect(markedAgain.props.incorrect).toBe(true)
    expect(unmarkedAgain.props.incorrect).toBe(false)
  })

  it('does not change the approval of the list', async () => {
    competitorRepository.approvals.set(project.id.toValue(), CompetitorApproval.APPROVED)

    await mark(true)

    expect(competitorRepository.approvals.get(project.id.toValue())).toBe(CompetitorApproval.APPROVED)
  })

  it('rejects a competitor that is not in the list', async () => {
    await expect(mark(true, 'missing')).rejects.toMatchObject({
      response: { code: 'COMPETITOR_NOT_FOUND' },
    })
  })

  it('rejects an unknown project', async () => {
    await expect(
      sut.execute({ projectId: createID().toValue(), competitorId: 'acme', incorrect: true }),
    ).rejects.toMatchObject({ response: { code: 'PROJECT_NOT_FOUND' } })
  })
})
