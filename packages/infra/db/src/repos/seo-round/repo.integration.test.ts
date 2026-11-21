import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ID, createID } from '@domain/base'
import {
  SeoCompetitorAlreadySavedError,
  SeoCompetitorData,
  SeoCompetitorPayload,
  SeoDocumentAlreadySavedError,
  SeoRound,
  SeoRoundDocument,
  SeoRoundProps,
  SeoTool,
} from '@domain/competitor-analysis'
import { Project, ProjectPhase, ProjectPlatform } from '@domain/projects'
import { createTempDatabase, TempDatabase } from '@infra/db/__tests__/temp-database'
import { SqliteProjectRepository } from '@infra/db/repos/project/repo'
import { SqliteSeoRoundRepository } from '@infra/db/repos/seo-round/repo'

const SAME_INSTANT = new Date('2026-11-20T10:00:00.000Z')

const PAYLOAD: SeoCompetitorPayload = {
  profile: { url: 'https://acme.test', numbers: { sitemapUrlsMainLanguage: 12, pct: 0.5 } },
  categories: [{ name: 'Guides', posts30: null }],
  clusters: [],
  comparisons: [{ title: 'Acme vs Beta', products: ['Acme', 'Beta'] }],
  examples: [],
  folders: [],
  items: [{ url: 'https://acme.test/blog/a', title: 'Ação' }],
  audiences: [{ level: 'beginner', numbers: { pct: 100 } }],
}

