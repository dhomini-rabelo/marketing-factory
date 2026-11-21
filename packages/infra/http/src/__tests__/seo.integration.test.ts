import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { ErrorBody } from '@infra/http/middlewares/error-handler'
import type { CompetitorHttp } from '@infra/http/presenters/competitor-presenter'
import type { ProjectHttp } from '@infra/http/presenters/project-presenter'
import type {
  SeoCompetitorHttp,
  SeoRoundHttp,
  SeoRoundSummaryHttp,
} from '@infra/http/presenters/seo-round-presenter'
import { createTestApp, TestApp } from '@infra/http/__tests__/utils/create-test-app'
import { sendJson } from '@infra/http/__tests__/utils/http-client'
import { SeoFixture, sliceSeoFixture } from '../../scripts/slice-seo-fixture'

const FIXTURES_DIRECTORY = join(__dirname, '..', '..', 'scripts', 'fixtures', 'seo')
const fixture = JSON.parse(
  readFileSync(join(FIXTURES_DIRECTORY, 'teste-5.json'), 'utf8'),
) as SeoFixture

const NAMES = ['tl;dv', 'Fireflies.ai', 'Otter.ai', 'Fathom', 'MeetGeek', 'Tactiq']

const validProject = {
  name: 'Demo',
  platform: 'web',
  phase: 'no_customers',
  description: 'Projeto de demonstração',
}

function buildCompetitor(name: string) {
  return {
    name,
    role: 'main',
    marketFocus: 'Reuniões',
    services: 'Transcrição',
    features: 'Resumo',
    audience: 'Times',
    rationale: 'Aparece nas buscas',
    url: `https://${name.toLowerCase()}.example`,
  }
}

