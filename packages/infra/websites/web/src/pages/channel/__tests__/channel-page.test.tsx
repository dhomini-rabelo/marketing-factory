import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Channel,
  FindingAspect,
  FindingKind,
  type ChannelAnalysis,
  type Finding,
} from '@/api/models/channel-analysis'
import { CompetitorApproval, CompetitorRole, type CompetitorsList } from '@/api/models/competitor'
import { API_ROUTES } from '@/api/routes'
import { mockApi, type MockRoutes } from '@/__tests__/utils/mock-api'
import { renderWithProviders } from '@/__tests__/utils/render-with-providers'
import { ChannelPage } from '@/pages/channel/page'

const PROJECT_ID = 'p1'

const channelRoute = (channel: string) => `GET ${API_ROUTES.channels.detail(PROJECT_ID, channel)}`
const competitorsRoute = `GET ${API_ROUTES.competitors.list(PROJECT_ID)}`

const serverError = { status: 500, body: { error: { code: 'INTERNAL_ERROR', message: 'Falhou' } } }
const neverReplies = () => new Promise<never>(() => undefined)

const competitorsList: CompetitorsList = {
  approval: CompetitorApproval.APPROVED,
  competitors: [
    {
      id: 'promob',
      name: 'Promob',
      role: CompetitorRole.MAIN,
      marketFocus: 'Foco',
      services: 'Serviços',
      features: 'Funções',
      audience: 'Público',
      rationale: 'Motivo',
      url: null,
      incorrect: false,
      qualifiedAt: '2026-03-01T12:00:00.000Z',
    },
  ],
}

const factFinding: Finding = {
  competitor: 'Promob',
  aspect: FindingAspect.FORMAT,
  kind: FindingKind.FACT,
  statement: 'Todo guia traz um vídeo incorporado.',
  url: 'https://promob.example/guia',
  excerpt: 'Assista ao passo a passo',
  tool: 'WebFetch',
}

const hypothesisFinding: Finding = {
  competitor: 'Promob',
  aspect: FindingAspect.TOPIC,
  kind: FindingKind.HYPOTHESIS,
  statement: 'Parecem mirar quem compara preços.',
  url: 'https://promob.example/escondido',
  excerpt: 'Trecho que não deve aparecer',
  tool: null,
}

function buildAnalysis(overrides: Partial<ChannelAnalysis> = {}): ChannelAnalysis {
  return {
    channel: Channel.SEO,
    partial: false,
    score: 9,
    rationale: 'Quatro concorrentes publicam com frequência.',
    bestContent: {
      type: 'Guia de preço por metro quadrado',
      evidence: 'Posições 1 a 3 no Google em 5 de 7 buscas.',
      basis: FindingKind.FACT,
    },
    findings: [factFinding, hypothesisFinding],
    collectedAt: '2026-03-15T12:00:00.000Z',
    ...overrides,
  }
}

function renderPage(routes: MockRoutes, channel = 'seo') {
  const api = mockApi({ [competitorsRoute]: { body: competitorsList }, ...routes })
  const view = renderWithProviders(<ChannelPage />, {
    initialEntry: `/projects/${PROJECT_ID}/channels/${channel}`,
    routePath: '/projects/:projectId/channels/:channel',
  })
  return { ...view, ...api }
}

