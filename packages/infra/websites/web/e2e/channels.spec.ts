import { expect, test, type Page } from '@playwright/test'
import {
  createProjectViaApi,
  listChannelsViaApi,
  saveChannelViaApi,
  saveCompetitorsViaApi,
  type ChannelAnalysisInput,
  type ChannelFindingInput,
  type CompetitorInput,
} from '@e2e/helpers/project-api'
import { chooseProjectInSelect, returnToWindow } from '@e2e/helpers/window'

const CHANNEL_LINK_SELECTOR = 'a[href*="/channels/"]'
const PROJECT_URL_PATTERN = /\/projects\/[\w-]+$/
const ASPECT_BLOCKS: { key: ChannelFindingInput['aspect']; label: string }[] = [
  { key: 'format', label: 'Formato' },
  { key: 'topic', label: 'Assunto' },
  { key: 'frequency', label: 'Frequência' },
  { key: 'performance', label: 'Desempenho' },
  { key: 'cta', label: 'Chamada para ação' },
]
const ROLE_KEYS: CompetitorInput['role'][] = ['main', 'secondary']

function buildAnalysis(overrides: Partial<ChannelAnalysisInput> = {}): ChannelAnalysisInput {
  return {
    score: 7,
    rationale: 'Canal com boa tração entre os concorrentes',
    bestContent: { type: 'Vídeo curto', evidence: '10 mil visualizações por vídeo', basis: 'fact' },
    findings: [
      {
        competitor: 'Promob',
        aspect: 'format',
        kind: 'fact',
        statement: 'Publica vídeos curtos',
        url: 'https://promob.example/videos',
        excerpt: 'Três vídeos por semana',
        tool: 'browser',
      },
      { competitor: 'Mobilplan', aspect: 'topic', kind: 'hypothesis', statement: 'Foca em dicas de uso' },
      { competitor: 'Fora da Lista', aspect: 'cta', kind: 'hypothesis', statement: 'Chama para teste grátis' },
    ],
    ...overrides,
  }
}

async function sidebarChannelHrefs(page: Page): Promise<string[]> {
  const links = page.getByRole('complementary').locator(CHANNEL_LINK_SELECTOR)
  return links.evaluateAll((elements) => elements.map((element) => element.getAttribute('href') ?? ''))
}

function channelHref(projectId: string, channel: string): string {
  return `/projects/${projectId}/channels/${channel}`
}

test.describe.configure({ mode: 'serial' })

test('mostra os nove canais sem coleta na ordem e com as chaves da API', async ({ page, request }) => {
  const project = await createProjectViaApi(request)
  const apiChannels = await listChannelsViaApi(request, project.id)

  await page.goto(`/projects/${project.id}`)
  const sidebar = page.getByRole('complementary')
  await expect(sidebar.getByRole('heading', { name: 'Pesquisa inicial' })).toBeVisible()
  await expect(sidebar.locator(CHANNEL_LINK_SELECTOR)).toHaveCount(9)

  expect(apiChannels).toHaveLength(9)
  expect(apiChannels.every((summary) => !summary.collected && summary.score === null)).toBe(true)
  expect(await sidebarChannelHrefs(page)).toEqual(apiChannels.map((summary) => channelHref(project.id, summary.channel)))
  await expect(sidebar.getByText('sem coleta', { exact: true })).toHaveCount(9)
  await expect(sidebar.getByText('parcial sem login', { exact: true })).toHaveCount(4)

  await sidebar.getByRole('link', { name: /SEO e blog/ }).click()
  await expect(page.getByRole('heading', { name: 'SEO e blog', level: 1 })).toBeVisible()
  await expect(page.getByText('Este canal ainda não foi coletado.')).toBeVisible()
})