describe('seo routes', () => {
  let app: TestApp
  let projectId: string

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app.dispose()
  })

  beforeEach(async () => {
    app.database.exec(
      'DELETE FROM seo_round_documents; DELETE FROM seo_round_competitors; DELETE FROM seo_rounds; DELETE FROM channel_findings; DELETE FROM channel_analyses; DELETE FROM competitors; DELETE FROM competitor_approvals; DELETE FROM documents; DELETE FROM projects',
    )

    const project = await sendJson<ProjectHttp>({
      baseUrl: app.baseUrl,
      method: 'POST',
      path: '/projects',
      body: validProject,
    })
    projectId = project.body.id
  })

  async function approveCompetitors(names = NAMES, targetProjectId = projectId) {
    await sendJson({
      baseUrl: app.baseUrl,
      method: 'PUT',
      path: `/projects/${targetProjectId}/competitors`,
      body: { competitors: names.map((name) => buildCompetitor(name)) },
    })
    await sendJson({
      baseUrl: app.baseUrl,
      method: 'PUT',
      path: `/projects/${targetProjectId}/competitors-approval`,
      body: { approved: true },
    })
  }

  async function openRound(body: Record<string, unknown> = {}) {
    return sendJson<{ id: string }>({
      baseUrl: app.baseUrl,
      method: 'POST',
      path: `/projects/${projectId}/seo/rounds`,
      body: {
        tool: fixture.tool,
        collectedAt: fixture.collectedAt,
        note: fixture.note,
        market: 'Brasil',
        ...body,
      },
    })
  }

  function saveCompetitor(roundId: string, name: string, body: unknown = sliceSeoFixture(fixture, name)) {
    return sendJson<ErrorBody | Record<string, never>>({
      baseUrl: app.baseUrl,
      method: 'PUT',
      path: `/projects/${projectId}/seo/rounds/${roundId}/competitors/${encodeURIComponent(name)}`,
      body,
    })
  }

  function readRound(roundId = 'latest') {
    return sendJson<SeoRoundHttp & ErrorBody>({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: `/projects/${projectId}/seo/rounds/${roundId}`,
    })
  }

  function readCompetitor(roundId: string, name: string) {
    return sendJson<SeoCompetitorHttp & ErrorBody>({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: `/projects/${projectId}/seo/rounds/${roundId}/competitors/${encodeURIComponent(name)}`,
    })
  }

  function listRounds() {
    return sendJson<{ rounds: SeoRoundSummaryHttp[] }>({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: `/projects/${projectId}/seo/rounds`,
    })
  }

  async function saveAll(roundId: string, names = NAMES) {
    for (const name of names) {
      await saveCompetitor(roundId, name)
    }
  }

  it('T01 saves the six competitors one by one and shows each part right after saving', async () => {
    await approveCompetitors()
    const round = await openRound()
    expect(round.status).toBe(201)

    for (const [index, name] of NAMES.entries()) {
      const saved = await saveCompetitor(round.body.id, name)
      const read = await readRound(round.body.id)
      const collected = read.body.competitors.filter((competitor) => competitor.collected)

      expect(saved.status).toBe(201)
      expect(collected).toHaveLength(index + 1)
      expect(read.body.status).toBe(index === NAMES.length - 1 ? 'complete' : 'partial')
    }

    const read = await readRound(round.body.id)
    expect(read.body.missing).toEqual([])
    expect(read.body.competitors.map((competitor) => competitor.name)).toEqual(
      expect.arrayContaining(NAMES),
    )
  })

  it('T02 keeps the five saved competitors untouched when the sixth arrives later', async () => {
    await approveCompetitors()
    const round = await openRound()
    await saveAll(round.body.id, NAMES.slice(0, 5))

    const partial = await readRound(round.body.id)
    const before = await readCompetitor(round.body.id, NAMES[0])
    await saveCompetitor(round.body.id, NAMES[5])
    const complete = await readRound(round.body.id)
    const after = await readCompetitor(round.body.id, NAMES[0])

    expect(partial.body.status).toBe('partial')
    expect(partial.body.missing).toEqual(['Tactiq'])
    expect(complete.body.status).toBe('complete')
    expect(after.body).toEqual(before.body)
  })

  it('T03 refuses a competitor with a broken shape naming what is missing and keeps the previous round latest', async () => {
    await approveCompetitors()
    const previous = await openRound()
    const current = await openRound()
    const { items: _items, audiences: _audiences, ...broken } = sliceSeoFixture(fixture, NAMES[0])

    const refused = await saveCompetitor(previous.body.id, NAMES[0], broken)
    const latest = await readRound()

    expect(refused.status).toBe(400)
    const refusedBody = refused.body as ErrorBody
    expect(refusedBody.error.code).toBe('VALIDATION_ERROR')
    expect(refusedBody.error.fields?.map((field) => field.field)).toEqual(['items', 'audiences'])
    expect(latest.body.id).toBe(current.body.id)
    expect((await readRound(previous.body.id)).body.competitors.some((item) => item.collected)).toBe(
      false,
    )
  })

  it('T04 refuses a competitor saved twice and keeps what was saved first', async () => {
    await approveCompetitors()
    const round = await openRound()
    await saveCompetitor(round.body.id, NAMES[0])
    const before = await readCompetitor(round.body.id, NAMES[0])
    const changed = { ...sliceSeoFixture(fixture, NAMES[0]), items: [] }

    const repeated = await saveCompetitor(round.body.id, NAMES[0], changed)
    const after = await readCompetitor(round.body.id, NAMES[0])

    expect(repeated.status).toBe(409)
    expect((repeated.body as ErrorBody).error.code).toBe('SEO_COMPETITOR_ALREADY_SAVED')
    expect(after.body).toEqual(before.body)
    expect(after.body.items.length).toBeGreaterThan(0)
  })

  it('T05 refuses a competitor over 1 MB asking to split and leaves the round partial', async () => {
    await approveCompetitors()
    const round = await openRound()
    await saveAll(round.body.id, NAMES.slice(1))
    const oversized = {
      ...sliceSeoFixture(fixture, NAMES[0]),
      items: [{ title: 'x'.repeat(1_100_000) }],
    }

    const refused = await saveCompetitor(round.body.id, NAMES[0], oversized)
    const read = await readRound(round.body.id)

    expect(refused.status).toBe(413)
    expect((refused.body as ErrorBody).error.code).toBe('PAYLOAD_TOO_LARGE')
    expect((refused.body as ErrorBody).error.message).toContain('split the content into smaller parts')
    expect(read.body.status).toBe('partial')
    expect(read.body.missing).toEqual([NAMES[0]])
  })

  it('T06 opens a new round when a partial one is open and leaves the partial as it was', async () => {
    await approveCompetitors()
    const partial = await openRound()
    await saveAll(partial.body.id, NAMES.slice(0, 2))

    const next = await openRound()
    const oldRound = await readRound(partial.body.id)

    expect(next.body.id).not.toBe(partial.body.id)
    expect(oldRound.body.status).toBe('partial')
    expect(oldRound.body.competitors.filter((competitor) => competitor.collected)).toHaveLength(2)
    expect((await readRound()).body.id).toBe(next.body.id)
  })

  it('T07 reads the latest and an older round as saved, with no route to edit or delete', async () => {
    await approveCompetitors()
    const older = await openRound({ note: 'older note', searches: [{ query: 'q', results: [] }] })
    await saveAll(older.body.id, NAMES.slice(0, 1))
    const newer = await openRound({ note: 'newer note' })

    const latest = await readRound()
    const byId = await readRound(older.body.id)
    const attempts = await Promise.all(
      ['PUT', 'PATCH', 'DELETE'].map((method) =>
        fetch(`${app.baseUrl}/projects/${projectId}/seo/rounds/${older.body.id}`, { method }),
      ),
    )
    const competitorDelete = await fetch(
      `${app.baseUrl}/projects/${projectId}/seo/rounds/${older.body.id}/competitors/${encodeURIComponent(NAMES[0])}`,
      { method: 'DELETE' },
    )

    expect(latest.body.id).toBe(newer.body.id)
    expect(latest.body.note).toBe('newer note')
    expect(byId.body.note).toBe('older note')
    expect(byId.body.searches).toEqual([{ query: 'q', results: [] }])
    expect(byId.body.collectedAt).toBe(fixture.collectedAt)
    expect(attempts.map((attempt) => attempt.status)).toEqual([404, 404, 404])
    expect(competitorDelete.status).toBe(404)
  })

  it('T08 reads one competitor with only its own data and the documents that mention it', async () => {
    await approveCompetitors()
    const round = await openRound()
    await saveAll(round.body.id)
    for (const document of fixture.documents) {
      await sendJson({
        baseUrl: app.baseUrl,
        method: 'POST',
        path: `/projects/${projectId}/seo/rounds/${round.body.id}/documents`,
        body: {
          ...document,
          body: readFileSync(join(FIXTURES_DIRECTORY, 'docs', document.fileName), 'utf8'),
        },
      })
    }

    const read = await readCompetitor(round.body.id, 'Fathom')
    const expected = sliceSeoFixture(fixture, 'Fathom')

    expect(read.status).toBe(200)
    expect(read.body.name).toBe('Fathom')
    expect(read.body.items).toEqual(expected.items)
    expect(read.body.profile).toEqual(expected.profile)
    expect(JSON.stringify(read.body.items)).not.toContain('Otter.ai')
    expect(read.body.documents.length).toBeGreaterThan(0)
    expect(read.body.documents.every((document) => document.body.length > 0)).toBe(true)
    expect(read.body.documents.map((document) => document.fileName)).toContain(
      'seo-comparacoes-e-alternativas-fathom.md',
    )
  })

  it('T09 hides a competitor marked as not a competitor from the round reading', async () => {
    await approveCompetitors()
    const round = await openRound()
    await saveAll(round.body.id)
    const list = await sendJson<{ competitors: CompetitorHttp[] }>({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: `/projects/${projectId}/competitors`,
    })
    const tactiq = list.body.competitors.find((competitor) => competitor.name === 'Tactiq')

    await sendJson({
      baseUrl: app.baseUrl,
      method: 'PATCH',
      path: `/projects/${projectId}/competitors/${tactiq?.id}`,
      body: { incorrect: true },
    })
    const read = await readRound(round.body.id)

    expect(read.body.competitors.map((competitor) => competitor.name)).not.toContain('Tactiq')
    expect(read.body.pagesRead).toBe(53 - 10)
    expect(read.body.status).toBe('complete')
  })

  it('T10 does not show the v1 note nor findings and keeps the v1 row in the database', async () => {
    await approveCompetitors()
    app.database
      .prepare(
        `INSERT INTO channel_analyses
           (id, project_id, channel, score, rationale, best_content_type, best_content_evidence,
            best_content_basis, collected_at)
         VALUES ('legacy', ?, 'seo', 8, 'Old SEO note', 'guide', 'Most read', 'fact', '2026-11-01T10:00:00.000Z')`,
      )
      .run(projectId)
    app.database
      .prepare(
        `INSERT INTO channel_findings (project_id, channel, position, competitor, aspect, kind, statement)
         VALUES (?, 'seo', 0, 'Acme', 'format', 'fact', 'Old SEO finding')`,
      )
      .run(projectId)
    const round = await openRound()
    await saveAll(round.body.id, NAMES.slice(0, 1))

    const read = await readRound()
    const empty = await listRounds()
    const rows = app.database
      .prepare("SELECT COUNT(*) AS total FROM channel_analyses WHERE channel = 'seo'")
      .get()

    const text = JSON.stringify(read.body)
    expect(text).not.toContain('Old SEO note')
    expect(text).not.toContain('Old SEO finding')
    expect(empty.body.rounds).toHaveLength(1)
    expect(rows).toEqual({ total: 1 })
  })

  it('reads the six teste 5 competitors with only the Fireflies.ai page sum warning', async () => {
    await approveCompetitors()
    const round = await openRound()
    await saveAll(round.body.id)

    const read = await readRound(round.body.id)
    const items = sliceSeoFixture(fixture, 'Fireflies.ai').items

    expect(read.body.status).toBe('complete')
    expect(read.body.warnings).toHaveLength(1)
    expect(read.body.warnings[0]).toMatchObject({ check: 'pageTypeSum', competitor: 'Fireflies.ai' })
    expect(items).toHaveLength(8)
  })

  it('counts pages read for the round and per competitor, with null for the one not saved', async () => {
    await approveCompetitors()
    const round = await openRound()
    await saveAll(round.body.id)

    const complete = await readRound(round.body.id)
    const pagesByName = Object.fromEntries(
      complete.body.competitors.map((competitor) => [competitor.name, competitor.pagesRead]),
    )
    const partialRound = await openRound()
    await saveAll(partialRound.body.id, NAMES.slice(0, 5))
    const partial = await readRound(partialRound.body.id)
    const missing = partial.body.competitors.find((competitor) => competitor.name === 'Tactiq')

    expect(complete.body.pagesRead).toBe(53)
    expect(pagesByName).toEqual({
      'tl;dv': 10,
      'Fireflies.ai': 8,
      'Otter.ai': 8,
      Fathom: 8,
      MeetGeek: 9,
      Tactiq: 10,
    })
    expect(missing).toMatchObject({ collected: false, pagesRead: null, profile: null })
  })

  it('lists rounds newest first with number, latest flag, status and searches kept', async () => {
    await approveCompetitors()
    const first = await openRound()
    await saveAll(first.body.id, NAMES.slice(0, 2))
    const second = await openRound({ searches: [{ query: 'saved search', results: [] }] })
    await saveAll(second.body.id)

    const listed = await listRounds()
    const read = await readRound(second.body.id)

    expect(listed.body.rounds.map((round) => [round.id, round.number, round.isLatest, round.status])).toEqual([
      [second.body.id, 2, true, 'complete'],
      [first.body.id, 1, false, 'partial'],
    ])
    expect(read.body.searches).toEqual([{ query: 'saved search', results: [] }])
  })

  it('answers the empty list for a project without rounds and 404 for latest', async () => {
    const listed = await listRounds()
    const latest = await readRound()

    expect(listed.body).toEqual({ rounds: [] })
    expect(latest.status).toBe(404)
    expect(latest.body.error.code).toBe('SEO_ROUND_NOT_FOUND')
  })

  it('refuses a round while the list is not approved', async () => {
    const refused = await openRound()

    expect(refused.status).toBe(409)
    expect((refused.body as unknown as ErrorBody).error.code).toBe('NO_ACTIVE_COMPETITORS')
  })

  it('answers 404 for a competitor outside the project list, one without data and an unknown project', async () => {
    await approveCompetitors()
    const round = await openRound()

    const outside = await saveCompetitor(round.body.id, 'Unknown Tool', sliceSeoFixture(fixture, NAMES[0]))
    const withoutData = await readCompetitor(round.body.id, 'Fathom')
    const unknownProject = await sendJson<ErrorBody>({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: '/projects/missing/seo/rounds',
    })

    expect(outside.status).toBe(404)
    expect((outside.body as ErrorBody).error.code).toBe('COMPETITOR_NOT_FOUND')
    expect(withoutData.status).toBe(404)
    expect(withoutData.body.error.code).toBe('SEO_COMPETITOR_NOT_FOUND')
    expect(unknownProject.status).toBe(404)
    expect(unknownProject.body.error.code).toBe('PROJECT_NOT_FOUND')
  })

  it('saves a document once and refuses the same file name again', async () => {
    await approveCompetitors()
    const round = await openRound()
    const document = { title: 'T', fileName: 'a.md', about: 'About', body: 'Body' }
    const post = () =>
      sendJson<ErrorBody>({
        baseUrl: app.baseUrl,
        method: 'POST',
        path: `/projects/${projectId}/seo/rounds/${round.body.id}/documents`,
        body: document,
      })

    const first = await post()
    const second = await post()
    const read = await readRound(round.body.id)

    expect(first.status).toBe(201)
    expect(second.status).toBe(409)
    expect(second.body.error.code).toBe('SEO_DOCUMENT_ALREADY_SAVED')
    expect(read.body.documents).toEqual([{ title: 'T', fileName: 'a.md', about: 'About', size: 4 }])
  })

  it('refuses a round opened with an invalid tool or date', async () => {
    await approveCompetitors()

    const badTool = await openRound({ tool: 'other' })
    const badDate = await openRound({ collectedAt: '21/11/2026' })

    expect(badTool.status).toBe(400)
    expect(badDate.status).toBe(400)
  })
})
