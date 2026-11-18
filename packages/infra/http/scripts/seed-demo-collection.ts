export type DemoCompetitor = {
  name: string
  role: 'main' | 'secondary'
  marketFocus: string
  services: string
  features: string
  audience: string
  rationale: string
  url: string
}

export type DemoFinding = {
  competitor: string
  aspect: 'format' | 'topic' | 'frequency' | 'performance' | 'cta'
  kind: 'fact' | 'hypothesis'
  statement: string
  url?: string
  excerpt?: string
  tool?: string
}

export type DemoChannelAnalysis = {
  channel: string
  score: number
  rationale: string
  bestContent: { type: string; evidence: string; basis: 'fact' | 'hypothesis' }
  findings: DemoFinding[]
}

type FindingDraft = [
  competitor: string,
  aspect: DemoFinding['aspect'],
  kind: DemoFinding['kind'],
  statement: string,
  excerpt?: string,
]

const PROMOB = 'Promob'
const MOBILPLAN = 'Mobilplan'
const SPREADSHEET = 'Planilha de Excel'
const ORCAFACIL = 'OrçaFácil'
const WORKSHOP_MANAGER = 'Gestão de Oficina'

export const MARKED_COMPETITOR_NAMES = ['Marcenaria Fácil']

export const DEMO_COMPETITORS: DemoCompetitor[] = [
  {
    name: PROMOB,
    role: 'main',
    marketFocus: 'Projeto e orçamento de móveis sob medida para marcenarias e lojas de planejados',
    services: 'Software de projeto 3D com lista de corte e orçamento',
    features: 'Projeto 3D, plano de corte, orçamento por peça',
    audience: 'Marcenarias médias e grandes e lojas de móveis planejados',
    rationale: 'Atua no mesmo mercado e oferece orçamento por peça, como a Bancada, mas pesado para oficina pequena.',
    url: 'https://promob.example',
  },
  {
    name: MOBILPLAN,
    role: 'main',
    marketFocus: 'Orçamento e pedidos para marcenarias de pequeno porte',
    services: 'App de orçamento com pedido e agenda de entrega',
    features: 'Orçamento em PDF, quadro de pedidos, agenda de entrega',
    audience: 'Marcenarias de 2 a 15 pessoas',
    rationale: 'Mesmo público e funções equivalentes: orçamento em PDF e quadro de pedidos.',
    url: 'https://mobilplan.example',
  },
  {
    name: SPREADSHEET,
    role: 'secondary',
    marketFocus: 'Controle caseiro de orçamento e estoque',
    services: 'Planilhas montadas por cada marceneiro',
    features: 'Soma de material e mão de obra, controle de chapas por linha',
    audience: 'Marceneiros autônomos e oficinas de até 3 pessoas',
    rationale: 'Só sobrepõe o público: é a alternativa gratuita que a Bancada precisa vencer.',
    url: 'https://planilhas.example',
  },
  {
    name: ORCAFACIL,
    role: 'secondary',
    marketFocus: 'Orçamento genérico para prestadores de serviço',
    services: 'App de orçamento por modelo, sem estoque',
    features: 'Modelos de orçamento, envio por WhatsApp',
    audience: 'Prestadores de serviço de vários ramos',
    rationale: 'Sobrepõe o público e o orçamento pelo WhatsApp, sem estoque de chapas.',
    url: 'https://orcafacil.example',
  },
  {
    name: WORKSHOP_MANAGER,
    role: 'secondary',
    marketFocus: 'Gestão de oficinas mecânicas e de reparo',
    services: 'Ordem de serviço e controle de peças',
    features: 'Ordem de serviço, estoque de peças, aviso de retirada',
    audience: 'Oficinas mecânicas e assistências técnicas',
    rationale: 'Sobrepõe o tipo de negócio (oficina), mas atende outro mercado.',
    url: 'https://gestaooficina.example',
  },
  {
    name: MARKED_COMPETITOR_NAMES[0],
    role: 'secondary',
    marketFocus: 'Venda de móveis prontos pela internet',
    services: 'Loja virtual de móveis de catálogo',
    features: 'Catálogo, frete, pagamento online',
    audience: 'Consumidores finais',
    rationale: 'Vende móvel pronto ao consumidor; o fundador marcou como não concorrente.',
    url: 'https://marcenariafacil.example',
  },
]

function competitorSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function buildFindings(channel: string, drafts: FindingDraft[]): DemoFinding[] {
  return drafts.map(([competitor, aspect, kind, statement, excerpt]) => {
    if (kind === 'hypothesis') return { competitor, aspect, kind, statement }
    return {
      competitor,
      aspect,
      kind,
      statement,
      url: `https://${competitorSlug(competitor)}.example/${channel}`,
      excerpt,
      tool: 'WebFetch',
    }
  })
}

