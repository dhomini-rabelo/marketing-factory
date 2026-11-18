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

const DEFAULT_API_URL = 'http://127.0.0.1:3333'

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

async function sendJson<Body>(apiUrl: string, method: string, path: string, body: unknown): Promise<Body> {
  const response = await fetch(`${apiUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(`${method} ${path} respondeu ${response.status}: ${await response.text()}`)
  }
  return (await response.json()) as Body
}

async function createProject(apiUrl: string, project: Omit<DemoProject, 'documents'>) {
  return sendJson<CreatedProject>(apiUrl, 'POST', '/projects', project)
}

async function saveDocuments(apiUrl: string, projectId: string, documents: DemoDocument[]) {
  for (const document of documents) {
    await sendJson(apiUrl, 'PUT', `/projects/${projectId}/documents`, document)
  }
}

async function seedDemo(apiUrl: string, extraProjectsCount: number) {
  for (const { documents, ...project } of DEMO_PROJECTS) {
    const created = await createProject(apiUrl, project)
    await saveDocuments(apiUrl, created.id, documents)
  }

  for (let position = 1; position <= extraProjectsCount; position += 1) {
    await createProject(apiUrl, {
      name: `Projeto de teste ${position}`,
      platform: 'web',
      phase: 'no_customers',
      description: `Projeto extra ${position} para testar a lista longa da barra lateral.`,
    })
  }
}

const apiUrl = process.env.API_URL || DEFAULT_API_URL
const extraProjectsCount = readExtraProjectsCount(process.argv.slice(2))

seedDemo(apiUrl, extraProjectsCount)
  .then(() => {
    const total = DEMO_PROJECTS.length + extraProjectsCount
    console.log(`${total} projetos criados em ${apiUrl}`)
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
