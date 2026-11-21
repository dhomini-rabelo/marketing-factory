import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Channel, type ChannelSummary } from '@/api/models/channel-analysis'
import { CompetitorApproval, type CompetitorsList } from '@/api/models/competitor'
import { ProjectPhase, ProjectPlatform, type Project } from '@/api/models/project'
import { API_ROUTES } from '@/api/routes'
import { mockApi, type MockRoutes } from '@/__tests__/utils/mock-api'
import { renderWithProviders } from '@/__tests__/utils/render-with-providers'
import { Sidebar } from '@/layout/components/sidebar/sidebar'

const PROJECT_ID = 'p1'
const SEO_PATH = `/projects/${PROJECT_ID}/channels/seo`

const project: Project = {
  id: PROJECT_ID,
  name: 'Zeta',
  platform: ProjectPlatform.WEB,
  phase: ProjectPhase.NO_CUSTOMERS,
  description: 'Descrição',
  createdAt: '2026-03-01T12:00:00.000Z',
  updatedAt: '2026-03-01T12:00:00.000Z',
}

const approvedList: CompetitorsList = { approval: CompetitorApproval.APPROVED, competitors: [] }
const pendingList: CompetitorsList = { approval: CompetitorApproval.PENDING, competitors: [] }

const channel: ChannelSummary = {
  channel: Channel.LINKEDIN,
  partial: false,
  collected: true,
  score: 8,
  collectedAt: '2026-03-03T12:00:00.000Z',
}

function buildRoutes(list: CompetitorsList, channelsReply: MockRoutes[string]): MockRoutes {
  return {
    [`GET ${API_ROUTES.projects.list}`]: { body: { projects: [project] } },
    [`GET ${API_ROUTES.competitors.list(PROJECT_ID)}`]: { body: list },
    [`GET ${API_ROUTES.channels.list(PROJECT_ID)}`]: channelsReply,
  }
}

function renderSidebar(routes: MockRoutes) {
  mockApi(routes)
  return renderWithProviders(<Sidebar />, {
    initialEntry: `/projects/${PROJECT_ID}`,
    routePath: '/projects/:projectId/*',
  })
}

describe('Sidebar SEO item', () => {
  it('shows "SEO e blog" with no score and opens the new screen when clicked', async () => {
    const { user } = renderSidebar(buildRoutes(approvedList, { body: { channels: [channel] } }))

    const item = await screen.findByRole('link', { name: 'SEO e blog' })
    expect(item).toHaveAttribute('href', SEO_PATH)
    expect(item).not.toHaveAttribute('aria-current')
    expect(within(item).queryByText(/^\d+$/)).not.toBeInTheDocument()
    expect(item.textContent).toBe('SEO e blog')

    await user.click(item)

    expect(screen.getByRole('link', { name: 'SEO e blog' })).toHaveAttribute('aria-current', 'page')
  })

  it('shows the item even when the channels list is empty', async () => {
    renderSidebar(buildRoutes(approvedList, { body: { channels: [] } }))

    expect(await screen.findByRole('link', { name: 'SEO e blog' })).toHaveAttribute('href', SEO_PATH)
  })

  it('shows the item even when the channels list fails to load', async () => {
    renderSidebar(
      buildRoutes(approvedList, {
        status: 500,
        body: { error: { code: 'internal', message: 'Falhou' } },
      }),
    )

    expect(await screen.findByRole('link', { name: 'SEO e blog' })).toHaveAttribute('href', SEO_PATH)
  })

  it('shows the item while the channels list is still loading', async () => {
    renderSidebar(buildRoutes(approvedList, () => new Promise<never>(() => undefined)))

    expect(await screen.findByRole('link', { name: 'SEO e blog' })).toHaveAttribute('href', SEO_PATH)
  })

  it('dims the item together with the channels while the competitors list is pending', async () => {
    renderSidebar(buildRoutes(pendingList, { body: { channels: [channel] } }))

    const item = await screen.findByRole('link', { name: 'SEO e blog' })
    await screen.findByText(/Libera depois que você aprovar/)

    expect(item.className).toContain('opacity-60')
  })
})
