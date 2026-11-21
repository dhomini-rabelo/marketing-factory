import { beforeEach, describe, expect, it } from 'vitest'
import { createID } from '@domain/base'
import { makeCompetitor } from '@domain/competitor-analysis/application/__tests__/factories/competitor'
import { makeProject } from '@domain/competitor-analysis/application/__tests__/factories/project'
import {
  makeSeoCompetitorData,
  makeSeoCompetitorPayload,
  makeSeoRound,
  makeSeoRoundDocument,
} from '@domain/competitor-analysis/application/__tests__/factories/seo-round'
import { InMemoryCompetitorRepository } from '@domain/competitor-analysis/application/__tests__/repositories/competitor'
import { InMemoryProjectRepository } from '@domain/competitor-analysis/application/__tests__/repositories/project'
import { InMemorySeoRoundRepository } from '@domain/competitor-analysis/application/__tests__/repositories/seo-round'
import { GetSeoRoundUseCase } from '@domain/competitor-analysis/application/use-cases/seo/get-seo-round/get-seo-round'
import { CompetitorRole } from '@domain/competitor-analysis/enterprise/entities/competitor'
import { SeoRound, SeoRoundStatus } from '@domain/competitor-analysis/enterprise/entities/seo-round'
import { Project } from '@domain/projects'

