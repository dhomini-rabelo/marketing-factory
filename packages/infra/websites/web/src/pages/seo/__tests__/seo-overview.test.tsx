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

function buildRound(competitors: SeoRoundCompetitor[], overrides: Partial<SeoRound> = {}): SeoRound {
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
    ...overrides,
  }
}

function renderOverview(competitors: SeoRoundCompetitor[], overrides: Partial<SeoRound> = {}) {
  mockApi({
    [`GET ${API_ROUTES.seo.rounds(PROJECT_ID)}`]: { body: { rounds: [summary] } },
    [`GET ${API_ROUTES.seo.round(PROJECT_ID, 'latest')}`]: { body: buildRound(competitors, overrides) },
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

function buildTopic(index: number, pages: number) {
  return {
    numbers: { pages },
    texts: { theme: `Tema ${index}`, term: `termo-${index}`, exampleUrl: `https://www.cally.com/blog/exemplo-${index}` },
  }
}

const callyWithDetails: SeoRoundCompetitor = {
  ...cally,
  profile: {
    ...(cally.profile as object),
    texts: {
      ...(cally.profile as { texts: object }).texts,
      dominantTopics: 'Agendamento, produtividade e reuniões.',
    },
  },
  clusters: Array.from({ length: 10 }, (_, index) => buildTopic(index + 1, 10 + index)),
}

const documents = [
  { title: 'Como cada um monta a página', fileName: 'seo-comparacoes.md', about: 'Estrutura das páginas de comparação.', size: 2048, body: '# Comparações\n\nCada página compara dois produtos lado a lado.' },
]

const searches = [
  {
    texts: { query: 'agenda online', market: 'Brasil', searchedAt: '2026-11-20', searchTool: 'google' },
    results: [{ position: 1, competitor: 'Cally' }, { position: 2, domain: 'outro.com' }],
  },
]

async function findSection(title: string) {
  const heading = await screen.findByRole('heading', { name: title })
  return within(heading.closest('section') as HTMLElement)
}

describe('SeoOverview temas, leitura, posição e documentos', () => {
  it('shows up to 8 topics per competitor ordered by pages with an example link', async () => {
    renderOverview([callyWithDetails, fireflies])

    const section = await findSection('Temas do blog')
    const items = section.getAllByRole('listitem')
    expect(items).toHaveLength(8)
    expect(items[0]).toHaveTextContent('Tema 10')
    expect(items[0]).toHaveTextContent('19')
    expect(within(items[0]).getByRole('link', { name: 'exemplo' })).toHaveAttribute('href', 'https://www.cally.com/blog/exemplo-10')
    expect(section.getByText('2 temas a mais na aba dele')).toBeInTheDocument()
    expect(section.getByText(/Sem temas contados/)).toBeInTheDocument()
  })

  it('shows the reading and the collection limits of each competitor', async () => {
    renderOverview([callyWithDetails, fireflies])

    const section = await findSection('Leitura do agente')
    expect(section.getByText('Agendamento, produtividade e reuniões.')).toBeInTheDocument()
    expect(section.getAllByText('Limites da coleta.')).toHaveLength(2)
    expect(section.getAllByText('não medido')).toHaveLength(1)
  })

  it('shows the Google sample with the low confidence seal and the collection date', async () => {
    renderOverview([cally], { searches })

    const section = await findSection('Amostra de posição no Google')
    expect(section.getByText(/baixa confiança/)).toBeInTheDocument()
    expect(section.getByText(/21\/11\/2026/)).toBeInTheDocument()
    expect(section.getByText('agenda online')).toBeInTheDocument()
    expect(section.getByText('20/11/2026')).toBeInTheDocument()
    expect(section.getByText('1. Cally · 2. outro.com')).toBeInTheDocument()
  })

  it('says the tool gave no reliable search instead of an empty table', async () => {
    renderOverview([cally], { searches: [], note: 'Coleta feita. A ferramenta não deu busca confiável.' })

    const section = await findSection('Amostra de posição no Google')
    expect(section.getByText('Posição no Google não coletada nesta rodada')).toBeInTheDocument()
    expect(section.getByText(/A ferramenta não deu busca confiável\./)).toBeInTheDocument()
    expect(section.queryByRole('table')).not.toBeInTheDocument()
  })

  it('lists the round documents with title, size and what they are about', async () => {
    renderOverview([cally], { documents })

    const section = await findSection('Documentos anexados à rodada')
    expect(section.getByText('Como cada um monta a página')).toBeInTheDocument()
    expect(section.getByText('seo-comparacoes.md · 2,0 KB')).toBeInTheDocument()
    expect(section.getByText('Estrutura das páginas de comparação.')).toBeInTheDocument()
  })

  it('opens a round document with its whole text on the screen', async () => {
    const user = userEvent.setup()
    renderOverview([cally], { documents })

    const section = await findSection('Documentos anexados à rodada')
    const body = section.getByText(/Cada página compara dois produtos lado a lado\./)
    expect(body).not.toBeVisible()

    await user.click(section.getByText('Como cada um monta a página'))

    expect(body).toBeVisible()
    expect(body.textContent).toBe(documents[0].body)
  })

  it('says no document was attached when the round has none', async () => {
    renderOverview([cally])

    const section = await findSection('Documentos anexados à rodada')
    expect(section.getByText('O agente não anexou nada nesta rodada.')).toBeInTheDocument()
  })
})

describe('SeoOverview falha ao carregar a rodada', () => {
  it('shows the failure and requests the round again on retry', async () => {
    const user = userEvent.setup()
    let attempts = 0
    const api = mockApi({
      [`GET ${API_ROUTES.seo.rounds(PROJECT_ID)}`]: { body: { rounds: [summary] } },
      [`GET ${API_ROUTES.seo.round(PROJECT_ID, 'latest')}`]: () => {
        attempts += 1
        return attempts === 1 ? { status: 500, body: { error: 'x' } } : { body: buildRound([cally]) }
      },
    })
    renderWithProviders(<SeoPage />, {
      initialEntry: `/projects/${PROJECT_ID}/channels/seo`,
      routePath: '/projects/:projectId/channels/seo',
    })

    expect(await screen.findByText('Não foi possível carregar a rodada.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(await screen.findByText('Esforço de publicação')).toBeInTheDocument()
    expect(api.requestsTo('GET', API_ROUTES.seo.round(PROJECT_ID, 'latest'))).toHaveLength(2)
  })
})
