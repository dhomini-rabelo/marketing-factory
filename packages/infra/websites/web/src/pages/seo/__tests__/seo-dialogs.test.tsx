import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CompetitorRole } from '@/api/models/competitor'
import {
  SeoRoundStatus,
  SeoTool,
  type SeoCompetitor,
  type SeoRound,
  type SeoRoundCompetitor,
  type SeoRoundSummary,
} from '@/api/models/seo'
import { API_ROUTES } from '@/api/routes'
import { mockApi, type MockRoutes } from '@/__tests__/utils/mock-api'
import { renderWithProviders } from '@/__tests__/utils/render-with-providers'
import { SeoPage } from '@/pages/seo/page'

const PROJECT_ID = 'p1'
const COMPETITOR_NAME = 'Cally'

const summary: SeoRoundSummary = {
  id: 'r1',
  number: 1,
  tool: SeoTool.CLAUDE_CODE,
  collectedAt: '2026-11-21',
  status: SeoRoundStatus.COMPLETE,
  isLatest: true,
}

function buildComparison(index: number) {
  return {
    url: `https://cally.com/vs/rival-${index}`,
    texts: { slug: `cally-vs-rival-${index}`, rivals: [`Rival${index}`], format: 'vs' },
  }
}

const allComparisons = Array.from({ length: 8 }, (_, index) => buildComparison(index + 1))

const competitor: SeoRoundCompetitor = {
  name: COMPETITOR_NAME,
  role: CompetitorRole.MAIN,
  collected: true,
  pagesRead: 10,
  profile: {
    url: 'https://www.cally.com/',
    numbers: { sitemapUrlsMainLanguage: 1000, pagesComparison: 8 },
    texts: { limits: '' },
  },
  comparisons: allComparisons.slice(0, 5),
  clusters: [],
}

const round: SeoRound = {
  id: 'r1',
  tool: SeoTool.CLAUDE_CODE,
  collectedAt: '2026-11-21',
  note: '',
  market: 'Brasil, português',
  status: SeoRoundStatus.COMPLETE,
  missing: [],
  warnings: [],
  searches: [],
  pagesRead: 10,
  competitors: [competitor],
  documents: [],
}

const competitorDetail: SeoCompetitor = {
  name: COMPETITOR_NAME,
  profile: {},
  categories: [],
  clusters: [],
  comparisons: allComparisons,
  examples: [],
  folders: [],
  items: [],
  audiences: [],
  documents: [],
}

const COMPETITOR_ROUTE = `GET ${API_ROUTES.seo.competitor(PROJECT_ID, 'latest', COMPETITOR_NAME)}`

function renderSeoPage(extraRoutes: MockRoutes) {
  const api = mockApi({
    [`GET ${API_ROUTES.seo.rounds(PROJECT_ID)}`]: { body: { rounds: [summary] } },
    [`GET ${API_ROUTES.seo.round(PROJECT_ID, 'latest')}`]: { body: round },
    ...extraRoutes,
  })
  renderWithProviders(<SeoPage />, {
    initialEntry: `/projects/${PROJECT_ID}/channels/seo`,
    routePath: '/projects/:projectId/channels/seo',
  })
  return api
}

async function findComparisonsSection() {
  const heading = await screen.findByRole('heading', { name: 'Comparações e alternativas' })
  return within(heading.closest('section') as HTMLElement)
}

function expectScrollableInsideViewport(dialog: HTMLElement, rowInBody: HTMLElement) {
  expect(dialog).toHaveClass('max-h-[calc(100vh-3rem)]', 'flex', 'flex-col')
  expect(dialog).not.toHaveClass('max-h-full')
  const body = dialog.querySelector('.overflow-y-auto')
  expect(body).toHaveClass('min-h-0')
  expect(body).toContainElement(rowInBody)
  expect(body).not.toContainElement(within(dialog).getAllByRole('heading')[0])
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('comparisons dialog', () => {
  it('shows five comparisons per competitor and loads the full list only when the window opens', async () => {
    const user = userEvent.setup()
    const api = renderSeoPage({ [COMPETITOR_ROUTE]: { body: competitorDetail } })

    const section = await findComparisonsSection()
    expect(section.getAllByRole('listitem')).toHaveLength(5)
    expect(api.requestsTo('GET', API_ROUTES.seo.competitor(PROJECT_ID, 'latest', COMPETITOR_NAME))).toHaveLength(0)

    await user.click(section.getByRole('button', { name: /ver todas/ }))

    const dialog = await screen.findByRole('dialog')
    await waitFor(() => expect(within(dialog).getAllByRole('row')).toHaveLength(9))
    expect(within(dialog).getByText('cally-vs-rival-8')).toBeInTheDocument()
    expect(api.requestsTo('GET', API_ROUTES.seo.competitor(PROJECT_ID, 'latest', COMPETITOR_NAME))).toHaveLength(1)
  })

  it('caps the window at the viewport height and scrolls the list inside it with the header fixed', async () => {
    const user = userEvent.setup()
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: competitorDetail } })

    const section = await findComparisonsSection()
    await user.click(section.getByRole('button', { name: /ver todas/ }))

    const dialog = await screen.findByRole('dialog')
    await waitFor(() => expect(within(dialog).getAllByRole('row')).toHaveLength(9))
    expectScrollableInsideViewport(dialog, within(dialog).getAllByRole('row')[1])
  })

  it('closes the window with the close button, Escape and a click outside', async () => {
    const user = userEvent.setup()
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: competitorDetail } })

    const section = await findComparisonsSection()
    const openButton = section.getByRole('button', { name: /ver todas/ })

    await user.click(openButton)
    await user.click(await screen.findByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(openButton)
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(openButton)
    await screen.findByRole('dialog')
    await user.click(document.body)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('comparisons dialog failure', () => {
  it('shows the failure notice and retries the request until the full list loads', async () => {
    const user = userEvent.setup()
    let attempts = 0
    const api = renderSeoPage({
      [COMPETITOR_ROUTE]: () => {
        attempts += 1
        return attempts === 1 ? { status: 500, body: { code: 'INTERNAL_ERROR' } } : { body: competitorDetail }
      },
    })

    const section = await findComparisonsSection()
    await user.click(section.getByRole('button', { name: /ver todas/ }))

    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByText('Não foi possível carregar as comparações de Cally. Tente de novo.')).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Tentar de novo' }))

    await waitFor(() => expect(within(dialog).getAllByRole('row')).toHaveLength(9))
    expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument()
    expect(api.requestsTo('GET', API_ROUTES.seo.competitor(PROJECT_ID, 'latest', COMPETITOR_NAME))).toHaveLength(2)
  })
})

