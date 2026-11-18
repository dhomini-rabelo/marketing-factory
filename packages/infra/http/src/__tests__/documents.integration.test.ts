import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { ErrorBody } from '@infra/http/middlewares/error-handler'
import type {
  DocumentHttp,
  DocumentListItemHttp,
} from '@infra/http/presenters/document-presenter'
import type { ProjectHttp } from '@infra/http/presenters/project-presenter'
import { createTestApp, TestApp } from '@infra/http/__tests__/utils/create-test-app'
import { sendJson } from '@infra/http/__tests__/utils/http-client'

const validProject = {
  name: 'Demo',
  platform: 'web',
  phase: 'no_customers',
  description: 'Projeto de demonstração',
}

const validDocument = {
  title: 'Público e Dores',
  description: 'Quem é o público',
  body: '# Público\n- dono de loja',
}

describe('document routes', () => {
  let app: TestApp
  let projectId: string

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app.dispose()
  })

  beforeEach(async () => {
    app.database.exec('DELETE FROM documents; DELETE FROM projects')

    const project = await sendJson<ProjectHttp>({
      baseUrl: app.baseUrl,
      method: 'POST',
      path: '/projects',
      body: validProject,
    })
    projectId = project.body.id
  })

  function saveDocument<Body = DocumentHttp>(
    body: Record<string, unknown> = validDocument,
    targetProjectId = projectId,
  ) {
    return sendJson<Body>({
      baseUrl: app.baseUrl,
      method: 'PUT',
      path: `/projects/${targetProjectId}/documents`,
      body,
    })
  }

  it('creates a document with 201 and returns the full document without ids', async () => {
    const result = await saveDocument()

    expect(result.status).toBe(201)
    expect(result.body).toMatchObject({ ...validDocument, slug: 'publico-e-dores' })
    expect(Object.keys(result.body).sort()).toEqual([
      'body',
      'createdAt',
      'description',
      'slug',
      'title',
      'updatedAt',
    ])
  })

  it('updates with 200 when the title differs only by case or accent, showing the last title', async () => {
    await saveDocument()

    const result = await saveDocument({
      title: 'publico e dores',
      description: 'Quem é o público, v2',
      body: '# Público v2',
    })
    const list = await sendJson<{ documents: DocumentListItemHttp[] }>({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: `/projects/${projectId}/documents`,
    })

    expect(result.status).toBe(200)
    expect(result.body.slug).toBe('publico-e-dores')
    expect(list.body.documents).toHaveLength(1)
    expect(list.body.documents[0]).toMatchObject({
      title: 'publico e dores',
      description: 'Quem é o público, v2',
    })
  })

  it('lists documents without the body, most recent first', async () => {
    await saveDocument({ ...validDocument, title: 'Primeiro' })
    await saveDocument({ ...validDocument, title: 'Segundo' })

    const result = await sendJson<{ documents: DocumentListItemHttp[] }>({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: `/projects/${projectId}/documents`,
    })

    expect(result.status).toBe(200)
    expect(result.body.documents.map((document) => document.title)).toEqual(['Segundo', 'Primeiro'])
    expect(Object.keys(result.body.documents[0]).sort()).toEqual([
      'description',
      'slug',
      'title',
      'updatedAt',
    ])
  })

  it('returns an empty list, not an error, when the project has no documents', async () => {
    const result = await sendJson({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: `/projects/${projectId}/documents`,
    })

    expect(result.status).toBe(200)
    expect(result.body).toEqual({ documents: [] })
  })

  it('reads one document by slug with the body', async () => {
    await saveDocument()

    const result = await sendJson<DocumentHttp>({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: `/projects/${projectId}/documents/publico-e-dores`,
    })

    expect(result.status).toBe(200)
    expect(result.body).toMatchObject({ ...validDocument, slug: 'publico-e-dores' })
  })

  it('refuses an unknown document with 404 DOCUMENT_NOT_FOUND', async () => {
    const result = await sendJson<ErrorBody>({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: `/projects/${projectId}/documents/nao-existe`,
    })

    expect(result.status).toBe(404)
    expect(result.body).toEqual({
      error: { code: 'DOCUMENT_NOT_FOUND', message: 'Document not found' },
    })
  })

  it('refuses saving, listing and reading with an unknown project code, creating nothing', async () => {
    const saved = await saveDocument<ErrorBody>(validDocument, 'codigo-inexistente')
    const listed = await sendJson<ErrorBody>({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: '/projects/codigo-inexistente/documents',
    })
    const read = await sendJson<ErrorBody>({
      baseUrl: app.baseUrl,
      method: 'GET',
      path: '/projects/codigo-inexistente/documents/publico-e-dores',
    })
    const stored = app.database.prepare('SELECT COUNT(*) AS total FROM documents').get()

    expect([saved.status, listed.status, read.status]).toEqual([404, 404, 404])
    expect([saved.body, listed.body, read.body].map((body) => body.error.code)).toEqual([
      'PROJECT_NOT_FOUND',
      'PROJECT_NOT_FOUND',
      'PROJECT_NOT_FOUND',
    ])
    expect(stored).toEqual({ total: 0 })
  })

  it('refuses a symbol-only title with INVALID_TITLE and saves nothing', async () => {
    const result = await saveDocument<ErrorBody>({ ...validDocument, title: '!!! ???' })
    const stored = app.database.prepare('SELECT COUNT(*) AS total FROM documents').get()

    expect(result.status).toBe(400)
    expect(result.body.error.fields).toEqual([
      { field: 'title', code: 'INVALID_TITLE', message: 'title must contain letters or numbers' },
    ])
    expect(stored).toEqual({ total: 0 })
  })

  it('lists the missing fields with 400 when description and body are absent', async () => {
    const result = await saveDocument<ErrorBody>({ title: 'Só o título' })

    expect(result.status).toBe(400)
    expect(result.body.error.code).toBe('VALIDATION_ERROR')
    expect(result.body.error.fields?.map((issue) => issue.field)).toEqual(['description', 'body'])
  })

  it('refuses a body above 100,000 characters telling to split the content', async () => {
    const result = await saveDocument<ErrorBody>({ ...validDocument, body: 'a'.repeat(100001) })

    expect(result.status).toBe(400)
    expect(result.body.error.fields).toEqual([
      {
        field: 'body',
        code: 'TOO_LONG',
        message:
          'body must have at most 100000 characters, split the content into smaller documents',
      },
    ])
  })

  it('accepts a body of exactly 100,000 characters', async () => {
    const result = await saveDocument({ ...validDocument, body: 'a'.repeat(100000) })

    expect(result.status).toBe(201)
  })

  it('refuses a request above 1 MB with 413 in the single error shape', async () => {
    const result = await saveDocument<ErrorBody>({
      ...validDocument,
      body: 'a'.repeat(1024 * 1024 + 1),
    })

    expect(result.status).toBe(413)
    expect(result.body.error.code).toBe('PAYLOAD_TOO_LARGE')
    expect(result.body.error.message).toContain('1 MB')
  })
})
