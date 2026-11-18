import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { API_ROUTES } from '@/api/routes'
import { mockApi } from '@/__tests__/utils/mock-api'
import { renderWithProviders } from '@/__tests__/utils/render-with-providers'
import { DocumentItem } from '@/pages/project/components/document-item/document-item'

const PROJECT_ID = 'p1'
const SLUG = 'visao-geral'
const DETAIL_PATH = API_ROUTES.documents.detail(PROJECT_ID, SLUG)

const summary = {
  slug: SLUG,
  title: 'Visão geral',
  description: 'O que o produto faz',
  updatedAt: '2026-03-10T12:00:00.000Z',
}

function renderItem(markdown: string) {
  const api = mockApi({
    [`GET ${DETAIL_PATH}`]: {
      body: {
        ...summary,
        body: markdown,
        createdAt: '2026-03-01T12:00:00.000Z',
      },
    },
  })
  const view = renderWithProviders(
    <ul>
      <DocumentItem projectId={PROJECT_ID} document={summary} />
    </ul>,
  )
  return { ...view, ...api }
}

describe('DocumentItem', () => {
  it('does not fetch the content until the item is opened', async () => {
    const { user, requestsTo } = renderItem('Texto do documento')

    expect(screen.getByRole('button', { name: /Visão geral/ })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Texto do documento')).not.toBeInTheDocument()
    expect(requestsTo('GET', DETAIL_PATH)).toHaveLength(0)

    await user.click(screen.getByRole('button', { name: /Visão geral/ }))

    expect(await screen.findByText('Texto do documento')).toBeInTheDocument()
    expect(requestsTo('GET', DETAIL_PATH)).toHaveLength(1)
    expect(screen.getByRole('button', { name: /Visão geral/ })).toHaveAttribute('aria-expanded', 'true')
  })

  it('shows raw HTML and script tags as plain text, never as elements', async () => {
    const { user, container } = renderItem('Antes <b>negrito</b> <script>alert(1)</script> depois')

    await user.click(screen.getByRole('button', { name: /Visão geral/ }))

    expect(await screen.findByText(/Antes/)).toBeInTheDocument()
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('b')).toBeNull()
  })

  it('opens external links in a new tab', async () => {
    const { user } = renderItem('Veja [o site](https://exemplo.com/pagina) agora')

    await user.click(screen.getByRole('button', { name: /Visão geral/ }))

    const link = await screen.findByRole('link', { name: 'o site' })
    expect(link).toHaveAttribute('href', 'https://exemplo.com/pagina')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('formats the markdown, shows the sheet and closes on a second click', async () => {
    const { user } = renderItem('### Título interno\n\n- primeiro\n- segundo')

    await user.click(screen.getByRole('button', { name: /Visão geral/ }))

    expect(await screen.findByRole('heading', { name: 'Título interno', level: 3 })).toBeInTheDocument()
    expect(screen.getByText('primeiro')).toBeInTheDocument()
    expect(screen.getByText('segundo')).toBeInTheDocument()
    expect(screen.getByText('Criado em')).toBeInTheDocument()
    expect(screen.getByText('Atualizado em')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Visão geral/ }))

    expect(screen.queryByRole('heading', { name: 'Título interno' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Visão geral/ })).toHaveAttribute('aria-expanded', 'false')
  })
})
