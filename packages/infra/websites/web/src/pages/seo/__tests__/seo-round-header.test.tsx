import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CompetitorRole } from '@/api/models/competitor'
import { SeoRoundStatus, SeoTool, type SeoRound, type SeoRoundSummary } from '@/api/models/seo'
import { API_ROUTES } from '@/api/routes'
import { mockApi } from '@/__tests__/utils/mock-api'
import { renderWithProviders } from '@/__tests__/utils/render-with-providers'
import { SeoPage } from '@/pages/seo/page'

const PROJECT_ID = 'p1'

const summary: SeoRoundSummary = {
  id: 'r1',
  number: 1,
  tool: SeoTool.CLAUDE_CODE,
  collectedAt: '2026-11-21',
  status: SeoRoundStatus.COMPLETE,
  isLatest: true,
}

function buildRound(overrides: Partial<SeoRound> = {}): SeoRound {
  return {
    id: 'r1',
    tool: SeoTool.CLAUDE_CODE,
    collectedAt: '2026-11-21',
    note: 'Sem login nas contas.',
    market: 'Brasil, português',
    status: SeoRoundStatus.COMPLETE,
    missing: [],
    warnings: [],
    searches: [],
    pagesRead: 53,
    competitors: [
      { name: 'Secundário', role: CompetitorRole.SECONDARY, collected: true, pagesRead: 10, profile: {}, comparisons: [], clusters: [] },
      { name: 'Principal', role: CompetitorRole.MAIN, collected: true, pagesRead: 43, profile: {}, comparisons: [], clusters: [] },
    ],
    documents: [
      { title: 'A', fileName: 'a.md', about: 'a', size: 10, body: 'Corpo A' },
      { title: 'B', fileName: 'b.md', about: 'b', size: 20, body: 'Corpo B' },
    ],
    ...overrides,
  }
}

function renderPage(round: SeoRound, rounds: SeoRoundSummary[] = [summary]) {
  mockApi({
    [`GET ${API_ROUTES.seo.rounds(PROJECT_ID)}`]: { body: { rounds } },
    [`GET ${API_ROUTES.seo.round(PROJECT_ID, 'latest')}`]: { body: round },
  })
  return renderWithProviders(<SeoPage />, {
    initialEntry: `/projects/${PROJECT_ID}/channels/seo`,
    routePath: '/projects/:projectId/channels/seo',
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('SeoRoundHeader', () => {
  it('keeps the copy prompt button with an open round and has no import button', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const { user } = renderPage(buildRound())
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    await user.click(await screen.findByRole('button', { name: 'Copiar prompt' }))

    expect(writeText.mock.calls[0][0]).toContain(`/projects/${PROJECT_ID}`)
    expect(screen.queryByText(/importar/i)).not.toBeInTheDocument()
  })

  it('shows the pages read, the documents received and the agent note of the round', async () => {
    renderPage(buildRound())

    expect(await screen.findByText('53 páginas lidas')).toBeInTheDocument()
    expect(screen.getByText('2 documentos')).toBeInTheDocument()
    expect(screen.getByText('2 concorrentes')).toBeInTheDocument()
    expect(screen.getByText('21/11/2026')).toBeInTheDocument()
    expect(screen.getByText('Sem login nas contas.')).toBeInTheDocument()
  })

  it('lists the main competitors first and the overview tab before them', async () => {
    renderPage(buildRound())

    const tabs = await screen.findAllByRole('button', { pressed: undefined })
    const names = tabs.map((tab) => tab.textContent).filter((text) => ['Visão geral', 'Principal', 'Secundário'].includes(text ?? ''))

    expect(names).toEqual(['Visão geral', 'Principal', 'Secundário'])
  })

  it('shows the partial banner with the missing competitors and the command to complete', async () => {
    renderPage(buildRound({ status: SeoRoundStatus.PARTIAL, missing: ['Faltante'] }), [{ ...summary, status: SeoRoundStatus.PARTIAL }])

    expect(await screen.findByText(/Ainda faltam: Faltante/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copiar comando para completar' })).toBeInTheDocument()
  })
})
