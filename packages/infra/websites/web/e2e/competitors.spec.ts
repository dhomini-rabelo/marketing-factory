import { expect, test } from '@playwright/test'
import {
  createProjectViaApi,
  saveChannelViaApi,
  saveCompetitorsViaApi,
  type ChannelAnalysisInput,
} from '@e2e/helpers/project-api'
import { chooseProjectInSelect, returnToWindow } from '@e2e/helpers/window'

const CHANNEL_ANALYSIS: ChannelAnalysisInput = {
  score: 8,
  rationale: 'Canal forte para o segmento',
  bestContent: { type: 'Tutorial em vídeo', evidence: '20 mil visualizações', basis: 'fact' },
  findings: [
    { competitor: 'Promob', aspect: 'format', kind: 'hypothesis', statement: 'Posta tutoriais' },
    { competitor: 'Mobilplan', aspect: 'format', kind: 'hypothesis', statement: 'Posta comparativos' },
    { competitor: 'Marcenaria Fácil', aspect: 'format', kind: 'hypothesis', statement: 'Posta sorteios' },
  ],
}

const LIST_ITEM_NAME = /Lista de concorrentes/
const PENDING_PROMPT_LABEL = 'Pesquisa inicial dos canais (bloqueado)'

async function createProjectWithCompetitors(request: Parameters<typeof createProjectViaApi>[0]) {
  const project = await createProjectViaApi(request)
  await saveCompetitorsViaApi(request, project.id, [
    { name: 'Marcenaria Fácil', role: 'secondary' },
    { name: 'Mobilplan', role: 'secondary' },
    { name: 'Promob', role: 'main' },
  ])
  return project
}

test.describe.configure({ mode: 'serial' })

test('mostra a lista gravada pela API aguardando aprovação, com o prompt 2 bloqueado', async ({ page, request }) => {
  const project = await createProjectViaApi(request)
  await page.goto(`/projects/${project.id}/competitors`)
  const sidebar = page.getByRole('complementary')

  await expect(page.getByRole('heading', { name: 'Sem lista de concorrentes' })).toBeVisible()
  await expect(sidebar.getByRole('link', { name: LIST_ITEM_NAME })).toContainText('sem lista')
  await expect(page.getByRole('button', { name: 'Aprovar lista' })).toBeDisabled()
  await expect(page.getByText('Nenhum concorrente definido ainda.')).toBeVisible()
  await expect(page.getByText(/Não há lista de concorrentes para aprovar/)).toBeVisible()

  await saveCompetitorsViaApi(request, project.id, [
    { name: 'Marcenaria Fácil', role: 'secondary' },
    { name: 'Mobilplan', role: 'secondary' },
    { name: 'Promob', role: 'main' },
  ])
  await returnToWindow(page)

  await expect(page.getByRole('heading', { name: 'Lista aguardando sua aprovação' })).toBeVisible()
  await expect(sidebar.getByRole('link', { name: LIST_ITEM_NAME })).toContainText('aguardando aprovação')
  await expect(sidebar.getByText('Libera depois que você aprovar a lista de concorrentes.')).toBeVisible()
  await expect(page.getByText('3 identificados')).toBeVisible()

  const names = await page.getByRole('article').evaluateAll((cards) =>
    cards.map((card) => card.getAttribute('aria-label')),
  )
  expect(names).toEqual(['Promob', 'Marcenaria Fácil', 'Mobilplan'])
  await expect(page.getByRole('article', { name: 'Promob' })).toContainText('principal')
  await expect(page.getByRole('article', { name: 'Promob' })).toContainText('Foco de Promob')

  await expect(page.getByRole('button', { name: 'Copiar prompt de concorrentes' })).toBeEnabled()
  await expect(page.getByRole('region', { name: PENDING_PROMPT_LABEL })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Aprove a lista para liberar' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Copiar prompt da pesquisa inicial' })).toHaveCount(0)
})