export const DEMO_CHANNEL_ANALYSES: DemoChannelAnalysis[] = [
  {
    channel: 'seo',
    score: 9,
    rationale:
      'Quatro dos cinco concorrentes ativos publicam guias de preço e comparativos que ranqueiam nas buscas de orçamento de marcenaria; é o canal onde a disputa é mais forte.',
    bestContent: {
      type: 'Guia de preço de marcenaria por metro quadrado',
      evidence: 'O guia do Promob aparece no topo para "preço de marcenaria" e recebe cerca de 12 mil visitas por mês (estimativa pública).',
      basis: 'fact',
    },
    findings: buildFindings('seo', [
      [PROMOB, 'format', 'fact', 'Publica guias longos com tabela de preço por metro quadrado', 'Tabela: armário de cozinha de R$ 1.800 a R$ 3.200 por m²'],
      [PROMOB, 'topic', 'fact', 'Concentra o blog em orçamento e custo de móveis planejados', '12 de 15 artigos recentes falam de preço e orçamento'],
      [PROMOB, 'performance', 'fact', 'O guia de preço lidera a busca por "preço de marcenaria"', 'Posição 1 na busca por "preço de marcenaria"'],
      [MOBILPLAN, 'format', 'fact', 'Usa comparativos "X contra planilha" com chamada no meio do texto', 'Título: Orçamento no app ou na planilha? Compare'],
      [MOBILPLAN, 'frequency', 'fact', 'Publica dois artigos por semana', 'Datas de 4 artigos: 3, 6, 10 e 13 de outubro'],
      [MOBILPLAN, 'topic', 'hypothesis', 'Deve estar investindo em palavras de "sistema para marcenaria"'],
      [SPREADSHEET, 'topic', 'fact', 'Modelos de planilha gratuitos lideram a busca por "planilha de orçamento de marcenaria"', 'Três modelos para baixar nas cinco primeiras posições'],
      [ORCAFACIL, 'frequency', 'fact', 'Mantém um artigo por mês, sempre sobre modelo de orçamento', 'Último artigo há 5 semanas'],
      [ORCAFACIL, 'performance', 'hypothesis', 'Ranqueia pouco para termos de marcenaria por ser um site genérico'],
    ]),
  },
  {
    channel: 'linkedin',
    score: 8,
    rationale:
      'Promob e Mobilplan usam o LinkedIn para falar com donos de marcenaria e lojistas, com casos de cliente e vagas de parceiros; Gestão de Oficina quase não aparece.',
    bestContent: {
      type: 'Caso de cliente com antes e depois do orçamento',
      evidence: 'Post do Promob com o caso de uma marcenaria de 8 pessoas recebeu 430 reações.',
      basis: 'fact',
    },
    findings: buildFindings('linkedin', [
      [PROMOB, 'format', 'fact', 'Posta carrossel com caso de cliente e resultado em número', 'Carrossel: "Marcenaria de 8 pessoas cortou 40% do tempo de orçamento"'],
      [PROMOB, 'frequency', 'fact', 'Posta três vezes por semana', '12 posts em 4 semanas'],
      [PROMOB, 'performance', 'fact', 'O caso de cliente reúne mais reações que os demais posts', '430 reações contra média de 90'],
      [MOBILPLAN, 'format', 'fact', 'Usa vídeo curto de demonstração do app', 'Vídeo de 45 segundos mostrando o orçamento em PDF'],
      [MOBILPLAN, 'cta', 'fact', 'Fecha os posts com convite para teste grátis de 14 dias', 'Texto final: "Teste 14 dias grátis, sem cartão"'],
      [SPREADSHEET, 'topic', 'hypothesis', 'Não tem página própria: o conteúdo vem de criadores independentes'],
      [ORCAFACIL, 'topic', 'fact', 'Fala de orçamento para vários ramos, sem foco em marcenaria', 'Posts citam eletricistas, pintores e marceneiros no mesmo texto'],
      [ORCAFACIL, 'cta', 'hypothesis', 'Deve usar o LinkedIn só para captar parceiros'],
    ]),
  },
  {
    channel: 'site-pricing',
    score: 6,
    rationale:
      'Mobilplan e OrçaFácil mostram o preço no site; Promob pede contato comercial. Preço de entrada de concorrentes diretos fica entre R$ 79 e R$ 149 por mês.',
    bestContent: {
      type: 'Página de preço com três planos e teste grátis',
      evidence: 'A página do Mobilplan lista planos de R$ 79, R$ 119 e R$ 149 por mês.',
      basis: 'fact',
    },
    findings: buildFindings('site-pricing', [
      [MOBILPLAN, 'format', 'fact', 'Mostra três planos com preço mensal na página inicial', 'Planos: Básico R$ 79, Oficina R$ 119, Equipe R$ 149'],
      [MOBILPLAN, 'cta', 'fact', 'O botão principal é "Testar 14 dias grátis"', 'Botão: Testar 14 dias grátis'],
      [PROMOB, 'cta', 'fact', 'Não mostra preço e leva para um formulário de contato comercial', 'Botão: Fale com um consultor'],
      [ORCAFACIL, 'format', 'fact', 'Tem um plano único com preço fixo', 'Plano único: R$ 39 por mês'],
      [SPREADSHEET, 'topic', 'hypothesis', 'O custo zero é o argumento principal, sem página de preço'],
      [WORKSHOP_MANAGER, 'format', 'hypothesis', 'Cobra por ordem de serviço, o que muda a comparação de preço'],
    ]),
  },
  {
    channel: 'x',
    score: 5,
    rationale: 'Leitura parcial sem login: só os posts públicos mais recentes. Mobilplan e OrçaFácil postam dicas curtas; o restante está parado.',
    bestContent: {
      type: 'Dica curta de orçamento com imagem',
      evidence: 'O post de dica do Mobilplan teve 210 curtidas entre os visíveis.',
      basis: 'hypothesis',
    },
    findings: buildFindings('x', [
      [MOBILPLAN, 'format', 'fact', 'Publica dicas curtas com imagem de planilha de orçamento', 'Post: "3 erros que fazem o orçamento da marcenaria dar prejuízo"'],
      [MOBILPLAN, 'frequency', 'hypothesis', 'Posta cerca de uma vez por dia, pelo que a busca pública mostra'],
      [ORCAFACIL, 'topic', 'fact', 'Responde dúvidas de orçamento de pequenos prestadores', 'Resposta: "Cobre a hora e o material em linhas separadas"'],
      [PROMOB, 'frequency', 'hypothesis', 'Conta parada: sem posts visíveis nos últimos meses'],
      [SPREADSHEET, 'topic', 'hypothesis', 'Sem conta própria; aparece em menções de marceneiros'],
    ]),
  },
  {
    channel: 'youtube',
    score: 4,
    rationale: 'Promob tem canal com tutoriais de software; os demais quase não têm vídeo. Há pouco conteúdo de concorrente sobre orçamento.',
    bestContent: {
      type: 'Tutorial de orçamento passo a passo',
      evidence: 'O tutorial do Promob tem 38 mil visualizações.',
      basis: 'fact',
    },
    findings: buildFindings('youtube', [
      [PROMOB, 'format', 'fact', 'Tutoriais longos de 15 a 25 minutos, mostrando a tela do software', 'Vídeo: "Orçamento completo de uma cozinha em 18 minutos"'],
      [PROMOB, 'performance', 'fact', 'O tutorial de orçamento passa de 38 mil visualizações', '38 mil visualizações'],
      [MOBILPLAN, 'frequency', 'fact', 'Publica um vídeo por mês', 'Últimos três vídeos: setembro, outubro e novembro'],
      [SPREADSHEET, 'topic', 'hypothesis', 'Vídeos de ensino de planilha vêm de canais independentes'],
    ]),
  },
  {
    channel: 'reddit',
    score: 2,
    rationale: 'Leitura parcial sem login: poucas conversas públicas em português sobre orçamento de marcenaria; nenhum concorrente tem perfil.',
    bestContent: {
      type: 'Pergunta de marceneiro sobre como cobrar',
      evidence: 'Uma discussão com 30 comentários sobre cobrança de mão de obra.',
      basis: 'hypothesis',
    },
    findings: buildFindings('reddit', [
      [SPREADSHEET, 'topic', 'fact', 'Marceneiros recomendam planilha de Excel nas respostas sobre orçamento', 'Comentário: "Eu uso uma planilha e funciona"'],
      [ORCAFACIL, 'topic', 'hypothesis', 'Citado de passagem, sem perfil oficial'],
    ]),
  },
  {
    channel: 'instagram',
    score: 0,
    rationale: 'Nenhum dos concorrentes ativos publica de forma regular no Instagram sobre orçamento ou estoque; o canal está livre.',
    bestContent: {
      type: 'Sem conteúdo de concorrente a destacar',
      evidence: 'Nenhuma conta dos concorrentes ativos tem publicação recente sobre o tema.',
      basis: 'hypothesis',
    },
    findings: [],
  },
]
