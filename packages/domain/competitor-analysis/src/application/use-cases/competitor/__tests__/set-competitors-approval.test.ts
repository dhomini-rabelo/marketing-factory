import { beforeEach, describe, expect, it } from 'vitest'
import { createID } from '@domain/base'
import { makeCompetitorInput } from '@domain/competitor-analysis/application/__tests__/factories/competitor-input'
import { makeProject } from '@domain/competitor-analysis/application/__tests__/factories/project'
import { InMemoryCompetitorRepository } from '@domain/competitor-analysis/application/__tests__/repositories/competitor'
import { InMemoryProjectRepository } from '@domain/competitor-analysis/application/__tests__/repositories/project'
import { NoActiveCompetitorsError } from '@domain/competitor-analysis/application/errors/no-active-competitors-error'
import { MarkCompetitorUseCase } from '@domain/competitor-analysis/application/use-cases/competitor/mark-competitor'
import { SaveCompetitorsUseCase } from '@domain/competitor-analysis/application/use-cases/competitor/save-competitors'
import { SetCompetitorsApprovalUseCase } from '@domain/competitor-analysis/application/use-cases/competitor/set-competitors-approval'
import { CompetitorApproval } from '@domain/competitor-analysis/enterprise/entities/competitor'
import { Project } from '@domain/projects'

describe('SetCompetitorsApprovalUseCase', () => {
  let projectRepository: InMemoryProjectRepository
  let competitorRepository: InMemoryCompetitorRepository
  let project: Project
  let saveCompetitors: SaveCompetitorsUseCase
  let markCompetitor: MarkCompetitorUseCase
  let sut: SetCompetitorsApprovalUseCase

  const saveNames = (names: string[]) =>
    saveCompetitors.execute({
      projectId: project.id.toValue(),
      competitors: names.map((name) => makeCompetitorInput({ name })),
    })

  const mark = (competitorId: string) =>
    markCompetitor.execute({ projectId: project.id.toValue(), competitorId, incorrect: true })

  const setApproval = (approved: boolean) =>
    sut.execute({ projectId: project.id.toValue(), approved })

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository()
    competitorRepository = new InMemoryCompetitorRepository()
    project = makeProject()
    projectRepository.items.push(project)
    const repos = { project: projectRepository, competitor: competitorRepository }
    saveCompetitors = new SaveCompetitorsUseCase(repos)
    markCompetitor = new MarkCompetitorUseCase(repos)
    sut = new SetCompetitorsApprovalUseCase(repos)
  })

  it('approves a list with an active competitor', async () => {
    await saveNames(['Acme'])

    const { approval } = await setApproval(true)

    expect(approval).toBe(CompetitorApproval.APPROVED)
    expect(competitorRepository.approvals.get(project.id.toValue())).toBe(CompetitorApproval.APPROVED)
  })

  it('refuses to approve when there is no competitor', async () => {
    await expect(setApproval(true)).rejects.toBeInstanceOf(NoActiveCompetitorsError)
    expect(competitorRepository.approvals.get(project.id.toValue())).toBeUndefined()
  })

  it('refuses to approve when every competitor is marked as incorrect', async () => {
    await saveNames(['Acme', 'Other'])
    await mark('acme')
    await mark('other')

    await expect(setApproval(true)).rejects.toBeInstanceOf(NoActiveCompetitorsError)
    expect(await competitorRepository.getApproval(project.id)).toBe(CompetitorApproval.PENDING)
  })

  it('approves when at least one competitor is not marked', async () => {
    await saveNames(['Acme', 'Other'])
    await mark('acme')

    const { approval } = await setApproval(true)

    expect(approval).toBe(CompetitorApproval.APPROVED)
  })

  it('accepts approving a list that is already approved', async () => {
    await saveNames(['Acme'])
    await setApproval(true)

    const { approval } = await setApproval(true)

    expect(approval).toBe(CompetitorApproval.APPROVED)
  })

  it('reopens an approved list back to pending', async () => {
    await saveNames(['Acme'])
    await setApproval(true)

    const { approval } = await setApproval(false)

    expect(approval).toBe(CompetitorApproval.PENDING)
    expect(competitorRepository.approvals.get(project.id.toValue())).toBe(CompetitorApproval.PENDING)
  })

  it('accepts reopening a list that is already pending, even without competitors', async () => {
    const { approval } = await setApproval(false)

    expect(approval).toBe(CompetitorApproval.PENDING)
  })

  it('rejects an unknown project', async () => {
    await expect(
      sut.execute({ projectId: createID().toValue(), approved: true }),
    ).rejects.toMatchObject({ response: { code: 'PROJECT_NOT_FOUND' } })
  })
})