test('marca um concorrente, aprova a lista, vê o prompt 2 liberado e o canal sem o marcado, e reabre', async ({
  page,
  request,
}) => {
  const project = await createProjectWithCompetitors(request)
  await saveChannelViaApi(request, project.id, 'youtube', CHANNEL_ANALYSIS)
  await page.goto(`/projects/${project.id}/competitors`)
  const sidebar = page.getByRole('complementary')
  const markedCard = page.getByRole('article', { name: 'Marcenaria Fácil' })

  await markedCard.getByRole('button', { name: 'Não é concorrente' }).click()
  await expect(markedCard).toHaveAttribute('data-incorrect', 'true')
  await expect(markedCard.getByRole('button', { name: 'Desfazer' })).toBeVisible()
  await expect(page.getByText('1 marcado “Não é concorrente”')).toBeVisible()
  await expect(page.getByText('2 na análise · 1 principais, 1 secundários')).toBeVisible()
  expect(await page.getByRole('article').last().getAttribute('aria-label')).toBe('Marcenaria Fácil')
  await expect(sidebar.getByRole('link', { name: LIST_ITEM_NAME })).toContainText('aguardando aprovação')

  await page.getByRole('button', { name: 'Aprovar lista' }).click()
  await expect(page.getByRole('heading', { name: 'Lista aprovada' })).toBeVisible()
  await expect(sidebar.getByRole('link', { name: LIST_ITEM_NAME })).toContainText('aprovada')
  await expect(sidebar.getByText('Libera depois que você aprovar a lista de concorrentes.')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Copiar prompt da pesquisa inicial' })).toBeEnabled()
  await expect(page.getByRole('region', { name: PENDING_PROMPT_LABEL })).toHaveCount(0)
  await page.getByRole('button', { name: 'Copiar prompt da pesquisa inicial' }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(project.id)

  await sidebar.getByRole('link', { name: /8\s*YouTube/ }).click()
  await expect(page.getByRole('heading', { name: 'YouTube', level: 1 })).toBeVisible()
  await expect(page.getByText('Posta tutoriais')).toBeVisible()
  await expect(page.getByText('Posta comparativos')).toBeVisible()
  await expect(page.getByText('Posta sorteios')).toHaveCount(0)
  await expect(page.getByText('2 de 2 concorrentes com achado')).toBeVisible()

  await sidebar.getByRole('link', { name: LIST_ITEM_NAME }).click()
  await page.getByRole('button', { name: 'Reabrir lista' }).click()
  await expect(page.getByRole('heading', { name: 'Lista aguardando sua aprovação' })).toBeVisible()
  await expect(sidebar.getByRole('link', { name: LIST_ITEM_NAME })).toContainText('aguardando aprovação')
  await expect(page.getByRole('region', { name: PENDING_PROMPT_LABEL })).toBeVisible()

  await markedCard.getByRole('button', { name: 'Desfazer' }).click()
  await expect(markedCard).toHaveAttribute('data-incorrect', 'false')
  await expect(sidebar.getByRole('link', { name: LIST_ITEM_NAME })).toContainText('aguardando aprovação')
})

test('regrava a lista pela API, volta a aguardando aprovação e mantém a marca do fundador', async ({
  page,
  request,
}) => {
  const project = await createProjectWithCompetitors(request)
  await page.goto(`/projects/${project.id}/competitors`)
  const sidebar = page.getByRole('complementary')

  await page.getByRole('article', { name: 'Marcenaria Fácil' }).getByRole('button', { name: 'Não é concorrente' }).click()
  await expect(page.getByRole('article', { name: 'Marcenaria Fácil' })).toHaveAttribute('data-incorrect', 'true')
  await page.getByRole('button', { name: 'Aprovar lista' }).click()
  await expect(sidebar.getByRole('link', { name: LIST_ITEM_NAME })).toContainText('aprovada')

  const rewrite = await saveCompetitorsViaApi(request, project.id, [
    { name: 'Promob', role: 'main', marketFocus: 'Foco novo do Promob' },
    { name: 'Marcenaria Fácil', role: 'secondary' },
    { name: 'Gestão de Oficina', role: 'secondary' },
  ])
  expect(rewrite.wasCreated).toBe(false)
  await returnToWindow(page)

  await expect(page.getByRole('heading', { name: 'Lista aguardando sua aprovação' })).toBeVisible()
  await expect(sidebar.getByRole('link', { name: LIST_ITEM_NAME })).toContainText('aguardando aprovação')
  await expect(page.getByRole('region', { name: PENDING_PROMPT_LABEL })).toBeVisible()
  await expect(page.getByRole('article', { name: 'Promob' })).toContainText('Foco novo do Promob')
  await expect(page.getByRole('article', { name: 'Gestão de Oficina' })).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(3)
  await expect(page.getByRole('article', { name: 'Marcenaria Fácil' })).toHaveAttribute('data-incorrect', 'true')
  await expect(page.getByRole('article', { name: 'Mobilplan' })).toHaveCount(0)
})

test('troca de projeto pelo select e mostra a situação da lista de cada projeto', async ({ page, request }) => {
  const withList = await createProjectWithCompetitors(request)
  const withoutList = await createProjectViaApi(request)
  await page.goto(`/projects/${withList.id}/competitors`)
  const sidebar = page.getByRole('complementary')
  await expect(sidebar.getByRole('link', { name: LIST_ITEM_NAME })).toContainText('aguardando aprovação')

  await chooseProjectInSelect(page, withoutList.name)
  await expect(page).toHaveURL(`/projects/${withoutList.id}`)
  await expect(page.getByRole('heading', { name: withoutList.name, level: 1 })).toBeVisible()
  await expect(sidebar.getByRole('link', { name: LIST_ITEM_NAME })).toContainText('sem lista')
  await expect(sidebar.getByText('Libera depois que você aprovar a lista de concorrentes.')).toBeVisible()

  await sidebar.getByRole('link', { name: LIST_ITEM_NAME }).click()
  await expect(page).toHaveURL(`/projects/${withoutList.id}/competitors`)
  await expect(page.getByRole('heading', { name: 'Sem lista de concorrentes' })).toBeVisible()

  await chooseProjectInSelect(page, withList.name)
  await expect(page).toHaveURL(`/projects/${withList.id}`)
  await expect(sidebar.getByRole('link', { name: LIST_ITEM_NAME })).toContainText('aguardando aprovação')
})
