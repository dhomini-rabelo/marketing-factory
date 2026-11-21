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
const OTHER_NAME = 'Beta'

const summary: SeoRoundSummary = {
  id: 'r1',
  number: 1,
  tool: SeoTool.CLAUDE_CODE,
  collectedAt: '2026-11-21',
  status: SeoRoundStatus.COMPLETE,
  isLatest: true,
}

function buildCompetitor(name: string, collected: boolean): SeoRoundCompetitor {
  return {
    name,
    role: CompetitorRole.MAIN,
    collected,
    pagesRead: collected ? 10 : null,
    profile: collected
      ? { url: `https://www.${name.toLowerCase()}.com/`, numbers: { sitemapUrlsMainLanguage: 1000 }, texts: { limits: '' } }
      : null,
    comparisons: [],
    clusters: [],
  }
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
  competitors: [buildCompetitor(COMPETITOR_NAME, true), buildCompetitor(OTHER_NAME, false)],
  documents: [],
}

type CategoryInput = {
  name: string
  rateBasis?: string
  subtopics?: { label: string; count: number }[]
}

function buildCategory({ name, rateBasis = 'measured', subtopics = [] }: CategoryInput) {
  return {
    texts: { category: name, url: `https://cally.com/${name}`, source: 'category_page', term: '', newestPostDate: '2026-11-10', rateBasis },
    numbers: {
      posts30d: 4,
      posts90d: 9,
      postsPerWeek: 1.5,
      postsPerMonth: 6,
      postsListed: 12,
      formatGuide: 6,
      formatList: 4,
      funnelTop: 8,
      funnelMiddle: 4,
    },
    subtopics,
  }
}

function buildExample(index: number, category: string, withDetails = true) {
  return {
    url: `https://cally.com/post-${category}-${index}`,
    publishedAt: '2026-10-05',
    texts: {
      title: `Post ${category} ${index}`,
      category,
      cardSummary: withDetails ? `Resumo ${category} ${index}` : '',
      author: withDetails ? `Autora ${index}` : '',
      audienceRole: withDetails ? 'marketing' : '',
    },
  }
}

function buildAudience(role: string, posts: number, pct: number, tierByShare: string, tierByAgent: string) {
  return {
    texts: { audienceRole: role, audienceSize: 'smb', tierByShare, tierByAgent, agentReason: `Razão ${role}`, declaredPages: '' },
    numbers: { posts, pct },
  }
}

const categories = [
  buildCategory({ name: 'Produtividade', rateBasis: 'minimum', subtopics: [{ label: 'Agenda', count: 3 }] }),
  buildCategory({ name: 'Gestão' }),
]