function buildAudienceExample(index: number, publishedAt: string, audienceRole: string, audienceSize: string) {
  return {
    url: `https://cally.com/post-${audienceRole}-${index}`,
    publishedAt,
    texts: { title: `Post ${audienceRole} ${index}`, category: `Tema ${index}`, audienceRole, audienceSize, cardSummary: '', author: '' },
  }
}

const audienceDetail: SeoCompetitor = {
  ...competitorDetail,
  examples: [
    buildAudienceExample(1, '2026-01-10', 'marketing', 'smb'),
    buildAudienceExample(2, '2026-09-20', 'marketing', 'enterprise'),
    buildAudienceExample(3, '', 'marketing', 'any'),
    buildAudienceExample(4, '2026-05-05', 'vendas', 'smb'),
  ],
  audiences: [
    {
      texts: { audienceRole: 'marketing', audienceSize: 'smb', tierByShare: 'primary', tierByAgent: 'primary', agentReason: '', declaredPages: '' },
      numbers: { posts: 3, pct: 75 },
    },
    {
      texts: { audienceRole: 'vendas', audienceSize: 'smb', tierByShare: 'secondary', tierByAgent: 'secondary', agentReason: '', declaredPages: '' },
      numbers: { posts: 1, pct: 25 },
    },
  ],
}

async function openAudienceExamples(label: string) {
  const user = userEvent.setup()
  const nav = await screen.findByRole('navigation', { name: 'Visão geral ou um concorrente' })
  await user.click(within(nav).getByRole('button', { name: COMPETITOR_NAME }))
  const heading = await screen.findByRole('heading', { name: 'Públicos' })
  const section = within(heading.closest('section') as HTMLElement)
  const openButton = section.getAllByRole('button', { name: label })[0]
  await user.click(openButton)
  return { user, openButton }
}

describe('audience examples dialog', () => {
  it('lists the examples of the audience of every size, newest first, with link, date, theme and size', async () => {
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: audienceDetail } })

    await openAudienceExamples('3 exemplos')

    const dialog = await screen.findByRole('dialog', { name: 'Exemplos de Marketing em Cally' })
    expect(within(dialog).getByText('3 exemplos, todos os portes')).toBeInTheDocument()
    const rows = within(dialog).getAllByRole('row').slice(1)
    expect(rows).toHaveLength(3)
    expect(within(rows[0]).getByRole('link', { name: 'Post marketing 2' })).toHaveAttribute('href', 'https://cally.com/post-marketing-2')
    expect(within(rows[0]).getByText('20/09/2026')).toBeInTheDocument()
    expect(within(rows[0]).getByText('Tema 2')).toBeInTheDocument()
    expect(within(rows[0]).getByText('grande empresa')).toBeInTheDocument()
    expect(within(rows[1]).getByText('Post marketing 1')).toBeInTheDocument()
    expect(within(rows[2]).getByText('sem data')).toBeInTheDocument()
    expect(within(dialog).queryByText('Post vendas 4')).not.toBeInTheDocument()
  })

  it('closes the window with the close button, Escape and a click outside', async () => {
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: audienceDetail } })

    const { user, openButton } = await openAudienceExamples('1 exemplo')
    await user.click(await screen.findByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(openButton)
    await screen.findByRole('dialog', { name: 'Exemplos de Vendas em Cally' })
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(openButton)
    await screen.findByRole('dialog')
    await user.click(document.body)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('scrolls the list inside the window when there are many examples', async () => {
    const manyExamples = Array.from({ length: 40 }, (_, index) => buildAudienceExample(index + 1, '2026-02-01', 'marketing', 'smb'))
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: { ...audienceDetail, examples: manyExamples } } })

    await openAudienceExamples('3 exemplos')

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getAllByRole('row')).toHaveLength(41)
    expectScrollableInsideViewport(dialog, within(dialog).getAllByRole('row')[1])
  })
})
