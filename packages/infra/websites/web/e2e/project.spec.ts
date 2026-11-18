import { expect, test, type Page } from '@playwright/test'
import { API_URL, createProjectViaApi, saveDocumentViaApi } from '@e2e/helpers/project-api'
import { uniqueName } from '@e2e/helpers/unique-name'

const PROJECT_URL_PATTERN = /\/projects\/[\w-]+$/

async function returnToWindow(page: Page) {
  await page.evaluate(() => {
    window.dispatchEvent(new Event('focus'))
    document.dispatchEvent(new Event('visibilitychange', { bubbles: true }))
  })
}

async function fillProjectForm(page: Page, name: string) {
  await page.getByLabel('Nome').fill(name)
  await page.getByRole('radio', { name: 'Web + mobile', exact: true }).check({ force: true })
  await page.getByRole('radio', { name: 'Buscando espaço no mercado' }).check({ force: true })
  await page.getByLabel('Descrição curta').fill('Criado pelo fluxo e2e')
}

test.describe.configure({ mode: 'serial' })

test('abre sem projeto e cria o primeiro por "Novo projeto"', async ({ page }) => {
  const name = uniqueName('Primeiro')

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Nenhum projeto ainda' })).toBeVisible()

  await page.getByRole('main').getByRole('link', { name: 'Novo projeto' }).click()
  await expect(page.getByRole('heading', { name: 'Novo projeto' })).toBeVisible()
  await fillProjectForm(page, name)
  await expect(page.getByRole('radio', { name: 'Web + mobile', exact: true })).toBeChecked()
  await page.getByRole('button', { name: 'Criar projeto' }).click()

  await expect(page).toHaveURL(PROJECT_URL_PATTERN)
  await expect(page.getByRole('heading', { name, level: 1 })).toBeVisible()
  await expect(page.getByRole('link', { name })).toBeVisible()
})

test('mostra o cabeçalho e os dois cartões de prompt com código e endereço reais', async ({ page, request }) => {
  const project = await createProjectViaApi(request, { description: 'Descrição do cabeçalho' })

  await page.goto(`/projects/${project.id}`)

  await expect(page.getByRole('heading', { name: project.name, level: 1 })).toBeVisible()
  await expect(page.getByText('Descrição do cabeçalho')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Copiar prompt de leitura' })).toBeVisible()

  const collectionPrompt = page.locator('pre').first()
  await expect(collectionPrompt).toContainText(project.id)
  await expect(collectionPrompt).toContainText(`${API_URL}/projects/${project.id}/documents`)
  await expect(page.locator('pre').nth(1)).toContainText(`${API_URL}/projects/${project.id}`)

  await page.getByRole('button', { name: 'Copiar prompt de coleta' }).click()
  await expect(page.getByRole('button', { name: 'Copiado' })).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(project.id)
})

test('edita os dados do projeto por "Editar dados" e "Salvar"', async ({ page, request }) => {
  const project = await createProjectViaApi(request)
  const newName = uniqueName('Renomeado')

  await page.goto(`/projects/${project.id}`)
  await page.getByRole('button', { name: 'Editar dados' }).click()
  await page.getByLabel('Nome').fill(newName)
  await page.getByRole('button', { name: 'Salvar' }).click()

  await expect(page.getByRole('heading', { name: newName, level: 1 })).toBeVisible()
  await expect(page.getByRole('link', { name: newName })).toBeVisible()
})

test('grava documentos pela API e vê a lista ao voltar à janela, expande e regrava sem duplicar', async ({
  page,
  request,
}) => {
  const project = await createProjectViaApi(request)
  const title = uniqueName('Features')
  const document = { title, description: 'Resumo do documento', body: '### Primeira versão\n\nTexto inicial.' }

  await page.goto(`/projects/${project.id}`)
  await expect(page.getByText('Nenhum documento salvo ainda')).toBeVisible()

  expect((await saveDocumentViaApi(request, project.id, document)).wasCreated).toBe(true)
  await returnToWindow(page)

  const documentButton = page.getByRole('button', { name: new RegExp(title) })
  await expect(documentButton).toBeVisible()
  await expect(page.getByText('1 documento', { exact: true })).toBeVisible()

  await documentButton.click()
  await expect(documentButton).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('heading', { name: 'Primeira versão' })).toBeVisible()

  const rewrite = { ...document, body: '### Segunda versão\n\nTexto novo.' }
  expect((await saveDocumentViaApi(request, project.id, rewrite)).wasCreated).toBe(false)
  await returnToWindow(page)

  await expect(page.getByRole('heading', { name: 'Segunda versão' })).toBeVisible()
  await expect(page.getByText('1 documento', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: new RegExp(title) })).toHaveCount(1)
})

test('cria um segundo projeto, troca de projeto e mantém o projeto ao recarregar', async ({ page, request }) => {
  const first = await createProjectViaApi(request)
  const secondName = uniqueName('Segundo')

  await page.goto(`/projects/${first.id}`)
  await page.getByRole('complementary').getByRole('link', { name: 'Novo projeto' }).click()
  await fillProjectForm(page, secondName)
  await page.getByRole('button', { name: 'Criar projeto' }).click()
  await expect(page.getByRole('heading', { name: secondName, level: 1 })).toBeVisible()

  await page.getByRole('complementary').getByRole('link', { name: first.name }).click()
  await expect(page.getByRole('heading', { name: first.name, level: 1 })).toBeVisible()

  await page.reload()
  await expect(page).toHaveURL(`/projects/${first.id}`)
  await expect(page.getByRole('heading', { name: first.name, level: 1 })).toBeVisible()
})