describe('SqliteSeoRoundRepository', () => {
  let temp: TempDatabase
  let repository: SqliteSeoRoundRepository
  let projectId: ID

  function buildRound(overrides: Partial<SeoRoundProps> = {}): SeoRound {
    return SeoRound.create({
      projectId,
      tool: SeoTool.CLAUDE_CODE,
      collectedAt: new Date('2026-11-19T00:00:00.000Z'),
      note: 'Limits of the collection',
      market: 'Brazil',
      expectedCompetitors: ['acme', 'beta'],
      searches: [{ query: 'best tool', results: [{ position: 1, url: 'https://a.test' }] }],
      createdAt: SAME_INSTANT,
      ...overrides,
    })
  }

  function buildCompetitor(round: SeoRound, name: string): SeoCompetitorData {
    return SeoCompetitorData.create({
      roundId: round.id,
      name,
      normalizedName: name.toLowerCase(),
      data: PAYLOAD,
    })
  }

  function buildDocument(round: SeoRound, fileName: string, body = 'Body ção'): SeoRoundDocument {
    return SeoRoundDocument.create({
      roundId: round.id,
      title: `Title ${fileName}`,
      fileName,
      about: 'About',
      body,
      size: 0,
    })
  }

  beforeEach(async () => {
    temp = createTempDatabase()
    repository = new SqliteSeoRoundRepository(temp.database)

    const project = Project.create({
      name: 'Acme',
      platform: ProjectPlatform.WEB,
      phase: ProjectPhase.NO_CUSTOMERS,
      description: 'Acme project',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await new SqliteProjectRepository(temp.database).create(project)
    projectId = project.id
  })

  afterEach(() => {
    temp.dispose()
  })

  it('reads the round back with expected competitors and searches equal to what was saved', async () => {
    const round = buildRound()

    await repository.createRound(round)
    const found = await repository.findRound({ projectId, roundId: round.id })

    expect(found?.props).toEqual(round.props)
    expect(found?.id.isEqual(round.id)).toBe(true)
  })

  it('reads the competitor data back equal, including nulls and accents', async () => {
    const round = await repository.createRound(buildRound())
    await repository.insertCompetitor(buildCompetitor(round, 'Acme'))

    const found = await repository.findCompetitor({ roundId: round.id, normalizedName: 'acme' })
    const listed = await repository.listCompetitors(round.id)

    expect(found?.props.data).toEqual(PAYLOAD)
    expect(found?.props.name).toBe('Acme')
    expect(listed).toHaveLength(1)
    expect(await repository.findCompetitor({ roundId: round.id, normalizedName: 'beta' })).toBeNull()
  })

  it('lists rounds in creation order and finds the latest, even with the same created_at', async () => {
    const first = await repository.createRound(buildRound({ note: 'first' }))
    const second = await repository.createRound(buildRound({ note: 'second' }))
    const third = await repository.createRound(buildRound({ note: 'third' }))

    const listed = await repository.listRounds(projectId)
    const latest = await repository.findRound({ projectId })

    expect(listed.map((round) => round.props.note)).toEqual(['first', 'second', 'third'])
    expect(latest?.id.isEqual(third.id)).toBe(true)
    expect(first.id.isEqual(listed[0].id)).toBe(true)
    expect(second.id.isEqual(listed[1].id)).toBe(true)
  })

  it('orders by created_at before insertion order', async () => {
    await repository.createRound(buildRound({ note: 'newer', createdAt: new Date('2026-11-21T00:00:00.000Z') }))
    await repository.createRound(buildRound({ note: 'older', createdAt: new Date('2026-11-01T00:00:00.000Z') }))

    const listed = await repository.listRounds(projectId)
    const latest = await repository.findRound({ projectId })

    expect(listed.map((round) => round.props.note)).toEqual(['older', 'newer'])
    expect(latest?.props.note).toBe('newer')
  })

  it('returns null for an unknown round and for a project without rounds', async () => {
    expect(await repository.findRound({ projectId })).toBeNull()
    expect(await repository.findRound({ projectId, roundId: createID() })).toBeNull()
    expect(await repository.listRounds(projectId)).toEqual([])
  })

  it('refuses a competitor saved twice in the round and keeps the first one', async () => {
    const round = await repository.createRound(buildRound())
    await repository.insertCompetitor(buildCompetitor(round, 'Acme'))

    await expect(repository.insertCompetitor(buildCompetitor(round, 'Acme'))).rejects.toBeInstanceOf(
      SeoCompetitorAlreadySavedError,
    )
    expect(await repository.listCompetitors(round.id)).toHaveLength(1)
  })

  it('accepts the same competitor in another round', async () => {
    const first = await repository.createRound(buildRound())
    const second = await repository.createRound(buildRound())

    await repository.insertCompetitor(buildCompetitor(first, 'Acme'))
    await repository.insertCompetitor(buildCompetitor(second, 'Acme'))

    expect(await repository.listCompetitors(first.id)).toHaveLength(1)
    expect(await repository.listCompetitors(second.id)).toHaveLength(1)
  })

  it('keeps documents in insertion order, with body and size, and refuses a repeated file name', async () => {
    const round = await repository.createRound(buildRound())
    await repository.insertDocument(buildDocument(round, 'b.md'))
    await repository.insertDocument(buildDocument(round, 'a.md', 'x'))

    await expect(repository.insertDocument(buildDocument(round, 'a.md'))).rejects.toBeInstanceOf(
      SeoDocumentAlreadySavedError,
    )
    const documents = await repository.listDocuments(round.id)

    expect(documents.map((document) => document.props.fileName)).toEqual(['b.md', 'a.md'])
    expect(documents[0].props.body).toBe('Body ção')
    expect(documents[0].props.size).toBe(10)
  })

  it('keeps the v1 seo row in channel_analyses untouched', async () => {
    temp.database
      .prepare(
        `INSERT INTO channel_analyses
           (id, project_id, channel, score, rationale, best_content_type, best_content_evidence,
            best_content_basis, collected_at)
         VALUES ('legacy', ?, 'seo', 5, 'old', 'post', 'evidence', 'fact', '2026-11-01T00:00:00.000Z')`,
      )
      .run(projectId.toValue())

    const round = await repository.createRound(buildRound())
    await repository.insertCompetitor(buildCompetitor(round, 'Acme'))

    const rows = temp.database.prepare("SELECT channel FROM channel_analyses WHERE channel = 'seo'").all()
    expect(rows).toHaveLength(1)
  })
})