describe('GetSeoRoundUseCase', () => {
  let projectRepository: InMemoryProjectRepository
  let competitorRepository: InMemoryCompetitorRepository
  let seoRoundRepository: InMemorySeoRoundRepository
  let project: Project
  let round: SeoRound
  let sut: GetSeoRoundUseCase

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository()
    competitorRepository = new InMemoryCompetitorRepository()
    seoRoundRepository = new InMemorySeoRoundRepository()
    project = makeProject()
    projectRepository.items.push(project)
    competitorRepository.items.push(
      makeCompetitor({ projectId: project.id, name: 'Otter', role: CompetitorRole.SECONDARY }),
      makeCompetitor({ projectId: project.id, name: 'Cally', role: CompetitorRole.MAIN }),
    )
    round = makeSeoRound({ projectId: project.id, expectedCompetitors: ['otter', 'cally'] })
    seoRoundRepository.rounds.push(round)
    sut = new GetSeoRoundUseCase({
      project: projectRepository,
      competitor: competitorRepository,
      seoRound: seoRoundRepository,
    })
  })

  const collect = (name: string, itemCount = 2) =>
    seoRoundRepository.competitors.push(
      makeSeoCompetitorData({
        roundId: round.id,
        name,
        data: makeSeoCompetitorPayload({
          items: Array.from({ length: itemCount }, () => ({ url: createID().toValue() })),
          comparisons: [{ versus: 'x' }],
          clusters: [{ topic: 'y' }],
        }),
      }),
    )

  it('returns a complete round with the main competitor first and without the heavy sections', async () => {
    collect('Otter')
    collect('Cally')

    const response = await sut.execute({
      projectId: project.id.toValue(),
      roundId: round.id.toValue(),
    })

    expect(response.status).toBe(SeoRoundStatus.COMPLETE)
    expect(response.missing).toEqual([])
    expect(response.competitors.map((competitor) => competitor.name)).toEqual(['Cally', 'Otter'])
    expect(response.competitors[0]).toEqual({
      name: 'Cally',
      role: CompetitorRole.MAIN,
      collected: true,
      pagesRead: 2,
      profile: expect.any(Object),
      comparisons: [{ versus: 'x' }],
      clusters: [{ topic: 'y' }],
    })
    expect(response.competitors[0]).not.toHaveProperty('items')
    expect(response.competitors[0]).not.toHaveProperty('audiences')
  })

  it('returns a partial round naming who is missing, with null and empty data for them', async () => {
    collect('Cally')

    const response = await sut.execute({
      projectId: project.id.toValue(),
      roundId: round.id.toValue(),
    })

    expect(response.status).toBe(SeoRoundStatus.PARTIAL)
    expect(response.missing).toEqual(['Otter'])
    expect(response.competitors[1]).toEqual({
      name: 'Otter',
      role: CompetitorRole.SECONDARY,
      collected: false,
      pagesRead: null,
      profile: null,
      comparisons: [],
      clusters: [],
    })
  })

  it('sums the pages read of the collected competitors', async () => {
    collect('Cally', 3)
    collect('Otter', 4)

    const response = await sut.execute({
      projectId: project.id.toValue(),
      roundId: round.id.toValue(),
    })

    expect(response.pagesRead).toBe(7)
    expect(response.competitors.map((competitor) => competitor.pagesRead)).toEqual([3, 4])
  })

  it('hides a competitor marked incorrect and stops waiting for it', async () => {
    collect('Cally')
    collect('Otter', 5)
    competitorRepository.items[0] = makeCompetitor({
      projectId: project.id,
      name: 'Otter',
      incorrect: true,
    })

    const response = await sut.execute({
      projectId: project.id.toValue(),
      roundId: round.id.toValue(),
    })

    expect(response.competitors.map((competitor) => competitor.name)).toEqual(['Cally'])
    expect(response.pagesRead).toBe(2)
    expect(response.status).toBe(SeoRoundStatus.COMPLETE)
  })

  it('is complete when the only missing competitor was marked incorrect', async () => {
    collect('Cally')
    competitorRepository.items[0] = makeCompetitor({
      projectId: project.id,
      name: 'Otter',
      incorrect: true,
    })

    const response = await sut.execute({
      projectId: project.id.toValue(),
      roundId: round.id.toValue(),
    })

    expect(response.status).toBe(SeoRoundStatus.COMPLETE)
    expect(response.missing).toEqual([])
  })

  it('does not list a project competitor that the round did not expect and did not collect', async () => {
    competitorRepository.items.push(makeCompetitor({ projectId: project.id, name: 'Late' }))
    collect('Cally')
    collect('Otter')

    const response = await sut.execute({
      projectId: project.id.toValue(),
      roundId: round.id.toValue(),
    })

    expect(response.competitors.map((competitor) => competitor.name)).toEqual(['Cally', 'Otter'])
    expect(response.status).toBe(SeoRoundStatus.COMPLETE)
  })

  it('warns about the accounts without changing the data', async () => {
    seoRoundRepository.competitors.push(
      makeSeoCompetitorData({
        roundId: round.id,
        name: 'Cally',
        data: makeSeoCompetitorPayload({ audiences: [{ numbers: { pct: 10 } }] }),
      }),
    )

    const response = await sut.execute({
      projectId: project.id.toValue(),
      roundId: round.id.toValue(),
    })

    expect(response.warnings).toHaveLength(1)
    expect(response.warnings[0]).toMatchObject({ check: 'audienceShare', competitor: 'Cally' })
    expect(response.competitors[0].collected).toBe(true)
  })

  it('returns the documents without body and without round id', async () => {
    seoRoundRepository.documents.push(
      makeSeoRoundDocument({ roundId: round.id, title: 'Doc', fileName: 'doc.md', about: 'About', body: 'abc' }),
      makeSeoRoundDocument({ roundId: createID() }),
    )

    const response = await sut.execute({
      projectId: project.id.toValue(),
      roundId: round.id.toValue(),
    })

    expect(response.documents).toEqual([
      { title: 'Doc', fileName: 'doc.md', about: 'About', size: 3 },
    ])
  })

  it('resolves latest to the last round of the project', async () => {
    const newest = makeSeoRound({ projectId: project.id, expectedCompetitors: ['cally'] })
    seoRoundRepository.rounds.push(newest, makeSeoRound({ projectId: createID() }))

    const response = await sut.execute({ projectId: project.id.toValue(), roundId: 'latest' })

    expect(response.round).toBe(newest)
  })

  it('rejects latest when the project has no round', async () => {
    seoRoundRepository.rounds = []

    await expect(
      sut.execute({ projectId: project.id.toValue(), roundId: 'latest' }),
    ).rejects.toMatchObject({ response: { code: 'SEO_ROUND_NOT_FOUND' } })
  })

  it('rejects an unknown round and an unknown project', async () => {
    await expect(
      sut.execute({ projectId: project.id.toValue(), roundId: createID().toValue() }),
    ).rejects.toMatchObject({ response: { code: 'SEO_ROUND_NOT_FOUND' } })
    await expect(
      sut.execute({ projectId: createID().toValue(), roundId: round.id.toValue() }),
    ).rejects.toMatchObject({ response: { code: 'PROJECT_NOT_FOUND' } })
  })
})