const detail: SeoCompetitor = {
  name: COMPETITOR_NAME,
  profile: {},
  categories,
  clusters: [],
  comparisons: [],
  examples: [
    ...Array.from({ length: 7 }, (_, index) => buildExample(index + 1, 'Produtividade')),
    ...Array.from({ length: 3 }, (_, index) => buildExample(index + 1, 'Gestão', false)),
  ],
  folders: [],
  items: [],
  audiences: [buildAudience('marketing', 14, 63.6, 'primary', 'secondary'), buildAudience('vendas', 8, 36.4, 'secondary', 'secondary')],
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

async function openTab(name: string) {
  const user = userEvent.setup()
  const nav = await screen.findByRole('navigation', { name: 'Visão geral ou um concorrente' })
  await user.click(within(nav).getByRole('button', { name }))
  return user
}

function findSection(title: string) {
  return within(screen.getByRole('heading', { name: title }).closest('section') as HTMLElement)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('competitor tab sections', () => {
  it('asks for the competitor only after the tab opens and lists the sections in the specified order', async () => {
    const api = renderSeoPage({ [COMPETITOR_ROUTE]: { body: detail } })
    await screen.findByRole('navigation', { name: 'Visão geral ou um concorrente' })
    expect(api.requestsTo('GET', API_ROUTES.seo.competitor(PROJECT_ID, 'latest', COMPETITOR_NAME))).toHaveLength(0)

    await openTab(COMPETITOR_NAME)

    const tab = await screen.findByText('Esforço e tipos de página', { selector: 'h3' })
    const container = tab.closest('[data-secao="aba-concorrente"]') as HTMLElement
    const titles = Array.from(container.querySelectorAll(':scope > section')).map((section) => section.getAttribute('data-secao'))
    expect(titles).toEqual([
      'Esforço e tipos de página',
      'Categorias com ritmo',
      'Formato e funil por categoria',
      'Públicos',
      'Exemplos por tema',
      'Comunicação por post',
      'Imagens por post',
      'FAQ, chamadas para o produto e links',
      'Autores e tom',
      'Pastas em série',
      'Posts antigos',
      'Comparações',
      'Temas do blog',
      'Posts da amostra',
      'Leitura do agente',
      'Posição no Google',
      'Documentos',
    ])
    expect(api.requestsTo('GET', API_ROUTES.seo.competitor(PROJECT_ID, 'latest', COMPETITOR_NAME))).toHaveLength(1)
  })

  it('marks the minimum rate only on the category whose rate is a floor and flags low confidence on subtopics', async () => {
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: detail } })
    await openTab(COMPETITOR_NAME)
    await screen.findByText('Categorias com ritmo', { selector: 'h3' })

    const section = findSection('Categorias com ritmo')
    const minimumRow = section.getByText('Produtividade').closest('tr') as HTMLElement
    const measuredRow = section.getByText('Gestão').closest('tr') as HTMLElement
    expect(within(minimumRow).getAllByText('mín.')).toHaveLength(2)
    expect(within(measuredRow).queryByText('mín.')).not.toBeInTheDocument()
    expect(section.getByText('baixa confiança')).toBeInTheDocument()
    expect(within(minimumRow).getByText('Agenda')).toBeInTheDocument()
  })

  it('draws the format and funnel bars from the card counts', async () => {
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: detail } })
    await openTab(COMPETITOR_NAME)
    await screen.findByText('Formato e funil por categoria', { selector: 'h3' })

    const row = findSection('Formato e funil por categoria').getByText('Produtividade').closest('tr') as HTMLElement
    expect(row.querySelector('[data-segment="guide"]')).toHaveAttribute('title', 'guia: 6')
    expect(row.querySelector('[data-segment="top"]')).toHaveAttribute('title', 'topo: 8')
    expect(row.querySelector('[data-segment="template"]')).toBeNull()
  })

  it('marks the audiences whose tiers diverge and shows both models side by side', async () => {
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: detail } })
    await openTab(COMPETITOR_NAME)
    await screen.findByText('Públicos', { selector: 'h3' })

    const section = findSection('Públicos')
    expect(section.getByText('22 exemplos classificados')).toBeInTheDocument()
    expect(section.queryByText('poucos exemplos classificados: sem nível por fatia')).not.toBeInTheDocument()
    expect(section.getAllByText('divergem')).toHaveLength(1)
    const divergentRows = document.querySelectorAll('[data-divergent="true"]')
    expect(divergentRows.length).toBeGreaterThan(0)
    expect(section.getByText('Razão marketing')).toBeInTheDocument()
  })

  it('says there are few classified examples when the audiences hold fewer than twenty', async () => {
    const fewExamples = { ...detail, audiences: [buildAudience('marketing', 6, 100, 'primary', 'primary')] }
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: fewExamples } })
    await openTab(COMPETITOR_NAME)
    await screen.findByText('Públicos', { selector: 'h3' })

    const section = findSection('Públicos')
    expect(section.getByText('poucos exemplos classificados: sem nível por fatia')).toBeInTheDocument()
    expect(section.queryByText('divergem')).not.toBeInTheDocument()
  })

  it('shows the collection limits as the reason when the audiences come empty', async () => {
    const limits = 'Não houve 20 exemplos classificados por público.'
    const noAudiences = { ...detail, audiences: [], profile: { texts: { limits } } }
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: noAudiences } })
    await openTab(COMPETITOR_NAME)
    await screen.findByText('Públicos', { selector: 'h3' })

    const section = findSection('Públicos')
    expect(section.getByText('Esta rodada não traz análise de públicos.')).toBeInTheDocument()
    expect(section.getByText(limits)).toBeInTheDocument()
  })

  it('shows five examples per topic, opens the rest with "ver todos (N)" and leaves missing fields blank', async () => {
    const user = userEvent.setup()
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: detail } })
    await openTab(COMPETITOR_NAME)
    await screen.findByText('Exemplos por tema', { selector: 'h3' })

    const section = findSection('Exemplos por tema')
    const productivity = section.getByText('Produtividade').closest('details') as HTMLElement
    expect(within(productivity).getAllByRole('row')).toHaveLength(6)

    await user.click(within(productivity).getByRole('button', { name: 'ver todos (7)' }))
    expect(within(productivity).getAllByRole('row')).toHaveLength(8)
    expect(within(productivity).getByRole('button', { name: 'ver menos' })).toBeInTheDocument()

    const management = section.getByText('Gestão').closest('details') as HTMLElement
    expect(within(management).queryByRole('button')).not.toBeInTheDocument()
    const blankRow = management.querySelector('[data-example="https://cally.com/post-Gestão-1"]') as HTMLElement
    expect(within(blankRow).queryByText('resumo do card')).not.toBeInTheDocument()
    expect(blankRow.querySelectorAll('td')[2]).toBeEmptyDOMElement()
    expect(blankRow.querySelectorAll('td')[3]).toBeEmptyDOMElement()
  })
})

