import { DEMO_CHANNEL_ANALYSES, DEMO_COMPETITORS, DemoCompetitor, MARKED_COMPETITOR_NAMES } from './seed-demo-collection'
import { SEO_DEMO_COMPETITORS, SeoVariant, saveSeoRound } from './seed-demo-seo'
import { sendJson } from './send-json'

type DemoDocument = {
  title: string
  description: string
  body: string
}

type DemoProject = {
  name: string
  platform: 'web' | 'mobile' | 'both'
  phase: 'no_customers' | 'finding_market_fit' | 'consolidated'
  description: string
  documents: DemoDocument[]
}

type CreatedProject = {
  id: string
}

type SavedCompetitors = {
  competitors: { id: string; name: string }[]
}

type SeedOptions = {
  extraProjectsCount: number
  collectionProjectName: string | null
  approveCompetitors: boolean
  seoVariant: SeoVariant | null
}

const DEFAULT_API_URL = 'http://127.0.0.1:7341'

const BANCADA_DOCUMENTS: DemoDocument[] = [
  {
    title: 'Features importantes',
    description: 'As 5 funções que fecham venda, com o que o cliente ganha em cada uma',
    body: [
      '### Orçamento em PDF em 2 minutos',
      '',
      'O marceneiro escolhe as peças, a madeira e o acabamento; o sistema soma **material, mão de obra e margem** e gera um PDF com a logo dele, pronto para mandar no WhatsApp.',
      '',
      '#### Por que importa',
      '',
      '- Hoje o orçamento sai em caderno ou planilha e leva **de 1 a 2 dias** (README, seção "Problema").',
      '- Cliente que recebe preço no mesmo dia fecha mais.',
      '',
      '### Estoque que avisa antes de faltar',
      '',
      '- Baixa automática de chapas de MDF quando o pedido entra em produção.',
      '- Alerta quando uma cor de chapa fica abaixo de 3 unidades.',
      '',
      '### Quadro de pedidos da oficina',
      '',
      'Colunas *orçado → aprovado → cortando → montagem → entregue*, visível no celular do chão de fábrica.',
    ].join('\n'),
  },
  {
    title: 'Público e dores',
    description: 'Donos de marcenaria de 2 a 10 pessoas que orçam no caderno',
    body: [
      '### Quem é',
      '',
      'Donos de marcenaria de **2 a 10 pessoas**, que fazem móveis sob medida e orçam no caderno ou em planilha.',
      '',
      '### Dores',
      '',
      '- Orçamento demora de 1 a 2 dias e o cliente some.',
      '- Chapa de MDF acaba no meio do pedido.',
      '- Ninguém sabe em que etapa está cada móvel.',
    ].join('\n'),
  },
  {
    title: 'Proposta de valor',
    description: 'Preço no mesmo dia, sem planilha, com a cara da oficina',
    body: [
      '### Em uma frase',
      '',
      'Preço no mesmo dia, **sem planilha**, com a cara da oficina.',
      '',
      '- O orçamento sai em PDF com a logo do marceneiro.',
      '- O estoque de chapas baixa sozinho.',
    ].join('\n'),
  },
  {
    title: 'Tom de voz',
    description: 'Direto, de oficina, sem termo de software; 6 exemplos de frase',
    body: [
      '### Como falar',
      '',
      'Direto, de oficina, **sem termo de software**.',
      '',
      '- "Orçamento pronto antes do café esfriar."',
      '- "Chapa acabando? A Bancada avisa."',
    ].join('\n'),
  },
  {
    title: 'SEO: palavras e temas',
    description: '“orçamento de marcenaria”, “sistema para marcenaria” e mais 14',
    body: [
      '### Palavras principais',
      '',
      '- orçamento de marcenaria',
      '- sistema para marcenaria',
      '- controle de estoque de MDF',
    ].join('\n'),
  },
  {
    title: 'Concorrentes',
    description: 'Promob, planilhas de Excel e 2 apps de orçamento genéricos',
    body: [
      '### Quem disputa a atenção',
      '',
      '- **Promob**: completo, mas pesado para oficina pequena.',
      '- **Planilhas de Excel**: gratuitas, mas cada marceneiro monta a sua.',
      '- Dois apps de orçamento genéricos, sem estoque de chapas.',
    ].join('\n'),
  },
  {
    title: 'Features de média importância',
    description: 'Agenda de entrega, fotos do móvel pronto, recibo de sinal',
    body: [
      '### Depois do essencial',
      '',
      '- Agenda de entrega.',
      '- Fotos do móvel pronto.',
      '- Recibo de sinal.',
    ].join('\n'),
  },
  {
    title: 'Canais e links',
    description: 'Site, Instagram @bancada.app; TikTok e Facebook não encontrados no repositório',
    body: [
      '### Onde a Bancada aparece',
      '',
      '- Instagram: @bancada.app',
      '- TikTok e Facebook: não encontrados no repositório.',
    ].join('\n'),
  },
]

