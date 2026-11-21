import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { ErrorBody } from '@infra/http/middlewares/error-handler'
import type { CompetitorHttp } from '@infra/http/presenters/competitor-presenter'
import type { ProjectHttp } from '@infra/http/presenters/project-presenter'
import { createTestApp, TestApp } from '@infra/http/__tests__/utils/create-test-app'
import { sendJson } from '@infra/http/__tests__/utils/http-client'

const validProject = {
  name: 'Demo',
  platform: 'web',
  phase: 'no_customers',
  description: 'Projeto de demonstração',
}

type CompetitorListHttp = { approval: string; competitors: CompetitorHttp[] }

function buildCompetitor(name: string, overrides: Record<string, unknown> = {}) {
  return {
    name,
    role: 'main',
    marketFocus: 'Lojas de varejo',
    services: 'Consultoria',
    features: 'Painel e relatórios',
    audience: 'Donos de loja',
    rationale: 'Aparece nas primeiras buscas',
    url: `https://${name.toLowerCase()}.example`,
    ...overrides,
  }
}

describe('competitor routes', () => {
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
      'DELETE FROM channel_findings; DELETE FROM channel_analyses; DELETE FROM competitors; DELETE FROM competitor_approvals; DELETE FROM documents; DELETE FROM projects',
    )

    const project = await sendJson<ProjectHttp>({
      baseUrl: app.baseUrl,
      method: 'POST',
      path: '/projects',
      body: validProject,
    })
    projectId = project.body.id
  })

  function saveCompetitors<Body = CompetitorListHttp>(
    competitors: unknown = [buildCompetitor('Acme')],
    targetProjectId = projectId,
  ) {
    return sendJson<Body>({
      baseUrl: app.baseUrl,
      method: 'PUT',
      path: `/projects/${targetProjectId}/competitors`,
      body: { competitors },
    })
  }

  function listCompetitors<Body = CompetitorListHttp>(targetProjectId = projectId) {
    return sendJson<Body>({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: `/projects/${targetProjectId}/competitors`,
    })
  }

  function markCompetitor<Body = CompetitorHttp>(
    competitorId: string,
    incorrect: unknown,
    targetProjectId = projectId,
  ) {
    return sendJson<Body>({
      baseUrl: app.baseUrl,
      method: 'PATCH',
      path: `/projects/${targetProjectId}/competitors/${competitorId}`,
      body: { incorrect },
    })
  }

  function setApproval<Body = { approval: string }>(approved: unknown, targetProjectId = projectId) {
    return sendJson<Body>({
      baseUrl: app.baseUrl,
      method: 'PUT',
      path: `/projects/${targetProjectId}/competitors-approval`,
      body: { approved },
    })
  }

  it('creates the list with 201, pending approval, and reads back what the agent saved', async () => {
    const created = await saveCompetitors()
    const read = await listCompetitors()

    expect(created.status).toBe(201)
    expect(created.body.approval).toBe('pending')
    expect(created.body.competitors).toHaveLength(1)
    expect(created.body.competitors[0]).toMatchObject({
      id: 'acme',
      ...buildCompetitor('Acme'),
      incorrect: false,
    })
    expect(created.body.competitors[0].qualifiedAt).toEqual(expect.any(String))
    expect(read.status).toBe(200)
    expect(read.body).toEqual(created.body)
  })

  it('answers pending and an empty list for a project without competitors', async () => {
    const result = await listCompetitors()

    expect(result.status).toBe(200)
    expect(result.body).toEqual({ approval: 'pending', competitors: [] })
  })

  it('replaces the list with 200 and takes the approval back to pending', async () => {
    await saveCompetitors()
    await setApproval(true)

    const replaced = await saveCompetitors([buildCompetitor('Beta'), buildCompetitor('Gama')])
    const read = await listCompetitors()

    expect(replaced.status).toBe(200)
    expect(replaced.body.approval).toBe('pending')
    expect(read.body.competitors.map((competitor) => competitor.name)).toEqual(['Beta', 'Gama'])
  })

  it('orders main first, then secondary, then marked, keeping the saved order inside each group', async () => {
    await saveCompetitors([
      buildCompetitor('Zeta', { role: 'secondary' }),
      buildCompetitor('Alfa', { role: 'secondary' }),
      buildCompetitor('Yota'),
      buildCompetitor('Beta'),
      buildCompetitor('Marcado'),
    ])
    await markCompetitor('marcado', true)

    const result = await listCompetitors()

    expect(result.body.competitors.map((competitor) => competitor.name)).toEqual([
      'Yota',
      'Beta',
      'Zeta',
      'Alfa',
      'Marcado',
    ])
  })

  it('marks and unmarks a competitor with 200, twice with the same answer, without changing the approval', async () => {
    await saveCompetitors([buildCompetitor('Acme'), buildCompetitor('Beta')])
    await setApproval(true)

    const first = await markCompetitor('acme', true)
    const second = await markCompetitor('acme', true)
    const afterMark = await listCompetitors()
    const unmarked = await markCompetitor('acme', false)

    expect(first.status).toBe(200)
    expect(first.body).toMatchObject({ id: 'acme', incorrect: true })
    expect(second.status).toBe(200)
    expect(second.body).toEqual(first.body)
    expect(afterMark.body.approval).toBe('approved')
    expect(unmarked.body.incorrect).toBe(false)
  })

  it('keeps the mark of a competitor that stays in the replaced list', async () => {
    await saveCompetitors([buildCompetitor('Acme'), buildCompetitor('Beta')])
    await markCompetitor('acme', true)

    await saveCompetitors([buildCompetitor('Acme', { marketFocus: 'Novo foco' }), buildCompetitor('Beta')])
    const read = await listCompetitors()
    const acme = read.body.competitors.find((competitor) => competitor.id === 'acme')

    expect(acme).toMatchObject({ incorrect: true, marketFocus: 'Novo foco' })
  })

  it('answers 404 COMPETITOR_NOT_FOUND when marking a competitor outside the list', async () => {
    await saveCompetitors()

    const result = await markCompetitor<ErrorBody>('fantasma', true)

    expect(result.status).toBe(404)
    expect(result.body.error.code).toBe('COMPETITOR_NOT_FOUND')
  })

  it('refuses a mark that is not a boolean with 400 naming the field', async () => {
    await saveCompetitors()

    const result = await markCompetitor<ErrorBody>('acme', 'yes')

    expect(result.status).toBe(400)
    expect(result.body.error.fields).toEqual([
      { field: 'incorrect', code: 'REQUIRED', message: 'incorrect is required' },
    ])
  })

  it('approves, repeats the approval and reopens, all with 200', async () => {
    await saveCompetitors()

    const approved = await setApproval(true)
    const approvedAgain = await setApproval(true)
    const reopened = await setApproval(false)
    const reopenedAgain = await setApproval(false)
    const read = await listCompetitors()

    expect(approved).toMatchObject({ status: 200, body: { approval: 'approved' } })
    expect(approvedAgain).toMatchObject({ status: 200, body: { approval: 'approved' } })
    expect(reopened).toMatchObject({ status: 200, body: { approval: 'pending' } })
    expect(reopenedAgain).toMatchObject({ status: 200, body: { approval: 'pending' } })
    expect(read.body.approval).toBe('pending')
  })

  it('answers 409 NO_ACTIVE_COMPETITORS when approving a project without a list', async () => {
    const result = await setApproval<ErrorBody>(true)
    const read = await listCompetitors()

    expect(result.status).toBe(409)
    expect(result.body.error.code).toBe('NO_ACTIVE_COMPETITORS')
    expect(read.body.approval).toBe('pending')
  })

  it('answers 409 NO_ACTIVE_COMPETITORS when every competitor is marked, keeping the approval', async () => {
    await saveCompetitors([buildCompetitor('Acme'), buildCompetitor('Beta')])
    await setApproval(true)
    await markCompetitor('acme', true)
    await markCompetitor('beta', true)
    await setApproval(false)

    const result = await setApproval<ErrorBody>(true)
    const read = await listCompetitors()

    expect(result.status).toBe(409)
    expect(result.body.error.code).toBe('NO_ACTIVE_COMPETITORS')
    expect(read.body.approval).toBe('pending')
  })

  it('reopens an approved list even when no competitor is active', async () => {
    await saveCompetitors()
    await setApproval(true)
    await markCompetitor('acme', true)

    const result = await setApproval(false)

    expect(result).toMatchObject({ status: 200, body: { approval: 'pending' } })
  })

  it('refuses an approval that is not a boolean with 400', async () => {
    const result = await setApproval<ErrorBody>('yes')

    expect(result.status).toBe(400)
    expect(result.body.error.fields?.[0].field).toBe('approved')
  })

  it('answers 404 PROJECT_NOT_FOUND on the four routes for an unknown project', async () => {
    const missing = 'nao-existe'
    const results = [
      await saveCompetitors<ErrorBody>(undefined, missing),
      await listCompetitors<ErrorBody>(missing),
      await markCompetitor<ErrorBody>('acme', true, missing),
      await setApproval<ErrorBody>(true, missing),
    ]

    for (const result of results) {
      expect(result.status).toBe(404)
      expect(result.body.error.code).toBe('PROJECT_NOT_FOUND')
    }
  })

  it('refuses an empty list and a missing list with 400 REQUIRED', async () => {
    const empty = await saveCompetitors<ErrorBody>([])
    const missing = await sendJson<ErrorBody>({
      baseUrl: app.baseUrl,
      method: 'PUT',
      path: `/projects/${projectId}/competitors`,
      body: {},
    })

    expect(empty.status).toBe(400)
    expect(empty.body.error.fields).toEqual([
      { field: 'competitors', code: 'REQUIRED', message: 'competitors is required' },
    ])
    expect(missing.status).toBe(400)
    expect(missing.body.error.fields?.[0].field).toBe('competitors')
  })

  it('accepts 15 competitors and refuses 16 with TOO_MANY_ITEMS', async () => {
    const names = Array.from({ length: 16 }, (_, position) => `empresa-${position}`)

    const accepted = await saveCompetitors(names.slice(0, 15).map((name) => buildCompetitor(name)))
    const refused = await saveCompetitors<ErrorBody>(names.map((name) => buildCompetitor(name)))

    expect(accepted.status).toBe(201)
    expect(refused.status).toBe(400)
    expect(refused.body.error.fields).toEqual([
      {
        field: 'competitors',
        code: 'TOO_MANY_ITEMS',
        message: 'competitors must have at most 15 items',
      },
    ])
  })

  it('refuses an invalid role saying both accepted values', async () => {
    const result = await saveCompetitors<ErrorBody>([buildCompetitor('Acme', { role: 'rival' })])

    expect(result.status).toBe(400)
    expect(result.body.error.fields).toEqual([
      {
        field: 'competitors[0].role',
        code: 'INVALID_OPTION',
        message: 'competitors[0].role has an invalid option, use one of: main, secondary',
      },
    ])
  })

  it('refuses two names equal after normalization and keeps the previous list', async () => {
    await saveCompetitors([buildCompetitor('Acme')])

    const result = await saveCompetitors<ErrorBody>([
      buildCompetitor('Beta'),
      buildCompetitor('  beta ', { url: null }),
    ])
    const read = await listCompetitors()

    expect(result.status).toBe(400)
    expect(result.body.error.fields).toEqual([
      {
        field: 'competitors[1].name',
        code: 'DUPLICATED_NAME',
        message: 'competitors[1].name is duplicated in the list',
      },
    ])
    expect(read.body.competitors.map((competitor) => competitor.name)).toEqual(['Acme'])
  })

  it('refuses a link that is not http or https and a missing required field', async () => {
    const result = await saveCompetitors<ErrorBody>([
      buildCompetitor('Acme', { url: 'javascript:alert(1)', audience: undefined }),
    ])

    expect(result.status).toBe(400)
    expect(result.body.error.fields?.map((field) => `${field.field}:${field.code}`)).toEqual([
      'competitors[0].audience:REQUIRED',
    ])

    const onlyUrl = await saveCompetitors<ErrorBody>([
      buildCompetitor('Acme', { url: 'javascript:alert(1)' }),
    ])

    expect(onlyUrl.body.error.fields).toEqual([
      {
        field: 'competitors[0].url',
        code: 'INVALID_URL',
        message: 'competitors[0].url must be an http or https link',
      },
    ])
  })

  it('saves a competitor without link as null', async () => {
    const result = await saveCompetitors([buildCompetitor('Acme', { url: undefined })])

    expect(result.status).toBe(201)
    expect(result.body.competitors[0].url).toBeNull()
  })

  it('refuses a body above 1 MB with 413 in the single error shape', async () => {
    const result = await saveCompetitors<ErrorBody>([
      buildCompetitor('Acme', { rationale: 'a'.repeat(1024 * 1024 + 1) }),
    ])

    expect(result.status).toBe(413)
    expect(result.body.error.code).toBe('PAYLOAD_TOO_LARGE')
  })

  it('does not require the competitor list to save a channel analysis', async () => {
    const result = await sendJson({
      baseUrl: app.baseUrl,
      method: 'PUT',
      path: `/projects/${projectId}/channels/linkedin`,
      body: {
        score: 3,
        rationale: 'Sem lista de concorrentes',
        bestContent: { type: 'Artigo', evidence: 'Primeira página', basis: 'hypothesis' },
        findings: [],
      },
    })

    expect(result.status).toBe(201)
  })

  it('saves a channel analysis with the competitor list saved and still pending', async () => {
    const saved = await saveCompetitors()
    const result = await sendJson({
      baseUrl: app.baseUrl,
      method: 'PUT',
      path: `/projects/${projectId}/channels/linkedin`,
      body: {
        score: 4,
        rationale: 'Lista salva e ainda pendente',
        bestContent: { type: 'Artigo', evidence: 'Primeira página', basis: 'hypothesis' },
        findings: [],
      },
    })
    const read = await listCompetitors()

    expect(saved.body.approval).toBe('pending')
    expect(result.status).toBe(201)
    expect(read.body.approval).toBe('pending')
    expect(read.body.competitors.map((competitor) => competitor.name)).toEqual(['Acme'])
  })
})
