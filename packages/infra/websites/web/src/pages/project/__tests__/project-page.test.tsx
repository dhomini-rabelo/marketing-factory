import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProjectPhase, ProjectPlatform, type Project } from '@/api/models/project'
import { API_ROUTES } from '@/api/routes'
import { mockApi, type MockRoutes } from '@/__tests__/utils/mock-api'
import { renderWithProviders } from '@/__tests__/utils/render-with-providers'
import { ProjectPage } from '@/pages/project/page'

const PROJECT_ID = 'p1'

const project: Project = {
  id: PROJECT_ID,
  name: 'Insumo',
  platform: ProjectPlatform.WEB,
  phase: ProjectPhase.NO_CUSTOMERS,
  description: 'Fábrica de marketing',
  createdAt: '2026-03-01T12:00:00.000Z',
  updatedAt: '2026-03-01T12:00:00.000Z',
}

const documents = [
  {
    slug: 'visao-geral',
    title: 'Visão geral',
    description: 'O que o produto faz',
    updatedAt: '2026-03-10T12:00:00.000Z',
  },
  {
    slug: 'publico',
    title: 'Público-alvo',
    description: 'Quem compra',
    updatedAt: '2026-03-11T12:00:00.000Z',
  },
]

const projectRoute = `GET ${API_ROUTES.projects.detail(PROJECT_ID)}`
const documentsRoute = `GET ${API_ROUTES.documents.list(PROJECT_ID)}`
const documentRoute = (slug: string) => `GET ${API_ROUTES.documents.detail(PROJECT_ID, slug)}`

const serverError = { status: 500, body: { error: { code: 'internal', message: 'Falhou' } } }
const neverReplies = () => new Promise<never>(() => undefined)

function renderPage(routes: MockRoutes) {
  const api = mockApi(routes)
  const view = renderWithProviders(<ProjectPage />, {
    initialEntry: `/projects/${PROJECT_ID}`,
    routePath: '/projects/:projectId',
  })
  return { ...view, ...api }
}

describe('ProjectPage', () => {
  it('shows the loading message of each section while the data is on its way', () => {
    renderPage({ [projectRoute]: neverReplies, [documentsRoute]: neverReplies })

    expect(screen.getByRole('status', { name: 'Documentos' })).toHaveTextContent('Carregando documentos...')
    expect(screen.getByText('Carregando projeto...')).toBeInTheDocument()
  })

  it('shows the project data and the documents when both requests work', async () => {
    renderPage({
      [projectRoute]: { body: project },
      [documentsRoute]: { body: { documents } },
    })

    expect(await screen.findByRole('heading', { name: 'Insumo', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Fábrica de marketing')).toBeInTheDocument()
    expect(await screen.findByText('2 documentos')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Visão geral/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Público-alvo/ })).toBeInTheDocument()
  })

  it('shows an error with a retry button when the project fails, and recovers on retry', async () => {
    let attempts = 0
    const { user } = renderPage({
      [projectRoute]: () => (++attempts === 1 ? serverError : { body: project }),
      [documentsRoute]: { body: { documents: [] } },
    })

    const alert = await screen.findByRole('alert')
    expect(within(alert).getByText('Não foi possível carregar o projeto.')).toBeInTheDocument()

    await user.click(within(alert).getByRole('button', { name: 'Tentar de novo' }))

    expect(await screen.findByRole('heading', { name: 'Insumo', level: 1 })).toBeInTheDocument()
    expect(screen.queryByText('Não foi possível carregar o projeto.')).not.toBeInTheDocument()
  })

  it('says the project was not found when the API answers 404', async () => {
    renderPage({
      [projectRoute]: { status: 404, body: { error: { code: 'not_found', message: 'Sem projeto' } } },
      [documentsRoute]: { body: { documents: [] } },
    })

    expect(await screen.findByRole('heading', { name: 'Projeto não encontrado' })).toBeInTheDocument()
    expect(screen.getByText('Escolha um projeto na barra lateral ou crie um novo.')).toBeInTheDocument()
    expect(screen.queryByText('Não foi possível carregar o projeto.')).not.toBeInTheDocument()
  })

  it('shows an error with a retry button when the documents fail', async () => {
    const { requestsTo } = renderPage({ [projectRoute]: { body: project }, [documentsRoute]: serverError })

    expect(await screen.findByText('Não foi possível carregar os documentos.')).toBeInTheDocument()
    expect(requestsTo('GET', API_ROUTES.documents.list(PROJECT_ID))).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Insumo', level: 1 })).toBeInTheDocument()
  })

  it('says there are no documents yet when the list is empty', async () => {
    renderPage({ [projectRoute]: { body: project }, [documentsRoute]: { body: { documents: [] } } })

    expect(await screen.findByText('Nenhum documento salvo ainda')).toBeInTheDocument()
  })

  it('keeps the rest of the list when one document fails to open', async () => {
    const { user } = renderPage({
      [projectRoute]: { body: project },
      [documentsRoute]: { body: { documents } },
      [documentRoute('visao-geral')]: serverError,
      [documentRoute('publico')]: {
        body: { ...documents[1], body: 'Compradores de insumo', createdAt: '2026-03-01T12:00:00.000Z' },
      },
    })

    await user.click(await screen.findByRole('button', { name: /Visão geral/ }))
    expect(await screen.findByText('Não foi possível abrir o documento.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Público-alvo/ }))

    expect(await screen.findByText('Compradores de insumo')).toBeInTheDocument()
    expect(screen.getByText('Não foi possível abrir o documento.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Visão geral/ })).toBeInTheDocument()
    expect(screen.getByText('2 documentos')).toBeInTheDocument()
  })

  it('goes back to the previous title when editing is cancelled', async () => {
    const { user } = renderPage({
      [projectRoute]: { body: project },
      [documentsRoute]: { body: { documents: [] } },
    })

    await user.click(await screen.findByRole('button', { name: 'Editar dados' }))
    const nameField = screen.getByLabelText('Nome')
    await user.clear(nameField)
    await user.type(nameField, 'Outro nome')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.getByRole('heading', { name: 'Insumo', level: 1 })).toBeInTheDocument()
    expect(screen.queryByText('Outro nome')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Nome')).not.toBeInTheDocument()
  })
})
