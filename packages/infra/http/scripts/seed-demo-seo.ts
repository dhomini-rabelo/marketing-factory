import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { DemoCompetitor } from './seed-demo-collection'
import { sendJson } from './send-json'
import { SeoCompetitorBody, SeoFixture, sliceSeoFixture } from './slice-seo-fixture'

export type SeoVariant = 'complete' | 'partial' | 'brokenSum' | 'twoRounds'

type SeoFixtureWithRound = SeoFixture & {
  tool: string
  collectedAt: string
  note: string
  searches: object[]
}

type CreatedRound = {
  id: string
}

type NumbersProfile = { numbers: Record<string, number> }

const FIXTURES_DIRECTORY = fileURLToPath(new URL('./fixtures/seo/', import.meta.url))
const SEO_MARKET = 'Brasil, português'
const FIREFLIES_NAME = 'Fireflies.ai'
const FIREFLIES_PAGES_OTHER_FIXED = 66
const BROKEN_SUM_COMPETITOR_NAME = 'tl;dv'
const BROKEN_SUM_EXTRA_LANDING_PAGES = 10
const PARTIAL_COLLECTED_COUNT = 4
const PREVIOUS_ROUND_DAYS_BEFORE = 14
const PREVIOUS_ROUND_TOOL = 'claude-code'
const PREVIOUS_ROUND_NOTE = 'Rodada anterior de demonstração, usada para comparar com a rodada mais recente.'
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000
const DATE_LENGTH = 10

export const SEO_DEMO_COMPETITORS: DemoCompetitor[] = [
  {
    name: 'tl;dv',
    role: 'main',
    marketFocus: 'Gravação e resumo de reuniões online para times de vendas e de produto',
    services: 'App de gravação, transcrição e resumo de reuniões',
    features: 'Gravação, transcrição, resumo com IA, integrações com CRM',
    audience: 'Times de vendas, produto e atendimento',
    rationale: 'Disputa as mesmas buscas de gravação e resumo de reuniões e investe em páginas de comparação.',
    url: 'https://tldv.io',
  },
  {
    name: 'Fireflies.ai',
    role: 'main',
    marketFocus: 'Transcrição de reuniões com busca e análise de conversas',
    services: 'Assistente de reunião que transcreve e organiza as conversas',
    features: 'Transcrição, busca nas reuniões, resumo, integrações',
    audience: 'Times comerciais e de operações',
    rationale: 'Tem o maior volume de posts do blog e páginas de comparação contra os rivais diretos.',
    url: 'https://fireflies.ai',
  },
  {
    name: 'Otter.ai',
    role: 'main',
    marketFocus: 'Anotações automáticas de reuniões e aulas',
    services: 'Assistente de anotações com transcrição ao vivo',
    features: 'Transcrição ao vivo, resumo, chat com a reunião',
    audience: 'Profissionais, equipes e estudantes',
    rationale: 'É a referência mais conhecida em anotação de reunião e aparece nas buscas de alternativas.',
    url: 'https://otter.ai',
  },
  {
    name: 'Fathom',
    role: 'main',
    marketFocus: 'Gravador de reuniões gratuito com resumo para vendas',
    services: 'Gravador de reuniões com resumo automático',
    features: 'Gravação, resumo, destaques, envio ao CRM',
    audience: 'Times de vendas e de sucesso do cliente',
    rationale: 'Usa páginas em série e comparações para capturar buscas de quem troca de ferramenta.',
    url: 'https://fathom.ai',
  },
  {
    name: 'MeetGeek',
    role: 'main',
    marketFocus: 'Resumos e insights de reuniões para equipes remotas',
    services: 'Assistente de reunião com resumo e insights',
    features: 'Gravação, resumo, insights, modelos por tipo de reunião',
    audience: 'Equipes remotas e consultorias',
    rationale: 'Publica comparações em página e em post, e disputa buscas de modelos de reunião.',
    url: 'https://meetgeek.ai',
  },
  {
    name: 'Tactiq',
    role: 'secondary',
    marketFocus: 'Transcrição de reuniões direto no navegador',
    services: 'Extensão que transcreve reuniões sem bot',
    features: 'Transcrição no navegador, resumo, ferramentas de IA',
    audience: 'Profissionais que usam Google Meet, Zoom e Teams',
    rationale: 'Concorre por páginas em série de transcrição e tradução, que trazem tráfego de cauda longa.',
    url: 'https://tactiq.io',
  },
]