test('grava cinco canais pela API e mostra a barra por nota, com a marca parcial e o canal aberto', async ({
  page,
  request,
}) => {
  const project = await createProjectViaApi(request)
  await saveCompetitorsViaApi(request, project.id, [
    { name: 'Promob', role: 'main' },
    { name: 'Mobilplan', role: 'secondary' },
  ])
  const scores: [string, number][] = [
    ['youtube', 5],
    ['seo', 9],
    ['reddit', 3],
    ['x', 8],
    ['linkedin', 7],
  ]

  await page.goto(`/projects/${project.id}`)
  const sidebar = page.getByRole('complementary')
  await expect(sidebar.getByText('sem coleta', { exact: true })).toHaveCount(9)
  for (const [channel, score] of scores) {
    await saveChannelViaApi(request, project.id, channel, buildAnalysis({ score, rationale: `Motivo da nota ${score}` }))
  }
  await returnToWindow(page)

  const apiChannels = await listChannelsViaApi(request, project.id)
  const expectedKeys = ['seo', 'x', 'linkedin', 'youtube', 'reddit', 'site-pricing', 'instagram', 'tiktok', 'ads']
  await expect.poll(() => sidebarChannelHrefs(page)).toEqual(expectedKeys.map((key) => channelHref(project.id, key)))
  expect(apiChannels.map((summary) => summary.channel)).toEqual(expectedKeys)

  await expect(sidebar.getByRole('link', { name: /9\s*SEO e blog/ })).toBeVisible()
  await expect(sidebar.getByRole('link', { name: /8\s*X\s*parcial sem login/ })).toBeVisible()
  await expect(sidebar.getByRole('link', { name: /3\s*Reddit\s*parcial sem login/ })).toBeVisible()
  await expect(sidebar.getByRole('link', { name: /TikTok\s*parcial sem login\s*sem coleta/ })).toBeVisible()
  await expect(sidebar.getByRole('link', { name: /Instagram\s*sem coleta/ })).toBeVisible()
  await expect(sidebar.getByText('sem coleta', { exact: true })).toHaveCount(4)

  await sidebar.getByRole('link', { name: /9\s*SEO e blog/ }).click()
  await expect(page).toHaveURL(channelHref(project.id, 'seo'))
  await expect(page.getByRole('heading', { name: 'SEO e blog', level: 1 })).toBeVisible()
  await expect(page.getByLabel('Nota 9 de 10')).toBeVisible()
  await expect(page.getByText('Motivo da nota 9')).toBeVisible()
  await expect(page.getByRole('region', { name: 'O que performa melhor' })).toContainText('Vídeo curto')

  const headings = await page.getByRole('heading', { level: 3 }).allTextContents()
  expect(headings).toEqual(['Formato', 'Assunto', 'Chamada para ação'])
  await expect(page.getByRole('region', { name: 'Formato' })).toContainText('Promob')
  await expect(page.getByRole('region', { name: 'Formato' })).toContainText('Principal')
  await expect(page.getByRole('region', { name: 'Assunto' })).toContainText('Mobilplan')
  await expect(page.getByRole('region', { name: 'Chamada para ação' })).toContainText('Fora da Lista')
  await expect(page.getByText('2 de 2 concorrentes com achado')).toBeVisible()

  const sourceLink = page.getByRole('link', { name: 'https://promob.example/videos' })
  await expect(sourceLink).toHaveAttribute('target', '_blank')
  await expect(sourceLink).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(page.getByText('Três vídeos por semana')).toBeVisible()

  await sidebar.getByRole('link', { name: /8\s*X\s*parcial sem login/ }).click()
  await expect(page.getByRole('note')).toContainText('Parcial sem login')
})

test('grava um achado por aspecto pela API e mostra os cinco blocos na ordem fixa', async ({ page, request }) => {
  const project = await createProjectViaApi(request)
  await saveCompetitorsViaApi(request, project.id, [
    { name: 'Promob', role: 'main' },
    { name: 'Mobilplan', role: 'secondary' },
  ])
  const findings = ASPECT_BLOCKS.map(({ key, label }, index) => ({
    competitor: index % 2 === 0 ? 'Promob' : 'Mobilplan',
    aspect: key,
    kind: 'hypothesis' as const,
    statement: `Achado de ${label}`,
  }))
  await saveChannelViaApi(request, project.id, 'seo', buildAnalysis({ findings: [...findings].reverse() }))

  await page.goto(channelHref(project.id, 'seo'))
  await expect(page.getByRole('heading', { name: 'SEO e blog', level: 1 })).toBeVisible()

  await expect(page.getByRole('heading', { level: 3 })).toHaveText(ASPECT_BLOCKS.map(({ label }) => label))
  for (const { label } of ASPECT_BLOCKS) {
    await expect(page.getByRole('region', { name: label })).toContainText(`Achado de ${label}`)
  }
})

