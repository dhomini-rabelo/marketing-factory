import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CompetitorApproval, type CompetitorsList } from '@/api/models/competitor'
import { API_ROUTES } from '@/api/routes'
import { mockApi } from '@/__tests__/utils/mock-api'
import { renderWithProviders } from '@/__tests__/utils/render-with-providers'
import { SeoPage } from '@/pages/seo/page'

const PROJECT_ID = 'p1'

const roundsRoute = `GET ${API_ROUTES.seo.rounds(PROJECT_ID)}`
const competitorsRoute = `GET ${API_ROUTES.competitors.list(PROJECT_ID)}`

function buildList(approval: CompetitorApproval): CompetitorsList {
  return { approval, competitors: [] }
}

function renderPage(approval: CompetitorApproval) {
  mockApi({
    [roundsRoute]: { body: { rounds: [] } },
    [competitorsRoute]: { body: buildList(approval) },
  })
  return renderWithProviders(<SeoPage />, {
    initialEntry: `/projects/${PROJECT_ID}/channels/seo`,
    routePath: '/projects/:projectId/channels/seo',
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('SeoPage without a round', () => {
  it('shows the collection prompt with a copy button and the next steps when the list is approved', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const { user } = renderPage(CompetitorApproval.APPROVED)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    await user.click(await screen.findByRole('button', { name: 'Copiar prompt' }))

    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText.mock.calls[0][0]).toContain(`/projects/${PROJECT_ID}`)
    expect(screen.getByText('Recarregue esta tela para ver a rodada.')).toBeInTheDocument()
  })

  it('locks the prompt and links to the competitors page while the list is not approved', async () => {
    renderPage(CompetitorApproval.PENDING)

    const link = await screen.findByRole('link', { name: 'Ir para Concorrentes' })

    expect(link).toHaveAttribute('href', `/projects/${PROJECT_ID}/competitors`)
    expect(screen.getByRole('button', { name: 'Aprove a lista para liberar' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Copiar prompt' })).not.toBeInTheDocument()
  })
})
