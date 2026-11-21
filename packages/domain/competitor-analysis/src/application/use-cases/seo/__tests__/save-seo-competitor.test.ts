import { beforeEach, describe, expect, it } from 'vitest'
import { createID } from '@domain/base'
import { makeCompetitor } from '@domain/competitor-analysis/application/__tests__/factories/competitor'
import { makeProject } from '@domain/competitor-analysis/application/__tests__/factories/project'
import {
  makeSeoCompetitorPayload,
  makeSeoRound,
} from '@domain/competitor-analysis/application/__tests__/factories/seo-round'
import { InMemoryCompetitorRepository } from '@domain/competitor-analysis/application/__tests__/repositories/competitor'
import { InMemoryProjectRepository } from '@domain/competitor-analysis/application/__tests__/repositories/project'
import { InMemorySeoRoundRepository } from '@domain/competitor-analysis/application/__tests__/repositories/seo-round'
import { SeoCompetitorAlreadySavedError } from '@domain/competitor-analysis/application/errors/seo-competitor-already-saved-error'
import { SaveSeoCompetitorUseCase } from '@domain/competitor-analysis/application/use-cases/seo/save-seo-competitor'
import { SeoRound } from '@domain/competitor-analysis/enterprise/entities/seo-round'
import { Project } from '@domain/projects'

describe('SaveSeoCompetitorUseCase', () => {
  let projectRepository: InMemoryProjectRepository
  let competitorRepository: InMemoryCompetitorRepository
  let seoRoundRepository: InMemorySeoRoundRepository
  let project: Project
  let round: SeoRound
  let sut: SaveSeoCompetitorUseCase

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository()
    competitorRepository = new InMemoryCompetitorRepository()
    seoRoundRepository = new InMemorySeoRoundRepository()
    project = makeProject()
    projectRepository.items.push(project)
    competitorRepository.items.push(
      makeCompetitor({ projectId: project.id, name: 'Fireflies.ai' }),
      makeCompetitor({ projectId: project.id, name: 'Wrong', incorrect: true }),
    )
    round = makeSeoRound({ projectId: project.id, expectedCompetitors: ['fireflies.ai'] })
    seoRoundRepository.rounds.push(round)
    sut = new SaveSeoCompetitorUseCase({
      project: projectRepository,
      competitor: competitorRepository,
      seoRound: seoRoundRepository,
    })
  })

  it('stores the competitor data as the agent delivered it, under the project name', async () => {
    const data = makeSeoCompetitorPayload()

    const saved = await sut.execute({
      projectId: project.id.toValue(),
      roundId: round.id.toValue(),
      name: '  FIREFLIES.AI',
      data,
    })

    expect(saved.props.name).toBe('Fireflies.ai')
    expect(saved.props.normalizedName).toBe('fireflies.ai')
    expect(saved.props.roundId).toEqual(round.id)
    expect(saved.props.data).toBe(data)
    expect(seoRoundRepository.competitors).toEqual([saved])
  })

  it('accepts the latest round', async () => {
    const saved = await sut.execute({
      projectId: project.id.toValue(),
      roundId: 'latest',
      name: 'Fireflies.ai',
      data: makeSeoCompetitorPayload(),
    })

    expect(saved.props.roundId).toEqual(round.id)
  })

  it('still accepts a competitor marked incorrect', async () => {
    await sut.execute({
      projectId: project.id.toValue(),
      roundId: round.id.toValue(),
      name: 'Wrong',
      data: makeSeoCompetitorPayload(),
    })

    expect(seoRoundRepository.competitors).toHaveLength(1)
  })

  it('rejects a repeated competitor and keeps what was saved first', async () => {
    const first = makeSeoCompetitorPayload()
    await sut.execute({
      projectId: project.id.toValue(),
      roundId: round.id.toValue(),
      name: 'Fireflies.ai',
      data: first,
    })

    await expect(
      sut.execute({
        projectId: project.id.toValue(),
        roundId: round.id.toValue(),
        name: 'fireflies.ai',
        data: makeSeoCompetitorPayload(),
      }),
    ).rejects.toBeInstanceOf(SeoCompetitorAlreadySavedError)

    expect(seoRoundRepository.competitors).toHaveLength(1)
    expect(seoRoundRepository.competitors[0].props.data).toBe(first)
  })

  it('rejects a name outside the project list', async () => {
    await expect(
      sut.execute({
        projectId: project.id.toValue(),
        roundId: round.id.toValue(),
        name: 'Unknown',
        data: makeSeoCompetitorPayload(),
      }),
    ).rejects.toMatchObject({ response: { code: 'COMPETITOR_NOT_FOUND' } })
  })

  it('rejects a round that does not exist', async () => {
    await expect(
      sut.execute({
        projectId: project.id.toValue(),
        roundId: createID().toValue(),
        name: 'Fireflies.ai',
        data: makeSeoCompetitorPayload(),
      }),
    ).rejects.toMatchObject({ response: { code: 'SEO_ROUND_NOT_FOUND' } })
  })

  it('rejects the round of another project', async () => {
    const foreign = makeSeoRound({ projectId: createID() })
    seoRoundRepository.rounds.push(foreign)

    await expect(
      sut.execute({
        projectId: project.id.toValue(),
        roundId: foreign.id.toValue(),
        name: 'Fireflies.ai',
        data: makeSeoCompetitorPayload(),
      }),
    ).rejects.toMatchObject({ response: { code: 'SEO_ROUND_NOT_FOUND' } })
  })

  it('rejects an unknown project', async () => {
    await expect(
      sut.execute({
        projectId: createID().toValue(),
        roundId: round.id.toValue(),
        name: 'Fireflies.ai',
        data: makeSeoCompetitorPayload(),
      }),
    ).rejects.toMatchObject({ response: { code: 'PROJECT_NOT_FOUND' } })
  })
})
