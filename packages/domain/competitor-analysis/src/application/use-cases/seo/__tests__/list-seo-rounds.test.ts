import { beforeEach, describe, expect, it } from 'vitest'
import { createID } from '@domain/base'
import { makeCompetitor } from '@domain/competitor-analysis/application/__tests__/factories/competitor'
import { makeProject } from '@domain/competitor-analysis/application/__tests__/factories/project'
import {
  makeSeoCompetitorData,
  makeSeoRound,
} from '@domain/competitor-analysis/application/__tests__/factories/seo-round'
import { InMemoryCompetitorRepository } from '@domain/competitor-analysis/application/__tests__/repositories/competitor'
import { InMemoryProjectRepository } from '@domain/competitor-analysis/application/__tests__/repositories/project'
import { InMemorySeoRoundRepository } from '@domain/competitor-analysis/application/__tests__/repositories/seo-round'
import { ListSeoRoundsUseCase } from '@domain/competitor-analysis/application/use-cases/seo/list-seo-rounds'
import { SeoRoundStatus } from '@domain/competitor-analysis/enterprise/entities/seo-round'
import { Project } from '@domain/projects'

describe('ListSeoRoundsUseCase', () => {
  let projectRepository: InMemoryProjectRepository
  let competitorRepository: InMemoryCompetitorRepository
  let seoRoundRepository: InMemorySeoRoundRepository
  let project: Project
  let sut: ListSeoRoundsUseCase

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository()
    competitorRepository = new InMemoryCompetitorRepository()
    seoRoundRepository = new InMemorySeoRoundRepository()
    project = makeProject()
    projectRepository.items.push(project)
    competitorRepository.items.push(
      makeCompetitor({ projectId: project.id, name: 'Cally' }),
      makeCompetitor({ projectId: project.id, name: 'Otter' }),
    )
    sut = new ListSeoRoundsUseCase({
      project: projectRepository,
      competitor: competitorRepository,
      seoRound: seoRoundRepository,
    })
  })

  it('returns an empty list for a project without rounds', async () => {
    seoRoundRepository.rounds.push(makeSeoRound({ projectId: createID() }))

    const response = await sut.execute({ projectId: project.id.toValue() })

    expect(response).toEqual({ rounds: [] })
  })

  it('lists the newest first, numbered by creation order, with only the last one as latest', async () => {
    const first = makeSeoRound({ projectId: project.id })
    const second = makeSeoRound({ projectId: project.id })
    const third = makeSeoRound({ projectId: project.id })
    seoRoundRepository.rounds.push(first, makeSeoRound({ projectId: createID() }), second, third)

    const response = await sut.execute({ projectId: project.id.toValue() })

    expect(response.rounds.map((summary) => summary.round)).toEqual([third, second, first])
    expect(response.rounds.map((summary) => summary.number)).toEqual([3, 2, 1])
    expect(response.rounds.map((summary) => summary.isLatest)).toEqual([true, false, false])
  })

  it('keeps the insertion order of two rounds created at the same instant', async () => {
    const createdAt = new Date('2026-11-18T10:00:00Z')
    const first = makeSeoRound({ projectId: project.id, createdAt })
    const second = makeSeoRound({ projectId: project.id, createdAt })
    seoRoundRepository.rounds.push(first, second)

    const response = await sut.execute({ projectId: project.id.toValue() })

    expect(response.rounds.map((summary) => summary.round)).toEqual([second, first])
    expect(response.rounds.map((summary) => summary.number)).toEqual([2, 1])
    expect(response.rounds[0].isLatest).toBe(true)
  })

  it('gives each round its own status', async () => {
    const complete = makeSeoRound({ projectId: project.id, expectedCompetitors: ['cally'] })
    const partial = makeSeoRound({ projectId: project.id, expectedCompetitors: ['cally', 'otter'] })
    seoRoundRepository.rounds.push(complete, partial)
    seoRoundRepository.competitors.push(
      makeSeoCompetitorData({ roundId: complete.id, name: 'Cally' }),
      makeSeoCompetitorData({ roundId: partial.id, name: 'Cally' }),
    )

    const response = await sut.execute({ projectId: project.id.toValue() })

    expect(response.rounds.map((summary) => summary.status)).toEqual([
      SeoRoundStatus.PARTIAL,
      SeoRoundStatus.COMPLETE,
    ])
  })

  it('does not wait for a competitor marked incorrect', async () => {
    competitorRepository.items[1] = makeCompetitor({
      projectId: project.id,
      name: 'Otter',
      incorrect: true,
    })
    const round = makeSeoRound({ projectId: project.id, expectedCompetitors: ['cally', 'otter'] })
    seoRoundRepository.rounds.push(round)
    seoRoundRepository.competitors.push(makeSeoCompetitorData({ roundId: round.id, name: 'Cally' }))

    const response = await sut.execute({ projectId: project.id.toValue() })

    expect(response.rounds[0].status).toBe(SeoRoundStatus.COMPLETE)
  })

  it('rejects an unknown project', async () => {
    await expect(sut.execute({ projectId: createID().toValue() })).rejects.toMatchObject({
      response: { code: 'PROJECT_NOT_FOUND' },
    })
  })
})