function readFixture(): SeoFixtureWithRound {
  return JSON.parse(readFileSync(`${FIXTURES_DIRECTORY}teste-5.json`, 'utf8')) as SeoFixtureWithRound
}

function readDocumentBody(fileName: string): string {
  return readFileSync(`${FIXTURES_DIRECTORY}docs/${fileName}`, 'utf8')
}

function fixPagesOther(body: SeoCompetitorBody): SeoCompetitorBody {
  const profile = body.profile as NumbersProfile

  return { ...body, profile: { ...profile, numbers: { ...profile.numbers, pagesOther: FIREFLIES_PAGES_OTHER_FIXED } } }
}

function breakPageTypeSum(body: SeoCompetitorBody): SeoCompetitorBody {
  const profile = body.profile as NumbersProfile
  const pagesLanding = profile.numbers.pagesLanding + BROKEN_SUM_EXTRA_LANDING_PAGES

  return { ...body, profile: { ...profile, numbers: { ...profile.numbers, pagesLanding } } }
}

function buildCompetitorBody(fixture: SeoFixtureWithRound, name: string, variant: SeoVariant): SeoCompetitorBody {
  const body = sliceSeoFixture(fixture, name)

  if (name === FIREFLIES_NAME) return fixPagesOther(body)
  if (variant === 'brokenSum' && name === BROKEN_SUM_COMPETITOR_NAME) return breakPageTypeSum(body)
  return body
}

function listCollectedNames(variant: SeoVariant): string[] {
  const names = SEO_DEMO_COMPETITORS.map((competitor) => competitor.name)

  return variant === 'partial' ? names.slice(0, PARTIAL_COLLECTED_COUNT) : names
}

function subtractDays(date: string, days: number): string {
  const shifted = new Date(Date.parse(date) - days * MILLISECONDS_PER_DAY)

  return shifted.toISOString().slice(0, DATE_LENGTH)
}

async function saveRound(
  apiUrl: string,
  projectId: string,
  fixture: SeoFixtureWithRound,
  round: { tool: string; collectedAt: string; note: string },
  variant: SeoVariant,
) {
  const created = await sendJson<CreatedRound>(apiUrl, 'POST', `/projects/${projectId}/seo/rounds`, {
    ...round,
    market: SEO_MARKET,
    searches: fixture.searches,
  })
  const roundPath = `/projects/${projectId}/seo/rounds/${created.id}`

  for (const name of listCollectedNames(variant)) {
    await sendJson(apiUrl, 'PUT', `${roundPath}/competitors/${encodeURIComponent(name)}`, buildCompetitorBody(fixture, name, variant))
  }

  for (const { fileName, title, about } of fixture.documents) {
    await sendJson(apiUrl, 'POST', `${roundPath}/documents`, { title, fileName, about, body: readDocumentBody(fileName) })
  }
}

export async function saveSeoRound(apiUrl: string, projectId: string, variant: SeoVariant) {
  const fixture = readFixture()
  const collectedAt = fixture.collectedAt.slice(0, DATE_LENGTH)

  if (variant === 'twoRounds') {
    await saveRound(
      apiUrl,
      projectId,
      fixture,
      { tool: PREVIOUS_ROUND_TOOL, collectedAt: subtractDays(collectedAt, PREVIOUS_ROUND_DAYS_BEFORE), note: PREVIOUS_ROUND_NOTE },
      variant,
    )
  }

  await saveRound(apiUrl, projectId, fixture, { tool: fixture.tool, collectedAt, note: fixture.note }, variant)
}
