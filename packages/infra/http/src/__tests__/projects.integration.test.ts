import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { ErrorBody } from '@infra/http/middlewares/error-handler'
import type { ProjectHttp } from '@infra/http/presenters/project-presenter'
import { createTestApp, TestApp } from '@infra/http/__tests__/utils/create-test-app'
import { sendJson } from '@infra/http/__tests__/utils/http-client'

const validProject = {
  name: 'Demo',
  platform: 'web',
  phase: 'no_customers',
  description: 'Projeto de demonstração',
}

describe('project routes', () => {
  let app: TestApp

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app.dispose()
  })

  beforeEach(() => {
    app.database.exec('DELETE FROM documents; DELETE FROM projects')
  })

  async function createProject(body: Record<string, unknown> = validProject) {
    return sendJson<ProjectHttp>({
      baseUrl: app.baseUrl,
      method: 'POST',
      path: '/projects',
      body,
    })
  }

  it('creates a project with 201 and the contract shape, without authentication', async () => {
    const result = await createProject()

    expect(result.status).toBe(201)
    expect(result.body).toMatchObject(validProject)
    expect(result.body.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(new Date(result.body.createdAt).toISOString()).toBe(result.body.createdAt)
    expect(result.body.updatedAt).toBe(result.body.createdAt)
  })

  it('lists projects in alphabetical order under the projects envelope', async () => {
    await createProject({ ...validProject, name: 'Zeta' })
    await createProject({ ...validProject, name: 'Alfa' })

    const result = await sendJson<{ projects: ProjectHttp[] }>({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: '/projects',
    })

    expect(result.status).toBe(200)
    expect(result.body.projects.map((project) => project.name)).toEqual(['Alfa', 'Zeta'])
  })

  it('returns an empty list when there is no project', async () => {
    const result = await sendJson({ baseUrl: app.baseUrl, method: 'GET', path: '/projects' })

    expect(result.status).toBe(200)
    expect(result.body).toEqual({ projects: [] })
  })

  it('reads a project by its code', async () => {
    const created = await createProject()

    const result = await sendJson<ProjectHttp>({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: `/projects/${created.body.id}`,
    })

    expect(result.status).toBe(200)
    expect(result.body).toEqual(created.body)
  })

  it('updates the four fields with 200 and keeps the creation date', async () => {
    const created = await createProject()
    const changes = {
      name: 'Novo nome',
      platform: 'both',
      phase: 'consolidated',
      description: 'Outra descrição',
    }

    const result = await sendJson<ProjectHttp>({
      baseUrl: app.baseUrl,
      method: 'PUT',
      path: `/projects/${created.body.id}`,
      body: changes,
    })

    expect(result.status).toBe(200)
    expect(result.body).toMatchObject({ ...changes, id: created.body.id })
    expect(result.body.createdAt).toBe(created.body.createdAt)
  })

  it('refuses an unknown project code with 404 in the single error shape', async () => {
    const result = await sendJson<ErrorBody>({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: '/projects/codigo-inexistente',
    })

    expect(result.status).toBe(404)
    expect(result.body).toEqual({
      error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' },
    })
  })

  it('refuses updating an unknown project with 404 and creates nothing', async () => {
    const result = await sendJson<ErrorBody>({
      baseUrl: app.baseUrl,
      method: 'PUT',
      path: '/projects/codigo-inexistente',
      body: validProject,
    })
    const list = await sendJson({ baseUrl: app.baseUrl, method: 'GET', path: '/projects' })

    expect(result.status).toBe(404)
    expect(result.body.error.code).toBe('PROJECT_NOT_FOUND')
    expect(list.body).toEqual({ projects: [] })
  })

  it('lists the four missing fields with 400 when the body is empty', async () => {
    const result = await createProject({})

    expect(result.status).toBe(400)
    expect(result.body).toMatchObject({ error: { code: 'VALIDATION_ERROR' } })
    expect((result.body as unknown as ErrorBody).error.fields).toEqual([
      { field: 'name', code: 'REQUIRED', message: 'name is required' },
      { field: 'platform', code: 'REQUIRED', message: 'platform is required' },
      { field: 'phase', code: 'REQUIRED', message: 'phase is required' },
      { field: 'description', code: 'REQUIRED', message: 'description is required' },
    ])
  })

  it('refuses a request without a body with 400 listing the four fields', async () => {
    const response = await fetch(`${app.baseUrl}/projects`, { method: 'POST' })
    const body = (await response.json()) as ErrorBody

    expect(response.status).toBe(400)
    expect(body.error.fields?.map((issue) => issue.field)).toEqual([
      'name',
      'platform',
      'phase',
      'description',
    ])
  })

  it('refuses values outside the limits with the field that failed', async () => {
    const result = await createProject({
      name: 'n'.repeat(81),
      platform: 'desktop',
      phase: 'unknown',
      description: 'd'.repeat(201),
    })
    const { fields } = (result.body as unknown as ErrorBody).error

    expect(result.status).toBe(400)
    expect(fields).toEqual([
      { field: 'name', code: 'TOO_LONG', message: 'name must have at most 80 characters' },
      {
        field: 'description',
        code: 'TOO_LONG',
        message: 'description must have at most 200 characters',
      },
      { field: 'platform', code: 'INVALID_OPTION', message: 'platform has an invalid option' },
      { field: 'phase', code: 'INVALID_OPTION', message: 'phase has an invalid option' },
    ])
  })

  it('refuses an update with an invalid field and keeps the stored project', async () => {
    const created = await createProject()

    const result = await sendJson<ErrorBody>({
      baseUrl: app.baseUrl,
      method: 'PUT',
      path: `/projects/${created.body.id}`,
      body: { ...validProject, name: '   ' },
    })
    const stored = await sendJson<ProjectHttp>({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: `/projects/${created.body.id}`,
    })

    expect(result.status).toBe(400)
    expect(result.body.error.fields?.[0]).toMatchObject({ field: 'name', code: 'REQUIRED' })
    expect(stored.body.name).toBe(validProject.name)
  })

  it('refuses a malformed JSON body with 400 INVALID_JSON', async () => {
    const result = await sendJson<ErrorBody>({
      baseUrl: app.baseUrl,
      method: 'POST',
      path: '/projects',
      rawBody: '{"name":',
    })

    expect(result.status).toBe(400)
    expect(result.body.error.code).toBe('INVALID_JSON')
  })

  it('answers the preflight only for the configured web origin', async () => {
    const allowed = await fetch(`${app.baseUrl}/projects`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:7342',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    })
    const denied = await fetch(`${app.baseUrl}/projects`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://evil.example',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    })

    expect(allowed.headers.get('access-control-allow-origin')).toBe('http://localhost:7342')
    expect(denied.headers.get('access-control-allow-origin')).toBeNull()
  })
})
