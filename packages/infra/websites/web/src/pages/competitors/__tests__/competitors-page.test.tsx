import { screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CompetitorApproval, CompetitorRole, type Competitor, type CompetitorsList } from '@/api/models/competitor'
import { API_ROUTES } from '@/api/routes'
import { mockApi, type MockRoutes } from '@/__tests__/utils/mock-api'
import { renderWithProviders } from '@/__tests__/utils/render-with-providers'
import { CompetitorsPage } from '@/pages/competitors/page'

const PROJECT_ID = 'p1'

const listRoute = `GET ${API_ROUTES.competitors.list(PROJECT_ID)}`
const markRoute = (competitorId: string) => `PATCH ${API_ROUTES.competitors.detail(PROJECT_ID, competitorId)}`
const approvalRoute = `PUT ${API_ROUTES.competitors.approval(PROJECT_ID)}`

const serverError = { status: 500, body: { error: { code: 'INTERNAL_ERROR', message: 'Falhou' } } }
const neverReplies = () => new Promise<never>(() => undefined)

function buildCompetitor(overrides: Partial<Competitor> & Pick<Competitor, 'id' | 'name'>): Competitor {
  return {
    role: CompetitorRole.MAIN,
    marketFocus: `Foco de ${overrides.name}`,
    services: `Serviços de ${overrides.name}`,
    features: `Funções de ${overrides.name}`,
    audience: `Público de ${overrides.name}`,
    rationale: `Motivo de ${overrides.name}`,
    url: null,
    incorrect: false,
    qualifiedAt: '2026-03-01T12:00:00.000Z',
    ...overrides,
  }
}

const mainCompetitor = buildCompetitor({ id: 'c1', name: 'OrçaMóvel', url: 'https://orcamovel.example/sobre' })
const secondaryCompetitor = buildCompetitor({ id: 'c2', name: 'Planilha Fácil', role: CompetitorRole.SECONDARY })
const markedCompetitor = buildCompetitor({ id: 'c3', name: 'Outro Mercado', incorrect: true })
const secondMainCompetitor = buildCompetitor({ id: 'c4', name: 'Oficina 360' })

function buildList(competitors: Competitor[], approval = CompetitorApproval.PENDING): CompetitorsList {
  return { approval, competitors }
}

function renderPage(routes: MockRoutes) {
  const api = mockApi(routes)
  const view = renderWithProviders(<CompetitorsPage />, {
    initialEntry: `/projects/${PROJECT_ID}/competitors`,
    routePath: '/projects/:projectId/competitors',
  })
  return { ...view, ...api }
}

