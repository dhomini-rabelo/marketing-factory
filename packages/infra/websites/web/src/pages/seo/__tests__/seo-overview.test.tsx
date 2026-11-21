import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CompetitorRole } from '@/api/models/competitor'
import { SeoRoundStatus, SeoTool, type SeoRound, type SeoRoundCompetitor, type SeoRoundSummary } from '@/api/models/seo'
import { API_ROUTES } from '@/api/routes'
import { mockApi } from '@/__tests__/utils/mock-api'
import { renderWithProviders } from '@/__tests__/utils/render-with-providers'
import { SeoPage } from '@/pages/seo/page'

const PROJECT_ID = 'p1'
const LIMITS = 'Sitemap não abriu; blog sem pasta identificável.'

const summary: SeoRoundSummary = {
  id: 'r1',
  number: 1,
  tool: SeoTool.CLAUDE_CODE,
  collectedAt: '2026-11-21',
  status: SeoRoundStatus.COMPLETE,
  isLatest: true,
}

function buildCompetitor(name: string, numbers: Record<string, number | null>, role = CompetitorRole.MAIN): SeoRoundCompetitor {
  return {
    name,
    role,
    collected: true,
    pagesRead: 10,
    profile: {
      url: `https://www.${name.toLowerCase()}.com/`,
      numbers: {
        sitemapUrlsMainLanguage: 1000,
        cadenceSampleSize: 20,
        wordsSampleSize: 12,
        ...numbers,
      },
      texts: { limits: LIMITS, cadenceSource: 'RSS', newestPostDate: '2026-11-03', languages: 'en, pt-BR' },
    },
    comparisons: [],
    clusters: [],
  }
}

function buildRound(competitors: SeoRoundCompetitor[]): SeoRound {
  return {
    id: 'r1',
    tool: SeoTool.CLAUDE_CODE,
    collectedAt: '2026-11-21',
    note: '',
    market: 'Brasil, português',
    status: SeoRoundStatus.COMPLETE,
    missing: [],
    warnings: [],
    searches: [],
    pagesRead: 30,
    competitors,
    documents: [],
  }
}

function renderOverview(competitors: SeoRoundCompetitor[]) {
  mockApi({
    [`GET ${API_ROUTES.seo.rounds(PROJECT_ID)}`]: { body: { rounds: [summary] } },
    [`GET ${API_ROUTES.seo.round(PROJECT_ID, 'latest')}`]: { body: buildRound(competitors) },
  })
  return renderWithProviders(<SeoPage />, {
    initialEntry: `/projects/${PROJECT_ID}/channels/seo`,
    routePath: '/projects/:projectId/channels/seo',
  })
}

const cally = buildCompetitor('Cally', {
  blogPostsMainLanguage: 120,
  postsPerWeek: 2.5,
  daysSinceLastPost: 3,
  wordsMedian: 900,
  pagesComparison: 40,
  pagesIntegrations: 10,
  pagesTools: 0,
  pagesTemplates: 5,
  pagesLanding: 7,
  languagesCount: 3,
})

const fireflies = buildCompetitor(
  'Fireflies',
  {
    blogPostsMainLanguage: 300,
    postsPerWeek: null,
    daysSinceLastPost: 9,
    wordsMedian: 1400,
    pagesComparison: 12,
    pagesIntegrations: 80,
    pagesTools: 3,
    pagesTemplates: 0,
    pagesLanding: 2,
    languagesCount: null,
  },
  CompetitorRole.SECONDARY,
)

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('SeoOverview comparativo', () => {
  it('shows the effort and page type tables with the paid tools strip', async () => {
    renderOverview([cally, fireflies])

    const effortHeader = await screen.findByText('Esforço de publicação')
    expect(effortHeader).toBeInTheDocument()
    expect(screen.getByText('Tipos de página e idiomas')).toBeInTheDocument()
    expect(screen.getByText('Esta tela não sabe')).toBeInTheDocument()
    for (const metric of ['Volume de busca', 'Backlinks', 'Tráfego']) {
      expect(screen.getByText(metric)).toBeInTheDocument()
    }
    expect(screen.getAllByText('indisponível sem ferramenta paga')).toHaveLength(3)
  })

  it('marks the best value of each column and sorts when a column header is clicked', async () => {
    const user = userEvent.setup()
    renderOverview([cally, fireflies])

    await screen.findByText('Esforço de publicação')
    const [effortTable] = screen.getAllByRole('table')
    const bestCells = Array.from(effortTable.querySelectorAll('td[data-best="true"]'))
    expect(bestCells.map((cell) => cell.getAttribute('data-value'))).toEqual(['3', '300', '1400'])

    const rowNames = () => within(effortTable).getAllByRole('row').slice(1).map((row) => row.getAttribute('data-competitor'))
    expect(rowNames()).toEqual(['Cally', 'Fireflies'])

    await user.click(within(effortTable).getByRole('button', { name: /Posts no blog/ }))
    expect(rowNames()).toEqual(['Cally', 'Fireflies'])
    await user.click(within(effortTable).getByRole('button', { name: /Posts no blog/ }))
    expect(rowNames()).toEqual(['Fireflies', 'Cally'])
  })

  it('shows a single competitor without sorting or best value', async () => {
    renderOverview([cally])

    await screen.findByText('Esforço de publicação')
    const [effortTable] = screen.getAllByRole('table')
    expect(within(effortTable).queryByRole('button')).not.toBeInTheDocument()
    expect(effortTable.querySelector('td[data-best="true"]')).toBeNull()
  })

  it('shows not measured with the collection reason and never zero', async () => {
    renderOverview([cally, fireflies])

    await screen.findByText('Esforço de publicação')
    const [effortTable, pageTypesTable] = screen.getAllByRole('table')
    const postsPerWeekReason = `menos de 10 datas reais na amostra, ou datas não confiáveis. ${LIMITS}`
    const postsPerWeekCell = within(effortTable).getByTitle(postsPerWeekReason).closest('td')
    expect(postsPerWeekCell).toHaveTextContent('não medido')
    expect(postsPerWeekCell).not.toHaveTextContent('0')

    const languagesReason = `home não abriu ou sem hreflang. ${LIMITS}`
    expect(within(pageTypesTable).getByTitle(languagesReason)).toHaveTextContent('não medido')
    expect(screen.getAllByText(/Não medido nunca vira 0/).length).toBeGreaterThan(0)
  })

  it('shows a zero that was measured as zero', async () => {
    renderOverview([cally, fireflies])

    await screen.findByText('Esforço de publicação')
    const pageTypesTable = screen.getAllByRole('table')[1]
    const callyRow = pageTypesTable.querySelector('tr[data-competitor="Cally"]') as HTMLElement
    expect(within(callyRow).getAllByText('0').length).toBeGreaterThan(0)
  })
})
