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

export type ChannelFindingInput = {
  competitor: string
  aspect: 'format' | 'topic' | 'frequency' | 'performance' | 'cta'
  kind: 'fact' | 'hypothesis'
  statement: string
  url?: string
  excerpt?: string
  tool?: string
}

export type ChannelAnalysisInput = {
  score: number
  rationale: string
  bestContent: { type: string; evidence: string; basis: 'fact' | 'hypothesis' }
  findings: ChannelFindingInput[]
}

export type CompetitorInput = {
  name: string
  role: 'main' | 'secondary'
  marketFocus?: string
  services?: string
  features?: string
  audience?: string
  rationale?: string
  url?: string
}

type ChannelSummary = {
  channel: string
  collected: boolean
  score: number | null
  partial: boolean
}

export async function saveChannelViaApi(
  request: APIRequestContext,
  projectId: string,
  channel: string,
  analysis: ChannelAnalysisInput,
): Promise<{ wasCreated: boolean }> {
  const response = await request.put(`${API_URL}/projects/${projectId}/channels/${channel}`, { data: analysis })
  expect([HTTP_OK, HTTP_CREATED]).toContain(response.status())
  return { wasCreated: response.status() === HTTP_CREATED }
}

export async function listChannelsViaApi(request: APIRequestContext, projectId: string): Promise<ChannelSummary[]> {
  const response = await request.get(`${API_URL}/projects/${projectId}/channels`)
  expect(response.status()).toBe(HTTP_OK)
  return ((await response.json()) as { channels: ChannelSummary[] }).channels
}

export async function saveCompetitorsViaApi(
  request: APIRequestContext,
  projectId: string,
  competitors: CompetitorInput[],
): Promise<{ wasCreated: boolean }> {
  const response = await request.put(`${API_URL}/projects/${projectId}/competitors`, {
    data: {
      competitors: competitors.map((competitor) => ({
        marketFocus: `Foco de ${competitor.name}`,
        services: `Serviços de ${competitor.name}`,
        features: `Features de ${competitor.name}`,
        audience: `Público de ${competitor.name}`,
        rationale: `Motivo de ${competitor.name}`,
        ...competitor,
      })),
    },
  })
  expect([HTTP_OK, HTTP_CREATED]).toContain(response.status())
  return { wasCreated: response.status() === HTTP_CREATED }
}