test('os prompts copiados trazem as chaves de canal, de aspecto e de papel que a API aceita', async ({
  page,
  request,
}) => {
  const project = await createProjectViaApi(request)
  const competitors: CompetitorInput[] = ROLE_KEYS.map((role) => ({ name: `Concorrente ${role}`, role }))
  await saveCompetitorsViaApi(request, project.id, competitors)
  const channelKeys = (await listChannelsViaApi(request, project.id)).map((summary) => summary.channel)
  expect(channelKeys).toHaveLength(9)
  for (const [index, { key }] of ASPECT_BLOCKS.entries()) {
    const channel = channelKeys[index]
    const finding: ChannelFindingInput = {
      competitor: competitors[index % competitors.length].name,
      aspect: key,
      kind: 'hypothesis',
      statement: `Achado ${key}`,
    }
    await saveChannelViaApi(request, project.id, channel, buildAnalysis({ findings: [finding] }))
  }

  await page.goto(`/projects/${project.id}/competitors`)
  await expect(page.getByRole('heading', { name: 'Lista aguardando sua aprovação' })).toBeVisible()
  await page.getByRole('button', { name: 'Copiar prompt de concorrentes' }).click()
  const competitorsPrompt = await page.evaluate(() => navigator.clipboard.readText())
  expect(competitorsPrompt).toContain(`Papéis aceitos: ${ROLE_KEYS.join(', ')}`)

  await page.getByRole('button', { name: 'Aprovar lista' }).click()
  await expect(page.getByRole('heading', { name: 'Lista aprovada' })).toBeVisible()
  await page.getByRole('button', { name: 'Copiar prompt da pesquisa inicial' }).click()
  const researchPrompt = await page.evaluate(() => navigator.clipboard.readText())
  for (const channel of channelKeys) {
    expect(researchPrompt).toContain(`- ${channel}: `)
  }
  expect(researchPrompt).toContain(`(${ASPECT_BLOCKS.map(({ key }) => key).join(', ')})`)
})

test('regrava o canal pela API e vê a análise nova sem duplicar, e mantém o canal ao recarregar', async ({
  page,
  request,
}) => {
  const project = await createProjectViaApi(request)
  await saveChannelViaApi(request, project.id, 'youtube', buildAnalysis({ score: 4, rationale: 'Primeira leitura' }))

  await page.goto(channelHref(project.id, 'youtube'))
  await expect(page.getByText('Primeira leitura')).toBeVisible()

  const rewrite = await saveChannelViaApi(
    request,
    project.id,
    'youtube',
    buildAnalysis({
      score: 8,
      rationale: 'Segunda leitura',
      findings: [{ competitor: 'Promob', aspect: 'frequency', kind: 'hypothesis', statement: 'Posta toda semana' }],
    }),
  )
  expect(rewrite.wasCreated).toBe(false)
  await returnToWindow(page)

  await expect(page.getByText('Segunda leitura')).toBeVisible()
  await expect(page.getByText('Primeira leitura')).toHaveCount(0)
  await expect(page.getByLabel('Nota 8 de 10')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Frequência', level: 3 })).toBeVisible()
  await expect(page.getByText('Publica vídeos curtos')).toHaveCount(0)
  expect((await listChannelsViaApi(request, project.id)).filter((summary) => summary.collected)).toHaveLength(1)

  await page.reload()
  await expect(page).toHaveURL(channelHref(project.id, 'youtube'))
  await expect(page.getByRole('heading', { name: 'YouTube', level: 1 })).toBeVisible()
  await expect(page.getByText('Segunda leitura')).toBeVisible()
})

test('troca de projeto pelo select, abre a página do projeto e mostra só os canais do projeto escolhido', async ({
  page,
  request,
}) => {
  const first = await createProjectViaApi(request)
  const second = await createProjectViaApi(request)
  await saveChannelViaApi(request, first.id, 'seo', buildAnalysis({ score: 9 }))
  await saveChannelViaApi(request, second.id, 'youtube', buildAnalysis({ score: 6 }))
  await saveChannelViaApi(request, second.id, 'linkedin', buildAnalysis({ score: 2 }))

  await page.goto(channelHref(first.id, 'seo'))
  const sidebar = page.getByRole('complementary')
  await expect(page.getByLabel('Nota 9 de 10')).toBeVisible()
  await expect(sidebar.getByRole('link', { name: /9\s*SEO e blog/ })).toBeVisible()

  await chooseProjectInSelect(page, second.name)
  await expect(page).toHaveURL(PROJECT_URL_PATTERN)
  await expect(page).toHaveURL(`/projects/${second.id}`)
  await expect(page.getByRole('heading', { name: second.name, level: 1 })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Copiar prompt de coleta' })).toBeVisible()

  await expect(sidebar.getByRole('link', { name: /6\s*YouTube/ })).toBeVisible()
  await expect(sidebar.getByRole('link', { name: /2\s*LinkedIn/ })).toBeVisible()
  await expect(sidebar.getByRole('link', { name: /9\s*SEO e blog/ })).toHaveCount(0)
  await expect.poll(() => sidebarChannelHrefs(page).then((hrefs) => hrefs.slice(0, 2))).toEqual([
    channelHref(second.id, 'youtube'),
    channelHref(second.id, 'linkedin'),
  ])

  await chooseProjectInSelect(page, first.name)
  await expect(page).toHaveURL(`/projects/${first.id}`)
  await expect(sidebar.getByRole('link', { name: /9\s*SEO e blog/ })).toBeVisible()
  await expect(sidebar.getByRole('link', { name: /6\s*YouTube/ })).toHaveCount(0)
})