const DEMO_PROJECTS: DemoProject[] = [
  {
    name: 'Bancada',
    platform: 'web',
    phase: 'finding_market_fit',
    description: 'Pedidos, estoque e orçamento em PDF pelo WhatsApp para marcenarias de até 10 pessoas.',
    documents: BANCADA_DOCUMENTS,
  },
  {
    name: 'Clínica Lume',
    platform: 'mobile',
    phase: 'no_customers',
    description: 'Agenda e lembretes de consulta pelo celular para clínicas pequenas de estética.',
    documents: [],
  },
  {
    name: 'Rota da Feira',
    platform: 'both',
    phase: 'consolidated',
    description: 'Mapa e pedidos antecipados das barracas de feira livre para quem compra e para quem vende.',
    documents: [],
  },
]

function readExtraProjectsCount(args: string[]): number {
  const flagIndex = args.indexOf('--projects')
  if (flagIndex === -1) return 0

  const count = Number(args[flagIndex + 1])
  if (!Number.isInteger(count) || count < 0) {
    throw new Error('--projects espera um número inteiro maior ou igual a zero')
  }
  return count
}

async function createProject(apiUrl: string, project: Omit<DemoProject, 'documents'>) {
  return sendJson<CreatedProject>(apiUrl, 'POST', '/projects', project)
}

async function saveDocuments(apiUrl: string, projectId: string, documents: DemoDocument[]) {
  for (const document of documents) {
    await sendJson(apiUrl, 'PUT', `/projects/${projectId}/documents`, document)
  }
}

function readCollectionProjectName(args: string[]): string | null {
  const flagIndex = args.indexOf('--coleta')
  if (flagIndex === -1) return null

  const projectName = args[flagIndex + 1]
  if (!projectName || projectName.startsWith('--')) {
    throw new Error('--coleta espera o nome de um projeto')
  }
  return projectName
}

const SEO_VARIANT_FLAGS: Record<string, SeoVariant> = {
  '--seo-parcial': 'partial',
  '--seo-conta-quebrada': 'brokenSum',
  '--seo-rodadas': 'twoRounds',
}

function readSeoVariant(args: string[]): SeoVariant | null {
  const variants = Object.entries(SEO_VARIANT_FLAGS)
    .filter(([flag]) => args.includes(flag))
    .map(([, variant]) => variant)

  if (variants.length > 1) {
    throw new Error('Use só uma variação de SEO por vez: --seo-parcial, --seo-conta-quebrada ou --seo-rodadas')
  }
  if (variants.length === 1) return variants[0]
  return args.includes('--seo') ? 'complete' : null
}

function readSeedOptions(args: string[]): SeedOptions {
  const options: SeedOptions = {
    extraProjectsCount: readExtraProjectsCount(args),
    collectionProjectName: readCollectionProjectName(args),
    approveCompetitors: args.includes('--aprovada'),
    seoVariant: readSeoVariant(args),
  }
  if (options.approveCompetitors && options.collectionProjectName === null) {
    throw new Error('--aprovada só vale junto com --coleta')
  }
  if (options.seoVariant !== null && !options.approveCompetitors) {
    throw new Error('--seo só vale junto com --coleta e --aprovada')
  }
  return options
}