const BLOG_LIMITS = 'Parágrafos e palavras vêm do article ou main, que faltou em alguns posts. Sem dateModified em um post antigo.'

function buildItem(url: string, role: string, numbers: Record<string, number | null>, texts: Record<string, string>, publishedAt: string | null) {
  return { url, pageType: 'blog', publishedAt, numbers, texts: { sampleRole: role, title: `Título ${url}`, ...texts } }
}

const blogItems = [
  buildItem(
    'https://cally.com/a',
    'recent',
    { words: 1200, paragraphs: 30, wordsPerParagraph: 40, lists: 3, tables: 0, h2Count: 5, h3Count: 6, images: 4, imagesAltPct: 50, faqQuestions: 3, ctaLinks: 2, internalLinks: 9 },
    { ldTypes: 'Article, FAQPage', ctaTargets: 'app' },
    '2026-11-10',
  ),
  buildItem(
    'https://cally.com/b',
    'recent',
    { words: null, paragraphs: null, wordsPerParagraph: null, images: 0, imagesAltPct: null, faqQuestions: null, ctaLinks: 0, internalLinks: 2 },
    {},
    '2026-11-05',
  ),
  buildItem('https://cally.com/c', 'old', { words: 800, images: 1, imagesAltPct: 100 }, { modifiedAt: '2026-02-01' }, '2025-01-10'),
  buildItem('https://cally.com/d', 'old', { words: 700, images: 1, imagesAltPct: 100 }, {}, '2025-02-10'),
]

const blogDetail: SeoCompetitor = {
  ...detail,
  profile: { numbers: { authorsSeen: 4 }, texts: { limits: BLOG_LIMITS, authorKind: 'people', tone: 'Direto e informal' } },
  items: blogItems,
  folders: [
    { numbers: { pages: 86 }, texts: { folder: '/integrations' } },
    { numbers: { pages: 12 }, texts: { folder: '/templates' } },
  ],
}

function findRow(section: ReturnType<typeof findSection>, url: string) {
  return within(section.getAllByRole('row').find((row) => row.getAttribute('data-item') === url) as HTMLElement)
}

