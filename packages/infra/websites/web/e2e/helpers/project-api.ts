import { expect, type APIRequestContext } from '@playwright/test'
import { uniqueName } from '@e2e/helpers/unique-name'

export const API_URL = 'http://127.0.0.1:3333'

const HTTP_OK = 200
const HTTP_CREATED = 201

type ProjectInput = {
  name?: string
  platform?: 'web' | 'mobile' | 'both'
  phase?: 'no_customers' | 'finding_market_fit' | 'consolidated'
  description?: string
}

type CreatedProject = {
  id: string
  name: string
}

type DocumentInput = {
  title: string
  description: string
  body: string
}

export async function createProjectViaApi(
  request: APIRequestContext,
  input: ProjectInput = {},
): Promise<CreatedProject> {
  const response = await request.post(`${API_URL}/projects`, {
    data: {
      name: input.name ?? uniqueName('Projeto'),
      platform: input.platform ?? 'web',
      phase: input.phase ?? 'no_customers',
      description: input.description ?? 'Projeto criado pelo e2e',
    },
  })
  expect(response.status()).toBe(HTTP_CREATED)
  return (await response.json()) as CreatedProject
}

export async function saveDocumentViaApi(
  request: APIRequestContext,
  projectId: string,
  document: DocumentInput,
): Promise<{ wasCreated: boolean }> {
  const response = await request.put(`${API_URL}/projects/${projectId}/documents`, { data: document })
  expect([HTTP_OK, HTTP_CREATED]).toContain(response.status())
  return { wasCreated: response.status() === HTTP_CREATED }
}
