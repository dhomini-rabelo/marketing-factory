import { beforeEach, describe, expect, it } from 'vitest'
import { createID } from '@domain/base'
import { makeProject } from '@domain/competitor-analysis/application/__tests__/factories/project'
import { makeSeoRound } from '@domain/competitor-analysis/application/__tests__/factories/seo-round'
import { InMemoryProjectRepository } from '@domain/competitor-analysis/application/__tests__/repositories/project'
import { InMemorySeoRoundRepository } from '@domain/competitor-analysis/application/__tests__/repositories/seo-round'
import { SeoDocumentAlreadySavedError } from '@domain/competitor-analysis/application/errors/seo-document-already-saved-error'
import { SaveSeoDocumentUseCase } from '@domain/competitor-analysis/application/use-cases/seo/save-seo-document'
import { SeoRound } from '@domain/competitor-analysis/enterprise/entities/seo-round'
import { Project } from '@domain/projects'

describe('SaveSeoDocumentUseCase', () => {
  let projectRepository: InMemoryProjectRepository
  let seoRoundRepository: InMemorySeoRoundRepository
  let project: Project
  let round: SeoRound
  let sut: SaveSeoDocumentUseCase

  const input = (overrides: Partial<Parameters<SaveSeoDocumentUseCase['execute']>[0]> = {}) => ({
    projectId: project.id.toValue(),
    roundId: round.id.toValue(),
    title: 'Fireflies vs Otter',
    fileName: 'comparison.md',
    about: 'Fireflies.ai and Otter',
    body: '# Comparison',
    ...overrides,
  })

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository()
    seoRoundRepository = new InMemorySeoRoundRepository()
    project = makeProject()
    projectRepository.items.push(project)
    round = makeSeoRound({ projectId: project.id })
    seoRoundRepository.rounds.push(round)
    sut = new SaveSeoDocumentUseCase({ project: projectRepository, seoRound: seoRoundRepository })
  })

  it('stores the document in the round with its size in bytes', async () => {
    const document = await sut.execute(input({ body: 'ação' }))

    expect(document.props.roundId).toEqual(round.id)
    expect(document.props.title).toBe('Fireflies vs Otter')
    expect(document.props.body).toBe('ação')
    expect(document.props.size).toBe(6)
    expect(seoRoundRepository.documents).toEqual([document])
  })

  it('rejects a repeated file name in the same round', async () => {
    await sut.execute(input())

    await expect(sut.execute(input({ body: 'other' }))).rejects.toBeInstanceOf(
      SeoDocumentAlreadySavedError,
    )
    expect(seoRoundRepository.documents).toHaveLength(1)
  })

  it('accepts the same file name in another round', async () => {
    await sut.execute(input())
    const otherRound = makeSeoRound({ projectId: project.id })
    seoRoundRepository.rounds.push(otherRound)

    await sut.execute(input({ roundId: otherRound.id.toValue() }))

    expect(seoRoundRepository.documents).toHaveLength(2)
  })

  it('rejects a round that does not exist', async () => {
    await expect(sut.execute(input({ roundId: createID().toValue() }))).rejects.toMatchObject({
      response: { code: 'SEO_ROUND_NOT_FOUND' },
    })
  })

  it('rejects an unknown project', async () => {
    await expect(sut.execute(input({ projectId: createID().toValue() }))).rejects.toMatchObject({
      response: { code: 'PROJECT_NOT_FOUND' },
    })
  })
})