describe('competitor tab blog sections', () => {
  it('shows "não medido" with the collection reason, never zero, for communication numbers that came empty', async () => {
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: blogDetail } })
    await openTab(COMPETITOR_NAME)
    await screen.findByText('Comunicação por post', { selector: 'h3' })

    const section = findSection('Comunicação por post')
    expect(section.getAllByRole('row')).toHaveLength(5)
    expect(findRow(section, 'https://cally.com/a').getByText('1.200')).toBeInTheDocument()
    const missing = findRow(section, 'https://cally.com/b').getAllByText('não medido')
    expect(missing).toHaveLength(9)
    expect(missing[0]).toHaveAttribute('title', 'Parágrafos e palavras vêm do article ou main, que faltou em alguns posts.')
  })

  it('shows the images and the share with alternative text, and says when a post has no images', async () => {
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: blogDetail } })
    await openTab(COMPETITOR_NAME)
    await screen.findByText('Imagens por post', { selector: 'h3' })

    const section = findSection('Imagens por post')
    expect(findRow(section, 'https://cally.com/a').getByText('50%')).toBeInTheDocument()
    expect(findRow(section, 'https://cally.com/b').getByText('sem imagens')).toBeInTheDocument()
  })

  it('shows FAQ, schema types, call-to-action destinations and the reason when the schema is missing', async () => {
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: blogDetail } })
    await openTab(COMPETITOR_NAME)
    await screen.findByText('FAQ, chamadas para o produto e links', { selector: 'h3' })

    const section = findSection('FAQ, chamadas para o produto e links')
    const rowA = findRow(section, 'https://cally.com/a')
    expect(rowA.getByText('Article, FAQPage')).toBeInTheDocument()
    expect(rowA.getByText('app')).toBeInTheDocument()
    const rowB = findRow(section, 'https://cally.com/b')
    expect(rowB.getByText('nenhum')).toBeInTheDocument()
    expect(rowB.getAllByText('não coletado').length).toBeGreaterThan(0)
  })

  it('shows authors, who signs and the tone, with low confidence on the tone', async () => {
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: blogDetail } })
    await openTab(COMPETITOR_NAME)
    await screen.findByText('Autores e tom', { selector: 'h3' })

    const section = findSection('Autores e tom')
    expect(section.getByText('4')).toBeInTheDocument()
    expect(section.getByText('pessoas')).toBeInTheDocument()
    expect(section.getByText('Direto e informal')).toBeInTheDocument()
    expect(section.getByText('baixa confiança')).toBeInTheDocument()
  })

  it('marks authors and tone as not collected when the profile does not bring them', async () => {
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: { ...blogDetail, profile: { texts: { limits: 'Sem autor na página.' } } } } })
    await openTab(COMPETITOR_NAME)
    await screen.findByText('Autores e tom', { selector: 'h3' })

    const missing = findSection('Autores e tom').getAllByText('não coletado')
    expect(missing).toHaveLength(3)
    expect(missing[0]).toHaveAttribute('title', 'Sem autor na página.')
  })

  it('lists the series folders with the page count', async () => {
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: blogDetail } })
    await openTab(COMPETITOR_NAME)
    await screen.findByText('Pastas em série', { selector: 'h3' })

    const section = findSection('Pastas em série')
    expect(section.getAllByRole('listitem')).toHaveLength(2)
    expect(within(section.getByText('/integrations').closest('li') as HTMLElement).getByText('86')).toBeInTheDocument()
  })

  it('lists only the old posts with age and whether they were updated', async () => {
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: blogDetail } })
    await openTab(COMPETITOR_NAME)
    await screen.findByText('Posts antigos', { selector: 'h3' })

    const section = findSection('Posts antigos')
    expect(section.getAllByRole('row')).toHaveLength(3)
    const rowC = findRow(section, 'https://cally.com/c')
    expect(rowC.getByText('23 meses')).toBeInTheDocument()
    expect(rowC.getByText('atualizado')).toBeInTheDocument()
    const rowD = findRow(section, 'https://cally.com/d')
    expect(rowD.getAllByText('não coletado').length).toBeGreaterThan(0)
  })

  it('shows the collection limits instead of empty blog sections when the competitor has no blog', async () => {
    const limits = 'O blog exige login e foi barrado.'
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: { ...blogDetail, items: [], folders: [], profile: { texts: { limits } } } } })
    await openTab(COMPETITOR_NAME)
    await screen.findByText('Comunicação por post', { selector: 'h3' })

    for (const title of ['Comunicação por post', 'Imagens por post', 'FAQ, chamadas para o produto e links']) {
      const section = findSection(title)
      expect(section.getByText('Nenhuma página lida na amostra.')).toBeInTheDocument()
      expect(section.getByText(limits)).toBeInTheDocument()
    }
    expect(findSection('Posts antigos').getByText('Sem post antigo na amostra.')).toBeInTheDocument()
  })
})

const closingLimits = 'Sem dateModified em um post antigo.'

function buildSearch(query: string, results: { position: number; competitor: string }[]) {
  return { texts: { query, market: 'Brasil', searchedAt: '2026-11-20', searchTool: 'Grok' }, results }
}

const closingDocuments = [
  { title: 'Plano de conteúdo', fileName: 'plano.md', about: 'Cita o Cally em vários pontos.', size: 2048, body: 'Texto inteiro do plano sobre o Cally.' },
]