function cardNames(): string[] {
  return screen.getAllByRole('article').map((card) => card.getAttribute('aria-label') ?? '')
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('CompetitorsPage', () => {
  it('shows the loading message while the list is on its way', () => {
    renderPage({ [listRoute]: neverReplies })

    expect(screen.getByRole('status')).toHaveTextContent('Carregando concorrentes...')
  })

  it('shows an error with a retry button when the list fails and reloads it', async () => {
    let attempts = 0
    const { user } = renderPage({
      [listRoute]: () => (++attempts === 1 ? serverError : { body: buildList([mainCompetitor]) }),
    })

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os concorrentes.')

    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(await screen.findByRole('heading', { level: 3, name: 'OrçaMóvel' })).toBeInTheDocument()
  })

  it('shows the empty message and the first prompt when there is no competitor yet', async () => {
    renderPage({ [listRoute]: { body: buildList([]) } })

    expect(await screen.findByText(/Nenhum concorrente gravado ainda/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Sem lista de concorrentes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copiar prompt de concorrentes' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Aprovar lista' })).toBeDisabled()
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })

  it('shows each competitor with role, market focus, services, features, audience and rationale', async () => {
    renderPage({ [listRoute]: { body: buildList([mainCompetitor, secondaryCompetitor]) } })

    const card = await screen.findByRole('article', { name: 'OrçaMóvel' })

    expect(within(card).getByText('principal')).toBeInTheDocument()
    expect(within(card).getByText('Foco de OrçaMóvel')).toBeInTheDocument()
    expect(within(card).getByText('Serviços de OrçaMóvel')).toBeInTheDocument()
    expect(within(card).getByText('Funções de OrçaMóvel')).toBeInTheDocument()
    expect(within(card).getByText('Público de OrçaMóvel')).toBeInTheDocument()
    expect(within(card).getByText(/Motivo de OrçaMóvel/)).toBeInTheDocument()
    expect(within(card).getByText('Por que é principal')).toBeInTheDocument()
    expect(within(screen.getByRole('article', { name: 'Planilha Fácil' })).getByText('secundário')).toBeInTheDocument()
  })

  it('lists main competitors first, then secondary ones and, at the end, the marked ones', async () => {
    renderPage({
      [listRoute]: { body: buildList([markedCompetitor, secondaryCompetitor, mainCompetitor, secondMainCompetitor]) },
    })

    await screen.findByRole('article', { name: 'OrçaMóvel' })

    expect(cardNames()).toEqual(['OrçaMóvel', 'Oficina 360', 'Planilha Fácil', 'Outro Mercado'])
    expect(screen.getByRole('article', { name: 'Outro Mercado' })).toHaveAttribute('data-incorrect', 'true')
  })

  it('summarizes the list in the header', async () => {
    renderPage({
      [listRoute]: { body: buildList([mainCompetitor, secondMainCompetitor, secondaryCompetitor, markedCompetitor]) },
    })

    expect(await screen.findByText('4 identificados')).toBeInTheDocument()
    expect(screen.getByText('3 na análise · 2 principais, 1 secundários')).toBeInTheDocument()
    expect(screen.getByText('1 marcado “Não é concorrente”')).toBeInTheDocument()
  })

  it('links the competitor site only when the address is http or https, in a new tab', async () => {
    const unsafeCompetitor = buildCompetitor({ id: 'c5', name: 'Sem Link', url: 'javascript:alert(1)' })
    renderPage({ [listRoute]: { body: buildList([mainCompetitor, unsafeCompetitor]) } })

    const link = await screen.findByRole('link', { name: 'orcamovel.example' })

    expect(link).toHaveAttribute('href', 'https://orcamovel.example/sobre')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(within(screen.getByRole('article', { name: 'Sem Link' })).queryByRole('link')).not.toBeInTheDocument()
  })

  it('shows agent text as plain text, never as markup', async () => {
    const markupCompetitor = buildCompetitor({ id: 'c6', name: 'Marca', rationale: '<img src=x onerror=alert(1)>' })
    renderPage({ [listRoute]: { body: buildList([markupCompetitor]) } })

    const card = await screen.findByRole('article', { name: 'Marca' })

    expect(within(card).getByText(/<img src=x onerror=alert\(1\)>/)).toBeInTheDocument()
    expect(card.querySelector('img')).toBeNull()
  })

  it('marks a competitor as "Não é concorrente" and sends the mark to the API', async () => {
    let competitors = [mainCompetitor, secondaryCompetitor]
    const { user, requestsTo } = renderPage({
      [listRoute]: () => ({ body: buildList(competitors) }),
      [markRoute('c1')]: () => {
        competitors = [{ ...mainCompetitor, incorrect: true }, secondaryCompetitor]
        return { body: competitors[0] }
      },
    })

    const card = await screen.findByRole('article', { name: 'OrçaMóvel' })
    await user.click(within(card).getByRole('button', { name: 'Não é concorrente' }))

    await waitFor(() => expect(cardNames()).toEqual(['Planilha Fácil', 'OrçaMóvel']))
    expect(requestsTo('PATCH', API_ROUTES.competitors.detail(PROJECT_ID, 'c1'))[0].body).toEqual({ incorrect: true })
    expect(within(screen.getByRole('article', { name: 'OrçaMóvel' })).getByRole('button', { name: 'Desfazer' })).toBeInTheDocument()
  })

  it('undoes the mark with "Desfazer" and puts the competitor back in its place', async () => {
    let competitors = [mainCompetitor, markedCompetitor]
    const { user, requestsTo } = renderPage({
      [listRoute]: () => ({ body: buildList(competitors) }),
      [markRoute('c3')]: () => {
        competitors = [mainCompetitor, { ...markedCompetitor, incorrect: false }]
        return { body: competitors[1] }
      },
    })

    const card = await screen.findByRole('article', { name: 'Outro Mercado' })
    await user.click(within(card).getByRole('button', { name: 'Desfazer' }))

    await waitFor(() => expect(screen.getByRole('article', { name: 'Outro Mercado' })).toHaveAttribute('data-incorrect', 'false'))
    expect(requestsTo('PATCH', API_ROUTES.competitors.detail(PROJECT_ID, 'c3'))[0].body).toEqual({ incorrect: false })
    expect(within(screen.getByRole('article', { name: 'Outro Mercado' })).getByRole('button', { name: 'Não é concorrente' })).toBeInTheDocument()
  })

  it('tells the user when saving a mark fails', async () => {
    const { user } = renderPage({
      [listRoute]: { body: buildList([mainCompetitor]) },
      [markRoute('c1')]: serverError,
    })

    await user.click(await screen.findByRole('button', { name: 'Não é concorrente' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível salvar a mudança.')
  })

  it('clears the failed mark alert once the list is approved', async () => {
    let list = buildList([mainCompetitor])
    const { user } = renderPage({
      [listRoute]: () => ({ body: list }),
      [markRoute('c1')]: serverError,
      [approvalRoute]: () => {
        list = buildList([mainCompetitor], CompetitorApproval.APPROVED)
        return { body: { approval: CompetitorApproval.APPROVED } }
      },
    })

    await user.click(await screen.findByRole('button', { name: 'Não é concorrente' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível salvar a mudança.')

    await user.click(screen.getByRole('button', { name: 'Aprovar lista' }))

    expect(await screen.findByRole('heading', { level: 2, name: 'Lista aprovada' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('keeps "Aprovar lista" disabled when every competitor is marked', async () => {
    renderPage({ [listRoute]: { body: buildList([markedCompetitor]) } })

    expect(await screen.findByRole('button', { name: 'Aprovar lista' })).toBeDisabled()
  })

  it('approves the list, shows it as approved and unlocks the second prompt', async () => {
    let list = buildList([mainCompetitor, markedCompetitor])
    const { user, requestsTo } = renderPage({
      [listRoute]: () => ({ body: list }),
      [approvalRoute]: () => {
        list = buildList([mainCompetitor, markedCompetitor], CompetitorApproval.APPROVED)
        return { body: { approval: CompetitorApproval.APPROVED } }
      },
    })

    await user.click(await screen.findByRole('button', { name: 'Aprovar lista' }))

    expect(await screen.findByRole('heading', { level: 2, name: 'Lista aprovada' })).toBeInTheDocument()
    expect(requestsTo('PUT', API_ROUTES.competitors.approval(PROJECT_ID))[0].body).toEqual({ approved: true })
    expect(screen.getByRole('button', { name: 'Reabrir lista' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Aprovar lista' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copiar prompt da pesquisa inicial' })).toBeEnabled()
  })

  it('reopens the approved list and blocks the second prompt again', async () => {
    let list = buildList([mainCompetitor], CompetitorApproval.APPROVED)
    const { user, requestsTo } = renderPage({
      [listRoute]: () => ({ body: list }),
      [approvalRoute]: () => {
        list = buildList([mainCompetitor])
        return { body: { approval: CompetitorApproval.PENDING } }
      },
    })

    await user.click(await screen.findByRole('button', { name: 'Reabrir lista' }))

    expect(await screen.findByRole('heading', { level: 2, name: 'Lista aguardando sua aprovação' })).toBeInTheDocument()
    expect(requestsTo('PUT', API_ROUTES.competitors.approval(PROJECT_ID))[0].body).toEqual({ approved: false })
    expect(screen.getByRole('button', { name: 'Aprovar lista' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Aprove a lista para liberar' })).toBeDisabled()
  })

  it('blocks the second prompt, blurred and with a disabled button, until the list is approved', async () => {
    renderPage({ [listRoute]: { body: buildList([mainCompetitor]) } })

    const lockedCard = await screen.findByRole('region', { name: 'Pesquisa inicial dos canais (bloqueado)' })

    expect(lockedCard).toHaveAttribute('aria-disabled', 'true')
    expect(within(lockedCard).getByText('bloqueado')).toBeInTheDocument()
    expect(within(lockedCard).getByRole('button', { name: 'Aprove a lista para liberar' })).toBeDisabled()
    expect(lockedCard.querySelector('pre')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('button', { name: 'Copiar prompt da pesquisa inicial' })).not.toBeInTheDocument()
  })

  it('copies the competitors prompt, and the initial research prompt once approved', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const { user } = renderPage({
      [listRoute]: { body: buildList([mainCompetitor], CompetitorApproval.APPROVED) },
    })
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    await user.click(await screen.findByRole('button', { name: 'Copiar prompt de concorrentes' }))
    await user.click(screen.getByRole('button', { name: 'Copiar prompt da pesquisa inicial' }))

    expect(writeText).toHaveBeenCalledTimes(2)
    expect(writeText.mock.calls[0][0]).toContain(`definir e qualificar os concorrentes do projeto ${PROJECT_ID}`)
    expect(writeText.mock.calls[1][0]).toContain(`pesquisa inicial dos canais de marketing dos concorrentes do projeto ${PROJECT_ID}`)
  })
})
