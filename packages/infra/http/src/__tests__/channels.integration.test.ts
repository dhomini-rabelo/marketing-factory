import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { ErrorBody } from '@infra/http/middlewares/error-handler'
import type {
  ChannelAnalysisHttp,
  ChannelSummaryHttp,
} from '@infra/http/presenters/channel-analysis-presenter'
import type { ProjectHttp } from '@infra/http/presenters/project-presenter'
import { createTestApp, TestApp } from '@infra/http/__tests__/utils/create-test-app'
import { sendJson } from '@infra/http/__tests__/utils/http-client'

const validProject = {
  name: 'Demo',
  platform: 'web',
  phase: 'no_customers',
  description: 'Projeto de demonstração',
}

const channelKeys = [
  'seo',
  'site-pricing',
  'linkedin',
  'instagram',
  'youtube',
  'x',
  'tiktok',
  'reddit',
  'ads',
]

const factFinding = {
  competitor: 'Acme',
  aspect: 'format',
  kind: 'fact',
  statement: 'Publica vídeos curtos',
  url: 'https://acme.example/videos',
  excerpt: '3 vídeos por semana',
  tool: 'browser',
}

const hypothesisFinding = {
  competitor: 'Beta',
  aspect: 'topic',
  kind: 'hypothesis',
  statement: 'Foca em dicas de uso',
}

function buildAnalysis(overrides: Record<string, unknown> = {}) {
  return {
    score: 7,
    rationale: 'Canal com boa tração',
    bestContent: { type: 'Vídeo curto', evidence: '10 mil views', basis: 'fact' },
    findings: [factFinding, hypothesisFinding],
    ...overrides,
  }
}