const closingDetail: SeoCompetitor = {
  ...blogDetail,
  profile: { url: 'https://www.cally.com/', numbers: { blogPostsMainLanguage: 100 }, texts: { limits: closingLimits, dominantTopics: 'Produtividade e agenda para times remotos.' } },
  comparisons: Array.from({ length: 7 }, (_, index) => ({
    url: `https://cally.com/vs/rival-${index + 1}`,
    texts: { slug: `cally-vs-rival-${index + 1}`, rivals: [`Rival ${index + 1}`], format: 'vs' },
  })),
  clusters: Array.from({ length: 10 }, (_, index) => ({
    texts: { theme: `Tema ${index + 1}`, term: `termo-${index + 1}`, exampleUrl: `https://cally.com/blog/tema-${index + 1}` },
    numbers: { pages: 50 - index },
  })),
  documents: closingDocuments,
}

describe('competitor tab closing sections', () => {
  it('lists every comparison in a full table and every counted blog topic, beyond the overview caps', async () => {
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: closingDetail } })
    await openTab(COMPETITOR_NAME)
    await screen.findByText('Comparações', { selector: 'h3' })

    const comparisons = findSection('Comparações')
    expect(comparisons.getAllByRole('row')).toHaveLength(8)
    expect(comparisons.getByText('cally-vs-rival-7')).toBeInTheDocument()
    expect(findSection('Temas do blog').getAllByRole('listitem')).toHaveLength(10)
  })

  it('says why there are no comparisons and no topics instead of leaving the sections empty', async () => {
    const limits = 'O blog exige login e foi barrado.'
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: { ...closingDetail, comparisons: [], clusters: [], items: [], profile: { texts: { limits } } } } })
    await openTab(COMPETITOR_NAME)
    await screen.findByText('Comparações', { selector: 'h3' })

    expect(findSection('Comparações').getByText('Sem comparações nesta rodada.')).toBeInTheDocument()
    expect(findSection('Comparações').getByText(limits)).toBeInTheDocument()
    expect(findSection('Temas do blog').getByText(limits)).toBeInTheDocument()
    expect(findSection('Posts da amostra').getByText('Nenhuma página lida na amostra.')).toBeInTheDocument()
  })

  it('shows each sample post with title, type, date, words and link, and "não medido" for missing words', async () => {
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: closingDetail } })
    await openTab(COMPETITOR_NAME)
    await screen.findByText('Posts da amostra', { selector: 'h3' })

    const section = findSection('Posts da amostra')
    expect(section.getAllByRole('row')).toHaveLength(5)
    const first = findRow(section, 'https://cally.com/a')
    expect(first.getByText('Título https://cally.com/a')).toBeInTheDocument()
    expect(first.getByText('blog')).toBeInTheDocument()
    expect(first.getByText('10/11/2026')).toBeInTheDocument()
    expect(first.getByText('1.200')).toBeInTheDocument()
    expect(first.getByRole('link', { name: 'abrir' })).toHaveAttribute('href', 'https://cally.com/a')
    expect(findRow(section, 'https://cally.com/b').getByText('não medido')).toBeInTheDocument()
  })

  it('shows the agent reading with low confidence and the collection limits', async () => {
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: closingDetail } })
    await openTab(COMPETITOR_NAME)
    await screen.findByText('Leitura do agente', { selector: 'h3' })

    const section = findSection('Leitura do agente')
    expect(section.getByText('Produtividade e agenda para times remotos.')).toBeInTheDocument()
    expect(section.getByText('baixa confiança')).toBeInTheDocument()
    expect(section.getByText(closingLimits)).toBeInTheDocument()
  })

  it('shows the positions only of this competitor, with low confidence and outside the sample when it did not appear', async () => {
    const searches = [
      buildSearch('agenda online', [{ position: 3, competitor: COMPETITOR_NAME }, { position: 5, competitor: OTHER_NAME }]),
      buildSearch('reunião remota', [{ position: 1, competitor: OTHER_NAME }]),
    ]
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: closingDetail }, [`GET ${API_ROUTES.seo.round(PROJECT_ID, 'latest')}`]: { body: { ...round, searches } } })
    await openTab(COMPETITOR_NAME)
    await screen.findByText('Posição no Google', { selector: 'h3' })

    const section = findSection('Posição no Google')
    expect(section.getByText('baixa confiança')).toBeInTheDocument()
    expect(section.getByText('3º')).toBeInTheDocument()
    expect(section.queryByText('5º')).not.toBeInTheDocument()
    expect(section.getByText('fora da amostra')).toBeInTheDocument()
  })

  it('says the Google position was not collected, with the reason from the round note, when there are no searches', async () => {
    const note = 'A ferramenta não deu busca confiável.'
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: closingDetail }, [`GET ${API_ROUTES.seo.round(PROJECT_ID, 'latest')}`]: { body: { ...round, note } } })
    await openTab(COMPETITOR_NAME)
    await screen.findByText('Posição no Google', { selector: 'h3' })

    const section = findSection('Posição no Google')
    expect(section.getByText('Posição no Google não coletada nesta rodada.')).toBeInTheDocument()
    expect(section.getByText(note)).toBeInTheDocument()
  })

  it('opens the whole document that cites the competitor and says when none does', async () => {
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: closingDetail } })
    const user = await openTab(COMPETITOR_NAME)
    await screen.findByText('Documentos', { selector: 'h3' })

    const section = findSection('Documentos')
    expect(section.getByText('Plano de conteúdo')).toBeInTheDocument()
    expect(section.getByText('2,0 KB', { exact: false })).toBeInTheDocument()
    await user.click(section.getByText('ler aqui'))
    expect(section.getByText('Texto inteiro do plano sobre o Cally.')).toBeVisible()
  })

  it('says no document cites the competitor and gives the blog limits when there is no blog', async () => {
    const limits = 'O blog exige login e foi barrado.'
    renderSeoPage({ [COMPETITOR_ROUTE]: { body: { ...closingDetail, items: [], documents: [], profile: { texts: { limits } } } } })
    await openTab(COMPETITOR_NAME)
    await screen.findByText('Documentos', { selector: 'h3' })

    const section = findSection('Documentos')
    expect(section.getByText('Nenhum documento da rodada cita Cally.')).toBeInTheDocument()
    expect(section.getByText(limits)).toBeInTheDocument()
  })
})

