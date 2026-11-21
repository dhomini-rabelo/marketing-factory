import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createID } from '@domain/base'
import { makeCompetitor } from '@domain/competitor-analysis/application/__tests__/factories/competitor'
import { makeProject } from '@domain/competitor-analysis/application/__tests__/factories/project'
import { InMemoryCompetitorRepository } from '@domain/competitor-analysis/application/__tests__/repositories/competitor'
import { InMemoryProjectRepository } from '@domain/competitor-analysis/application/__tests__/repositories/project'
import { InMemorySeoRoundRepository } from '@domain/competitor-analysis/application/__tests__/repositories/seo-round'
import { NoActiveCompetitorsError } from '@domain/competitor-analysis/application/errors/no-active-competitors-error'
import { CreateSeoRoundUseCase } from '@domain/competitor-analysis/application/use-cases/seo/create-seo-round'
import { CompetitorApproval } from '@domain/competitor-analysis/enterprise/entities/competitor'
import { SeoTool } from '@domain/competitor-analysis/enterprise/entities/seo-round'
import { Project } from '@domain/projects'

describe('CreateSeoRoundUseCase', () => {
  let projectRepository: InMemoryProjectRepository
  let competitorRepository: InMemoryCompetitorRepository
  let seoRoundRepository: InMemorySeoRoundRepository
  let project: Project
  let sut: CreateSeoRoundUseCase

  const input = () => ({
    projectId: project.id.toValue(),
    tool: SeoTool.CLAUDE_CODE,
    collectedAt: '2026-11-18',
    note: 'first pass',
    market: 'br',
  })

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository()
    competitorRepository = new InMemoryCompetitorRepository()
    seoRoundRepository = new InMemorySeoRoundRepository()
    project = makeProject()
    projectRepository.items.push(project)
    sut = new CreateSeoRoundUseCase({
      project: projectRepository,
      competitor: competitorRepository,
      seoRound: seoRoundRepository,
    })
  })

  it('opens a round that expects the approved competitors that are not incorrect', async () => {
    competitorRepository.items.push(
      makeCompetitor({ projectId: project.id, name: '  Fireflies.AI ' }),
      makeCompetitor({ projectId: project.id, name: 'Otter' }),
      makeCompetitor({ projectId: project.id, name: 'Wrong', incorrect: true }),
      makeCompetitor({ projectId: createID(), name: 'Other project' }),
    )
    competitorRepository.approvals.set(project.id.toValue(), CompetitorApproval.APPROVED)

    const round = await sut.execute(input())

    expect(round.props.expectedCompetitors).toEqual(['fireflies.ai', 'otter'])
    expect(round.props.tool).toBe(SeoTool.CLAUDE_CODE)
    expect(round.props.collectedAt).toEqual(new Date('2026-11-18'))
    expect(round.props.note).toBe('first pass')
    expect(round.props.market).toBe('br')
    expect(round.props.searches).toEqual([])
    expect(seoRoundRepository.rounds).toEqual([round])
  })

  it('keeps the searches as they came', async () => {
    competitorRepository.items.push(makeCompetitor({ projectId: project.id }))
    competitorRepository.approvals.set(project.id.toValue(), CompetitorApproval.APPROVED)
    const searches = [{ query: 'meeting notes', results: [1, 2] }]

    const round = await sut.execute({ ...input(), searches })

    expect(round.props.searches).toEqual(searches)
  })

  it('stamps the creation time with the current moment', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-20T10:00:00Z'))
    competitorRepository.items.push(makeCompetitor({ projectId: project.id }))
    competitorRepository.approvals.set(project.id.toValue(), CompetitorApproval.APPROVED)

    const round = await sut.execute(input())
    vi.useRealTimers()

    expect(round.props.createdAt).toEqual(new Date('2026-11-20T10:00:00Z'))
  })

  it('opens another round without touching the previous one', async () => {
    competitorRepository.items.push(makeCompetitor({ projectId: project.id }))
    competitorRepository.approvals.set(project.id.toValue(), CompetitorApproval.APPROVED)

    const first = await sut.execute(input())
    const second = await sut.execute(input())

    expect(second.id.isEqual(first.id)).toBe(false)
    expect(seoRoundRepository.rounds).toEqual([first, second])
  })

  it('rejects a list that was not approved', async () => {
    competitorRepository.items.push(makeCompetitor({ projectId: project.id }))

    await expect(sut.execute(input())).rejects.toBeInstanceOf(NoActiveCompetitorsError)
    expect(seoRoundRepository.rounds).toEqual([])
  })

  it('rejects an approved list where every competitor is incorrect', async () => {
    competitorRepository.items.push(makeCompetitor({ projectId: project.id, incorrect: true }))
    competitorRepository.approvals.set(project.id.toValue(), CompetitorApproval.APPROVED)

    await expect(sut.execute(input())).rejects.toBeInstanceOf(NoActiveCompetitorsError)
  })

  it('rejects an unknown project', async () => {
    await expect(sut.execute({ ...input(), projectId: createID().toValue() })).rejects.toMatchObject(
      { response: { code: 'PROJECT_NOT_FOUND' } },
    )
  })
})
