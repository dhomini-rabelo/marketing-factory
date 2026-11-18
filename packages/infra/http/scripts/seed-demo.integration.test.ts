import { execFile } from 'node:child_process'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
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
})