function listProjectNames(extraProjectsCount: number): string[] {
  const extraNames = Array.from({ length: extraProjectsCount }, (_, index) => extraProjectName(index + 1))
  return [...DEMO_PROJECTS.map((project) => project.name), ...extraNames]
}

function extraProjectName(position: number): string {
  return `Projeto de teste ${position}`
}

async function saveCollection(
  apiUrl: string,
  projectId: string,
  approveCompetitors: boolean,
  competitors: DemoCompetitor[],
  markedCompetitorNames: string[],
) {
  const saved = await sendJson<SavedCompetitors>(apiUrl, 'PUT', `/projects/${projectId}/competitors`, {
    competitors,
  })

  for (const name of markedCompetitorNames) {
    const savedCompetitor = saved.competitors.find((competitor) => competitor.name === name)
    await sendJson(apiUrl, 'PATCH', `/projects/${projectId}/competitors/${encodeURIComponent(savedCompetitor?.id ?? name)}`, {
      incorrect: true,
    })
  }

  if (approveCompetitors) {
    await sendJson(apiUrl, 'PUT', `/projects/${projectId}/competitors-approval`, { approved: true })
  }

  for (const { channel, ...analysis } of DEMO_CHANNEL_ANALYSES) {
    await sendJson(apiUrl, 'PUT', `/projects/${projectId}/channels/${channel}`, analysis)
  }
}

function listCollectionCompetitors(seoVariant: SeoVariant | null): DemoCompetitor[] {
  return seoVariant === null ? DEMO_COMPETITORS : SEO_DEMO_COMPETITORS
}

async function seedDemo(apiUrl: string, options: SeedOptions): Promise<string | null> {
  if (options.collectionProjectName !== null) {
    const knownNames = listProjectNames(options.extraProjectsCount)
    if (!knownNames.includes(options.collectionProjectName)) {
      throw new Error(`--coleta recebeu o projeto "${options.collectionProjectName}", que este seed não cria: ${knownNames.join(', ')}`)
    }
  }

  const projectIdsByName = new Map<string, string>()

  for (const { documents, ...project } of DEMO_PROJECTS) {
    const created = await createProject(apiUrl, project)
    projectIdsByName.set(project.name, created.id)
    await saveDocuments(apiUrl, created.id, documents)
  }

  for (let position = 1; position <= options.extraProjectsCount; position += 1) {
    const created = await createProject(apiUrl, {
      name: extraProjectName(position),
      platform: 'web',
      phase: 'no_customers',
      description: `Projeto extra ${position} para testar a lista longa da barra lateral.`,
    })
    projectIdsByName.set(extraProjectName(position), created.id)
  }

  if (options.collectionProjectName !== null) {
    const projectId = projectIdsByName.get(options.collectionProjectName) as string
    const markedNames = options.seoVariant === null ? MARKED_COMPETITOR_NAMES : []
    await saveCollection(apiUrl, projectId, options.approveCompetitors, listCollectionCompetitors(options.seoVariant), markedNames)
    if (options.seoVariant !== null) {
      await saveSeoRound(apiUrl, projectId, options.seoVariant)
    }
    return projectId
  }

  return null
}

const apiUrl = process.env.API_URL || DEFAULT_API_URL
const options = readSeedOptions(process.argv.slice(2))

seedDemo(apiUrl, options)
  .then((collectionProjectId) => {
    const total = DEMO_PROJECTS.length + options.extraProjectsCount
    console.log(`${total} projetos criados em ${apiUrl}`)
    if (options.collectionProjectName !== null) {
      const approval = options.approveCompetitors ? 'aprovada' : 'aguardando aprovação'
      const competitorsCount = listCollectionCompetitors(options.seoVariant).length
      console.log(`Coleta gravada em ${options.collectionProjectName}: ${competitorsCount} concorrentes (${approval}) e ${DEMO_CHANNEL_ANALYSES.length} canais`)
    }
    if (options.seoVariant !== null) {
      console.log(`SEO gravado (${options.seoVariant}): projectId ${collectionProjectId}, tela em /projects/${collectionProjectId}/channels/seo`)
    }
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
