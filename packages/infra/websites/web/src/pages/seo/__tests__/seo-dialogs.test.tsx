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