describe('ChannelPage', () => {
  it('shows the loading message while the channel is on its way', () => {
    renderPage({ [channelRoute('seo')]: neverReplies })

    expect(screen.getByRole('status')).toHaveTextContent('Carregando canal...')
  })

  it('shows the channel name, the score, the rationale and the collection date', async () => {
    renderPage({ [channelRoute('seo')]: { body: buildAnalysis() } })

    expect(await screen.findByRole('heading', { level: 1, name: 'SEO e blog' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nota 9 de 10')).toBeInTheDocument()
    expect(screen.getByText('Quatro concorrentes publicam com frequência.')).toBeInTheDocument()
    expect(screen.getByText('Coletado 15 mar')).toBeInTheDocument()
  })

  it('expands and collapses the rationale', async () => {
    const { user } = renderPage({ [channelRoute('seo')]: { body: buildAnalysis() } })

    await user.click(await screen.findByRole('button', { name: 'ver tudo' }))

    expect(screen.getByRole('button', { name: 'recolher' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('shows what performs best as a fact backed by a public number', async () => {
    renderPage({ [channelRoute('seo')]: { body: buildAnalysis() } })

    const section = await screen.findByRole('region', { name: 'O que performa melhor' })

    expect(within(section).getByText('Guia de preço por metro quadrado')).toBeInTheDocument()
    expect(within(section).getByText('Posições 1 a 3 no Google em 5 de 7 buscas.')).toBeInTheDocument()
    expect(within(section).getByText('Fato')).toBeInTheDocument()
    expect(within(section).getByText('apoiado em número público')).toBeInTheDocument()
  })

  it('shows what performs best as a hypothesis without a public number', async () => {
    const bestContent = { type: 'Vídeo curto', evidence: 'Sem número público.', basis: FindingKind.HYPOTHESIS }
    renderPage({ [channelRoute('seo')]: { body: buildAnalysis({ bestContent }) } })

    const section = await screen.findByRole('region', { name: 'O que performa melhor' })

    expect(within(section).getByText('Hipótese')).toBeInTheDocument()
    expect(within(section).getByText('sem número público')).toBeInTheDocument()
  })

  it('shows the partial notice only when the channel is partial', async () => {
    const { unmount } = renderPage({ [channelRoute('seo')]: { body: buildAnalysis({ partial: true }) } })

    expect(await screen.findByRole('note')).toHaveTextContent('a leitura pública alcança só parte do canal')
    unmount()

    renderPage({ [channelRoute('seo')]: { body: buildAnalysis({ partial: false }) } })
    await screen.findByRole('heading', { level: 1 })

    expect(screen.queryByRole('note')).not.toBeInTheDocument()
  })

  it('shows a fact with the excerpt, the tool and a link that opens in a new tab', async () => {
    renderPage({ [channelRoute('seo')]: { body: buildAnalysis() } })

    const link = await screen.findByRole('link', { name: 'https://promob.example/guia' })

    expect(link).toHaveAttribute('href', 'https://promob.example/guia')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByText('Assista ao passo a passo')).toBeInTheDocument()
    expect(screen.getByText('WebFetch')).toBeInTheDocument()
  })

  it('shows a hypothesis without link and without excerpt', async () => {
    renderPage({ [channelRoute('seo')]: { body: buildAnalysis() } })

    const block = await screen.findByRole('region', { name: 'Assunto' })

    expect(within(block).getByText('Hipótese')).toBeInTheDocument()
    expect(within(block).getByText('Parecem mirar quem compara preços.')).toBeInTheDocument()
    expect(within(block).queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByText('Trecho que não deve aparecer')).not.toBeInTheDocument()
  })

  it('does not turn a link that is not http or https into a link', async () => {
    const finding = { ...factFinding, url: 'javascript:alert(1)' }
    renderPage({ [channelRoute('seo')]: { body: buildAnalysis({ findings: [finding] }) } })

    expect(await screen.findByText('javascript:alert(1)')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /javascript/ })).not.toBeInTheDocument()
  })

  it('shows the text from the agent as plain text, without turning HTML into elements', async () => {
    const payload = '<img src=x onerror=alert(1)><b>negrito</b>'
    const finding = { ...factFinding, statement: payload, excerpt: payload }
    const analysis = buildAnalysis({
      rationale: payload,
      bestContent: { type: payload, evidence: payload, basis: FindingKind.FACT },
      findings: [finding],
    })
    const { container } = renderPage({ [channelRoute('seo')]: { body: analysis } })

    await screen.findByRole('heading', { level: 1 })

    expect(screen.getAllByText(payload).length).toBeGreaterThanOrEqual(5)
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('b')?.textContent ?? '').not.toBe('negrito')
  })

  it('shows "Nenhum achado registrado" with the score and the rationale when there are no findings', async () => {
    renderPage({ [channelRoute('seo')]: { body: buildAnalysis({ findings: [] }) } })

    expect(await screen.findByText('Nenhum achado registrado')).toBeInTheDocument()
    expect(screen.getByLabelText('Nota 9 de 10')).toBeInTheDocument()
    expect(screen.getByText('Quatro concorrentes publicam com frequência.')).toBeInTheDocument()
    expect(screen.getByText('0 de 1 concorrente com achado')).toBeInTheDocument()
  })

  it('shows that the channel was not collected, with the way back to the project', async () => {
    const notCollected = { status: 404, body: { error: { code: 'ANALYSIS_NOT_FOUND', message: 'Sem coleta' } } }
    renderPage({ [channelRoute('seo')]: notCollected })

    expect(await screen.findByText('Este canal ainda não foi coletado.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao projeto' })).toHaveAttribute('href', `/projects/${PROJECT_ID}`)
  })

  it('shows "Canal não encontrado" when the address points to a channel that does not exist', async () => {
    const notFound = { status: 404, body: { error: { code: 'CHANNEL_NOT_FOUND', message: 'Sem canal' } } }
    renderPage({ [channelRoute('inexistente')]: notFound }, 'inexistente')

    expect(await screen.findByRole('heading', { name: 'Canal não encontrado' })).toBeInTheDocument()
  })

  it('shows the failure with a retry that loads the channel again', async () => {
    let attempts = 0
    const handler = () => {
      attempts += 1
      return attempts === 1 ? serverError : { body: buildAnalysis() }
    }
    const { user } = renderPage({ [channelRoute('seo')]: handler })

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar o canal.')
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'SEO e blog' })).toBeInTheDocument()
  })

  it('still shows the findings when the competitors list fails', async () => {
    renderPage({
      [channelRoute('seo')]: { body: buildAnalysis() },
      [competitorsRoute]: serverError,
    })

    expect(await screen.findByText('Todo guia traz um vídeo incorporado.')).toBeInTheDocument()
  })
})
