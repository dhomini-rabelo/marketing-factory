import { expect, test } from '@playwright/test'
import { SEO_DEMO_COMPETITORS } from '../../../http/scripts/seed-demo-seo'
import {
  approveCompetitorsViaApi,
  createProjectViaApi,
  saveCompetitorsViaApi,
  saveSeoRoundViaApi,
} from '@e2e/helpers/project-api'
import { returnToWindow } from '@e2e/helpers/window'

const COMPETITOR_TAB_NAME = 'Fireflies.ai'

test('copia o prompt, o agente grava a rodada pela API e a Visão geral, uma aba e uma janela de detalhe abrem', async ({
  page,
  request,
}) => {
  const project = await createProjectViaApi(request)
  await saveCompetitorsViaApi(
    request,
    project.id,
    SEO_DEMO_COMPETITORS.map(({ name, role }) => ({ name, role })),
  )
  await approveCompetitorsViaApi(request, project.id)

  await page.goto(`/projects/${project.id}/channels/seo`)
  await expect(page.getByRole('heading', { name: 'SEO e blog', level: 1 })).toBeVisible()
  await expect(page.getByText('Nenhuma rodada de SEO gravada ainda.')).toBeVisible()
  await page.getByRole('button', { name: 'Copiar prompt' }).click()
  const prompt = await page.evaluate(() => navigator.clipboard.readText())
  expect(prompt).toContain(`/projects/${project.id}/seo/rounds`)

  await saveSeoRoundViaApi(project.id)
  await page.reload()
  await returnToWindow(page)

  const tabs = page.getByRole('navigation', { name: 'Visão geral ou um concorrente' })
  await expect(tabs.getByRole('button', { name: 'Visão geral' })).toHaveAttribute('aria-pressed', 'true')
  await expect(tabs.getByRole('button')).toHaveCount(SEO_DEMO_COMPETITORS.length + 1)
  await expect(page.getByRole('heading', { name: 'Comparativo dos concorrentes', level: 3 })).toBeVisible()

  await page.getByRole('button', { name: /^ver todas/ }).first().click()
  const comparisonsDialog = page.getByRole('dialog', { name: /^Comparações de / })
  await expect(comparisonsDialog).toBeVisible()
  await comparisonsDialog.getByRole('button', { name: 'Fechar' }).click()
  await expect(comparisonsDialog).toHaveCount(0)

  await tabs.getByRole('button', { name: COMPETITOR_TAB_NAME }).click()
  await expect(tabs.getByRole('button', { name: COMPETITOR_TAB_NAME })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'voltar à visão geral' })).toBeVisible()

  await page.getByRole('button', { name: /^\d+ exemplos?$/ }).first().click()
  const examplesDialog = page.getByRole('dialog', { name: new RegExp(`^Exemplos de .* em ${COMPETITOR_TAB_NAME.replace('.', '\\.')}$`) })
  await expect(examplesDialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(examplesDialog).toHaveCount(0)
})
