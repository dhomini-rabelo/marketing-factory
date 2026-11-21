import { beforeEach, describe, expect, it } from 'vitest'
import { createID } from '@domain/base'
import { makeCompetitor } from '@domain/competitor-analysis/application/__tests__/factories/competitor'
import { makeProject } from '@domain/competitor-analysis/application/__tests__/factories/project'
import {
  makeSeoCompetitorData,
  makeSeoRound,
  makeSeoRoundDocument,
} from '@domain/competitor-analysis/application/__tests__/factories/seo-round'
import { InMemoryCompetitorRepository } from '@domain/competitor-analysis/application/__tests__/repositories/competitor'
import { InMemoryProjectRepository } from '@domain/competitor-analysis/application/__tests__/repositories/project'
import { InMemorySeoRoundRepository } from '@domain/competitor-analysis/application/__tests__/repositories/seo-round'
import { GetSeoCompetitorUseCase } from '@domain/competitor-analysis/application/use-cases/seo/get-seo-competitor'
import { SeoRound } from '@domain/competitor-analysis/enterprise/entities/seo-round'
import { Project } from '@domain/projects'

describe('GetSeoCompetitorUseCase', () => {
  let projectRepository: InMemoryProjectRepository
  let competitorRepository: InMemoryCompetitorRepository
  let seoRoundRepository: InMemorySeoRoundRepository
  let project: Project
  let round: SeoRound
  let sut: GetSeoCompetitorUseCase

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository()
    competitorRepository = new InMemoryCompetitorRepository()
    seoRoundRepository = new InMemorySeoRoundRepository()
    project = makeProject()
    projectRepository.items.push(project)
    competitorRepository.items.push(
      makeCompetitor({ projectId: project.id, name: 'Cally' }),
      makeCompetitor({ projectId: project.id, name: 'Otter' }),
      makeCompetitor({ projectId: project.id, name: 'Wrong', incorrect: true }),
    )
    round = makeSeoRound({ projectId: project.id })
    seoRoundRepository.rounds.push(round)
    sut = new GetSeoCompetitorUseCase({
      project: projectRepository,
      competitor: competitorRepository,
      seoRound: seoRoundRepository,
    })
  })

  it('returns the whole data of the competitor and the documents that mention it, with body', async () => {
    const cally = makeSeoCompetitorData({ roundId: round.id, name: 'Cally' })
    const otherRound = makeSeoCompetitorData({ roundId: createID(), name: 'Cally' })
    seoRoundRepository.competitors.push(cally, otherRound)
    const byTitle = makeSeoRoundDocument({ roundId: round.id, title: 'About CALLY', about: 'x', body: 'one' })
    const byAbout = makeSeoRoundDocument({ roundId: round.id, title: 'Plain', about: 'Notes on cally pages', body: 'two' })
    const unrelated = makeSeoRoundDocument({ roundId: round.id, title: 'Otter only', about: 'otter' })
    const foreign = makeSeoRoundDocument({ roundId: createID(), title: 'Cally' })
    seoRoundRepository.documents.push(byTitle, byAbout, unrelated, foreign)

    const response = await sut.execute({
      projectId: project.id.toValue(),
      roundId: round.id.toValue(),
      name: ' cally ',
    })

    expect(response.round).toBe(round)
    expect(response.competitor).toBe(cally)
    expect(response.documents).toEqual([byTitle, byAbout])
    expect(response.documents.map((document) => document.props.body)).toEqual(['one', 'two'])
  })

  it('resolves latest', async () => {
    seoRoundRepository.competitors.push(makeSeoCompetitorData({ roundId: round.id, name: 'Cally' }))

    const response = await sut.execute({
      projectId: project.id.toValue(),
      roundId: 'latest',
      name: 'Cally',
    })

    expect(response.round).toBe(round)
  })

  it('does not hide a competitor marked incorrect', async () => {
    seoRoundRepository.competitors.push(makeSeoCompetitorData({ roundId: round.id, name: 'Wrong' }))

    const response = await sut.execute({
      projectId: project.id.toValue(),
      roundId: round.id.toValue(),
      name: 'Wrong',
    })

    expect(response.competitor.props.name).toBe('Wrong')
  })

  it('rejects a competitor of the list with no data in the round', async () => {
    await expect(
      sut.execute({ projectId: project.id.toValue(), roundId: round.id.toValue(), name: 'Otter' }),
    ).rejects.toMatchObject({ response: { code: 'SEO_COMPETITOR_NOT_FOUND' } })
  })

  it('rejects a name outside the project list', async () => {
    await expect(
      sut.execute({ projectId: project.id.toValue(), roundId: round.id.toValue(), name: 'Nobody' }),
    ).rejects.toMatchObject({ response: { code: 'COMPETITOR_NOT_FOUND' } })
  })

  it('rejects an unknown round and an unknown project', async () => {
    await expect(
      sut.execute({ projectId: project.id.toValue(), roundId: createID().toValue(), name: 'Cally' }),
    ).rejects.toMatchObject({ response: { code: 'SEO_ROUND_NOT_FOUND' } })
    await expect(
      sut.execute({ projectId: createID().toValue(), roundId: round.id.toValue(), name: 'Cally' }),
    ).rejects.toMatchObject({ response: { code: 'PROJECT_NOT_FOUND' } })
  })
})