describe('competitor tab states', () => {
  it('shows the loading notice while the other tabs stay clickable', async () => {
    let release: () => void = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    renderSeoPage({
      [COMPETITOR_ROUTE]: async () => {
        await gate
        return { body: detail }
      },
    })

    const user = await openTab(COMPETITOR_NAME)
    expect(await screen.findByText('Carregando os dados de Cally...')).toBeInTheDocument()

    const nav = screen.getByRole('navigation', { name: 'Visão geral ou um concorrente' })
    await user.click(within(nav).getByRole('button', { name: OTHER_NAME }))
    expect(screen.queryByText('Carregando os dados de Cally...')).not.toBeInTheDocument()
    expect(await screen.findByText(/ainda não coletado nesta rodada/)).toBeInTheDocument()

    release()
  })

  it('shows the failure notice and asks again with "Tentar de novo"', async () => {
    let attempts = 0
    const api = renderSeoPage({
      [COMPETITOR_ROUTE]: () => {
        attempts += 1
        return attempts === 1 ? { status: 500, body: { code: 'INTERNAL_ERROR' } } : { body: detail }
      },
    })

    const user = await openTab(COMPETITOR_NAME)
    expect(await screen.findByText('Não foi possível carregar os dados de Cally. Tente de novo.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(await screen.findByText('Categorias com ritmo', { selector: 'h3' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(api.requestsTo('GET', API_ROUTES.seo.competitor(PROJECT_ID, 'latest', COMPETITOR_NAME))).toHaveLength(2)
  })

  it('shows "ainda não coletado" with the complete command and never asks for a competitor that was not collected', async () => {
    const api = renderSeoPage({})
    await openTab(OTHER_NAME)

    const notice = await screen.findByText(/ainda não coletado nesta rodada/)
    expect(notice.closest('[data-secao="nao-coletado"]')).not.toBeNull()
    expect(screen.getByRole('button', { name: /Copiar comando para completar/ })).toBeInTheDocument()
    await waitFor(() => expect(api.requestsTo('GET', API_ROUTES.seo.competitor(PROJECT_ID, 'latest', OTHER_NAME))).toHaveLength(0))
    expect(screen.queryByText('Esforço e tipos de página', { selector: 'h3' })).not.toBeInTheDocument()
  })
})
