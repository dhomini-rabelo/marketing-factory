import { execFile } from 'node:child_process'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { Channel, CompetitorRole } from '@domain/competitor-analysis'
import type { ErrorBody } from '@infra/http/middlewares/error-handler'
import type { ChannelAnalysisHttp, ChannelSummaryHttp } from '@infra/http/presenters/channel-analysis-presenter'
import type { CompetitorHttp } from '@infra/http/presenters/competitor-presenter'
import type { DocumentListItemHttp } from '@infra/http/presenters/document-presenter'
import type { ProjectHttp } from '@infra/http/presenters/project-presenter'
import { createTestApp, TestApp } from '@infra/http/__tests__/utils/create-test-app'
import { sendJson } from '@infra/http/__tests__/utils/http-client'

const run = promisify(execFile)
const PACKAGE_ROOT = join(__dirname, '..')
const TSX_BIN = join(PACKAGE_ROOT, 'node_modules', '.bin', 'tsx')

describe('seed-demo script', () => {
  let app: TestApp

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app.dispose()
  })

  function runSeed(args: string[], apiUrl = app.baseUrl) {
    return run(TSX_BIN, ['scripts/seed-demo.ts', ...args], {
      cwd: PACKAGE_ROOT,
      env: { ...process.env, API_URL: apiUrl },
    })
  }

  it('creates the three demo projects, the eight Bancada documents and the extra projects', async () => {
    await runSeed(['--projects', '2'])

    const projects = await sendJson<{ projects: ProjectHttp[] }>({ baseUrl: app.baseUrl, method: 'GET', path: '/projects' })
    const names = projects.body.projects.map((project) => project.name)
    expect(names).toEqual(
      expect.arrayContaining(['Bancada', 'Clínica Lume', 'Rota da Feira', 'Projeto de teste 1', 'Projeto de teste 2']),
    )
    expect(projects.body.projects).toHaveLength(5)

    const bancada = projects.body.projects.find((project) => project.name === 'Bancada')
    expect(bancada).toMatchObject({ platform: 'web', phase: 'finding_market_fit' })

    const documents = await sendJson<{ documents: DocumentListItemHttp[] }>({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: `/projects/${bancada?.id}/documents`,
    })
    expect(documents.body.documents.map((document) => document.title).sort()).toEqual(
      [
        'Canais e links',
        'Concorrentes',
        'Features de média importância',
        'Features importantes',
        'Proposta de valor',
        'Público e dores',
        'SEO: palavras e temas',
        'Tom de voz',
      ].sort(),
    )
  })

  it('writes real markdown in the first document', async () => {
    const projects = await sendJson<{ projects: ProjectHttp[] }>({ baseUrl: app.baseUrl, method: 'GET', path: '/projects' })
    const bancada = projects.body.projects.find((project) => project.name === 'Bancada')

    const document = await sendJson<{ body: string }>({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: `/projects/${bancada?.id}/documents/features-importantes`,
    })

    expect(document.body.body).toContain('### Orçamento em PDF em 2 minutos')
    expect(document.body.body).toContain('#### Por que importa')
    expect(document.body.body).toContain('**material, mão de obra e margem**')
    expect(document.body.body).toContain('*orçado → aprovado')
    expect(document.body.body).toMatch(/^- /m)
  })

  it('fails with a clear message when the API is not reachable', async () => {
    await expect(runSeed([], 'http://127.0.0.1:1')).rejects.toMatchObject({ code: 1 })
  })

  it('rejects an invalid --projects value', async () => {
    await expect(runSeed(['--projects', 'abc'])).rejects.toMatchObject({ code: 1 })
  })

  describe('with --coleta', () => {
    beforeEach(() => {
      app.database.exec(
        'DELETE FROM channel_findings; DELETE FROM channel_analyses; DELETE FROM competitors; DELETE FROM competitor_approvals; DELETE FROM documents; DELETE FROM projects',
      )
    })

    async function findProjectId(name: string) {
      const projects = await sendJson<{ projects: ProjectHttp[] }>({ baseUrl: app.baseUrl, method: 'GET', path: '/projects' })
      return projects.body.projects.find((project) => project.name === name)?.id
    }

    it('saves six competitors with one marked and the list waiting for approval', async () => {
      await runSeed(['--coleta', 'Bancada'])

      const projectId = await findProjectId('Bancada')
      const list = await sendJson<{ approval: string; competitors: CompetitorHttp[] }>({
        baseUrl: app.baseUrl,
        method: 'GET',
        path: `/projects/${projectId}/competitors`,
      })

      expect(list.body.approval).toBe('pending')
      expect(list.body.competitors).toHaveLength(6)
      const active = list.body.competitors.filter((competitor) => !competitor.incorrect)
      expect(active.filter((competitor) => competitor.role === CompetitorRole.MAIN)).toHaveLength(2)
      expect(active.filter((competitor) => competitor.role === CompetitorRole.SECONDARY)).toHaveLength(3)
      expect(list.body.competitors.filter((competitor) => competitor.incorrect).map((competitor) => competitor.name)).toEqual([
        'Marcenaria Fácil',
      ])
    })

    it('saves the channel analyses with the findings counts of the visual data and leaves tiktok and ads without collection', async () => {
      await runSeed(['--coleta', 'Bancada'])

      const projectId = await findProjectId('Bancada')
      const channels = await sendJson<{ channels: ChannelSummaryHttp[] }>({
        baseUrl: app.baseUrl,
        method: 'GET',
        path: `/projects/${projectId}/channels`,
      })
      const summary = Object.fromEntries(
        channels.body.channels.map((channel) => [channel.channel, { collected: channel.collected, score: channel.score }]),
      )
      expect(summary).toEqual({
        linkedin: { collected: true, score: 8 },
        'site-pricing': { collected: true, score: 6 },
        [Channel.X_NETWORK]: { collected: true, score: 5 },
        youtube: { collected: true, score: 4 },
        reddit: { collected: true, score: 2 },
        instagram: { collected: true, score: 0 },
        tiktok: { collected: false, score: null },
        ads: { collected: false, score: null },
      })

      const findingsCount: Record<string, number> = {}
      for (const channel of ['linkedin', 'site-pricing', 'x', 'youtube', 'reddit', 'instagram']) {
        const analysis = await sendJson<ChannelAnalysisHttp>({
          baseUrl: app.baseUrl,
          method: 'GET',
          path: `/projects/${projectId}/channels/${channel}`,
        })
        findingsCount[channel] = analysis.body.findings.length
      }
      expect(findingsCount).toEqual({ linkedin: 8, 'site-pricing': 6, [Channel.X_NETWORK]: 5, youtube: 4, reddit: 2, instagram: 0 })
    })

    it('does not write a seo channel analysis', async () => {
      await runSeed(['--coleta', 'Bancada'])

      const projectId = await findProjectId('Bancada')
      const analysis = await sendJson<ErrorBody>({
        baseUrl: app.baseUrl,
        method: 'GET',
        path: `/projects/${projectId}/channels/seo`,
      })

      expect(analysis.status).toBe(404)
      expect(analysis.body.error.code).toBe('CHANNEL_NOT_FOUND')
    })

    it('approves the list only with --aprovada', async () => {
      await runSeed(['--coleta', 'Bancada', '--aprovada'])

      const projectId = await findProjectId('Bancada')
      const list = await sendJson<{ approval: string }>({
        baseUrl: app.baseUrl,
        method: 'GET',
        path: `/projects/${projectId}/competitors`,
      })
      expect(list.body.approval).toBe('approved')
    })

    it('does not save a list or analyses without --coleta', async () => {
      await runSeed([])

      const projectId = await findProjectId('Bancada')
      const list = await sendJson<{ approval: string; competitors: CompetitorHttp[] }>({
        baseUrl: app.baseUrl,
        method: 'GET',
        path: `/projects/${projectId}/competitors`,
      })
      const channels = await sendJson<{ channels: ChannelSummaryHttp[] }>({
        baseUrl: app.baseUrl,
        method: 'GET',
        path: `/projects/${projectId}/channels`,
      })
      expect(list.body.competitors).toHaveLength(0)
      expect(channels.body.channels.every((channel) => !channel.collected)).toBe(true)
    })

    it('rejects a project the seed does not create without creating anything', async () => {
      await expect(runSeed(['--coleta', 'Projeto Inexistente'])).rejects.toMatchObject({ code: 1 })

      const projects = await sendJson<{ projects: ProjectHttp[] }>({ baseUrl: app.baseUrl, method: 'GET', path: '/projects' })
      expect(projects.body.projects).toHaveLength(0)
    })

    it('rejects --coleta without a project name and --aprovada without --coleta', async () => {
      await expect(runSeed(['--coleta'])).rejects.toMatchObject({ code: 1 })
      await expect(runSeed(['--aprovada'])).rejects.toMatchObject({ code: 1 })
    })
  })
})