describe('channel routes', () => {
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

  function saveChannel<Body = ChannelAnalysisHttp>(input: {
    channel?: string
    body?: Record<string, unknown>
    targetProjectId?: string
    rawBody?: string
  }) {
    return sendJson<Body>({
      baseUrl: app.baseUrl,
      method: 'PUT',
      path: `/projects/${input.targetProjectId ?? projectId}/channels/${input.channel ?? 'youtube'}`,
      body: input.rawBody ? undefined : (input.body ?? buildAnalysis()),
      rawBody: input.rawBody,
    })
  }

  function getChannel<Body = ChannelAnalysisHttp>(channel: string, targetProjectId = projectId) {
    return sendJson<Body>({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: `/projects/${targetProjectId}/channels/${channel}`,
    })
  }

  function listChannels() {
    return sendJson<{ channels: ChannelSummaryHttp[] }>({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: `/projects/${projectId}/channels`,
    })
  }

  it('creates the analysis with 201 and reads back exactly what was saved', async () => {
    const created = await saveChannel({})
    const read = await getChannel('youtube')

    expect(created.status).toBe(201)
    expect(created.body).toMatchObject({
      channel: 'youtube',
      partial: false,
      score: 7,
      rationale: 'Canal com boa tração',
      bestContent: { type: 'Vídeo curto', evidence: '10 mil views', basis: 'fact' },
    })
    expect(created.body.findings).toEqual([
      factFinding,
      { ...hypothesisFinding, url: null, excerpt: null, tool: null },
    ])
    expect(read.status).toBe(200)
    expect(read.body).toEqual(created.body)
  })

  it('replaces the analysis with 200 and drops the previous findings', async () => {
    await saveChannel({})

    const replaced = await saveChannel({
      body: buildAnalysis({ score: 4, findings: [hypothesisFinding] }),
    })
    const read = await getChannel('youtube')

    expect(replaced.status).toBe(200)
    expect(read.body.score).toBe(4)
    expect(read.body.findings).toHaveLength(1)
    expect(read.body.findings[0].competitor).toBe('Beta')
  })

  it('lists the collected channels by score then the fixed order, with the rest not collected', async () => {
    await saveChannel({ channel: 'linkedin', body: buildAnalysis({ score: 5 }) })
    await saveChannel({ channel: 'reddit', body: buildAnalysis({ score: 9 }) })
    await saveChannel({ channel: 'seo', body: buildAnalysis({ score: 5 }) })

    const result = await listChannels()

    expect(result.status).toBe(200)
    expect(result.body.channels.map((channel) => channel.channel)).toEqual([
      'reddit',
      'seo',
      'linkedin',
      'site-pricing',
      'instagram',
      'youtube',
      'x',
      'tiktok',
      'ads',
    ])
    expect(result.body.channels[0]).toMatchObject({ collected: true, partial: true, score: 9 })
    expect(result.body.channels[0].collectedAt).toEqual(expect.any(String))
    expect(result.body.channels[3]).toEqual({
      channel: 'site-pricing',
      partial: false,
      collected: false,
      score: null,
      collectedAt: null,
    })
  })

  it('lists the nine channels as not collected for a project without analyses', async () => {
    const result = await listChannels()

    expect(result.body.channels.map((channel) => channel.channel)).toEqual(channelKeys)
    expect(result.body.channels.every((channel) => !channel.collected)).toBe(true)
  })

  it('answers 404 CHANNEL_NOT_FOUND for a channel outside the nine, on read and on write', async () => {
    const read = await getChannel<ErrorBody>('facebook')
    const write = await saveChannel<ErrorBody>({ channel: 'facebook' })

    expect(read.status).toBe(404)
    expect(read.body.error.code).toBe('CHANNEL_NOT_FOUND')
    expect(read.body.error.message).toContain('youtube')
    expect(write.status).toBe(404)
    expect(write.body.error.code).toBe('CHANNEL_NOT_FOUND')
  })

  it('answers 404 ANALYSIS_NOT_FOUND for a valid channel not collected yet', async () => {
    const result = await getChannel<ErrorBody>('tiktok')

    expect(result.status).toBe(404)
    expect(result.body.error.code).toBe('ANALYSIS_NOT_FOUND')
  })

  it('answers 404 PROJECT_NOT_FOUND on the three routes for an unknown project', async () => {
    const missing = 'nao-existe'
    const write = await saveChannel<ErrorBody>({ targetProjectId: missing })
    const read = await getChannel<ErrorBody>('youtube', missing)
    const list = await sendJson<ErrorBody>({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: `/projects/${missing}/channels`,
    })

    for (const result of [write, read, list]) {
      expect(result.status).toBe(404)
      expect(result.body.error.code).toBe('PROJECT_NOT_FOUND')
    }
  })

  it('answers 400 listing every missing field in the single error shape', async () => {
    const result = await saveChannel<ErrorBody>({ body: {} })

    expect(result.status).toBe(400)
    expect(result.body.error.code).toBe('VALIDATION_ERROR')
    expect(result.body.error.fields?.map((field) => field.field).sort()).toEqual([
      'bestContent',
      'findings',
      'rationale',
      'score',
    ])
  })

  it('refuses a finding without aspect, naming the nested field, and keeps the previous analysis', async () => {
    await saveChannel({})

    const result = await saveChannel<ErrorBody>({
      body: buildAnalysis({
        score: 1,
        findings: [{ ...hypothesisFinding, aspect: undefined }],
      }),
    })
    const read = await getChannel('youtube')

    expect(result.status).toBe(400)
    expect(result.body.error.fields).toEqual([
      { field: 'findings[0].aspect', code: 'REQUIRED', message: 'findings[0].aspect is required' },
    ])
    expect(read.body.score).toBe(7)
    expect(read.body.findings).toHaveLength(2)
  })

  it('refuses an aspect outside the five, listing the accepted keys', async () => {
    const result = await saveChannel<ErrorBody>({
      body: buildAnalysis({ findings: [{ ...hypothesisFinding, aspect: 'tone' }] }),
    })

    expect(result.status).toBe(400)
    expect(result.body.error.fields).toEqual([
      {
        field: 'findings[0].aspect',
        code: 'INVALID_OPTION',
        message:
          'findings[0].aspect has an invalid option, use one of: format, topic, frequency, performance, cta',
      },
    ])
  })

  it('refuses a fact without link, excerpt and tool', async () => {
    const result = await saveChannel<ErrorBody>({
      body: buildAnalysis({
        findings: [{ ...factFinding, url: undefined, excerpt: '  ', tool: null }],
      }),
    })

    expect(result.status).toBe(400)
    expect(result.body.error.fields?.map((field) => `${field.field}:${field.code}`)).toEqual([
      'findings[0].url:REQUIRED',
      'findings[0].excerpt:REQUIRED',
      'findings[0].tool:REQUIRED',
    ])
  })

  it('refuses a score outside 0 to 10 or not integer with INVALID_SCORE', async () => {
    const tooHigh = await saveChannel<ErrorBody>({ body: buildAnalysis({ score: 11 }) })
    const fractional = await saveChannel<ErrorBody>({ body: buildAnalysis({ score: 5.5 }) })

    for (const result of [tooHigh, fractional]) {
      expect(result.status).toBe(400)
      expect(result.body.error.fields).toEqual([
        { field: 'score', code: 'INVALID_SCORE', message: 'score must be an integer from 0 to 10' },
      ])
    }
  })

  it('accepts the score limits 0 and 10', async () => {
    const lowest = await saveChannel({ channel: 'seo', body: buildAnalysis({ score: 0 }) })
    const highest = await saveChannel({ channel: 'ads', body: buildAnalysis({ score: 10 }) })

    expect(lowest.status).toBe(201)
    expect(highest.status).toBe(201)
  })

  it('refuses a link that is not http or https', async () => {
    const result = await saveChannel<ErrorBody>({
      body: buildAnalysis({ findings: [{ ...factFinding, url: 'ftp://acme.example/file' }] }),
    })

    expect(result.status).toBe(400)
    expect(result.body.error.fields).toEqual([
      {
        field: 'findings[0].url',
        code: 'INVALID_URL',
        message: 'findings[0].url must be an http or https link',
      },
    ])
  })

  it('accepts 30 findings and refuses 31 with TOO_MANY_ITEMS', async () => {
    const thirty = Array.from({ length: 30 }, () => hypothesisFinding)

    const accepted = await saveChannel({ body: buildAnalysis({ findings: thirty }) })
    const refused = await saveChannel<ErrorBody>({
      body: buildAnalysis({ findings: [...thirty, hypothesisFinding] }),
    })

    expect(accepted.status).toBe(201)
    expect(refused.status).toBe(400)
    expect(refused.body.error.fields).toEqual([
      {
        field: 'findings',
        code: 'TOO_MANY_ITEMS',
        message: 'findings must have at most 30 items',
      },
    ])
  })

  it('refuses best content text above 200 and 500 characters', async () => {
    const result = await saveChannel<ErrorBody>({
      body: buildAnalysis({
        bestContent: { type: 'a'.repeat(201), evidence: 'b'.repeat(501), basis: 'fact' },
      }),
    })

    expect(result.status).toBe(400)
    expect(result.body.error.fields?.map((field) => `${field.field}:${field.code}`)).toEqual([
      'bestContent.type:TOO_LONG',
      'bestContent.evidence:TOO_LONG',
    ])
  })

  it('refuses a body above 1 MB with 413 in the single error shape', async () => {
    const result = await saveChannel<ErrorBody>({
      body: buildAnalysis({ rationale: 'a'.repeat(1024 * 1024 + 1) }),
    })

    expect(result.status).toBe(413)
    expect(result.body.error.code).toBe('PAYLOAD_TOO_LARGE')
  })

  it('refuses malformed JSON with 400 INVALID_JSON', async () => {
    const result = await saveChannel<ErrorBody>({ rawBody: '{ not json' })

    expect(result.status).toBe(400)
    expect(result.body.error.code).toBe('INVALID_JSON')
  })

  it('accepts nine simultaneous writes of different channels and keeps all of them', async () => {
    const results = await Promise.all(
      channelKeys.map((channel, position) =>
        saveChannel({ channel, body: buildAnalysis({ score: position }) }),
      ),
    )
    const list = await listChannels()

    expect(results.map((result) => result.status)).toEqual(channelKeys.map(() => 201))
    expect(list.body.channels.every((channel) => channel.collected)).toBe(true)
  })

  it('keeps the last of simultaneous writes to the same channel without mixing findings', async () => {
    const results = await Promise.all(
      [1, 2, 3, 4, 5].map((score) =>
        saveChannel({
          body: buildAnalysis({
            score,
            findings: Array.from({ length: score }, () => ({
              ...hypothesisFinding,
              competitor: `Writer ${score}`,
            })),
          }),
        }),
      ),
    )
    const read = await getChannel('youtube')

    expect(results.every((result) => [200, 201].includes(result.status))).toBe(true)
    expect(read.body.findings).toHaveLength(read.body.score)
    expect(new Set(read.body.findings.map((finding) => finding.competitor))).toEqual(
      new Set([`Writer ${read.body.score}`]),
    )
  })
})
