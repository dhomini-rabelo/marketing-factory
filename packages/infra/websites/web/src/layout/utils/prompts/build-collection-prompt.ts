type PromptInput = {
  projectId: string
  apiUrl: string
}

const CATEGORIES = [
  'Visão geral do produto',
  'Features importantes e de média importância',
  'Público e dores',
  'Proposta de valor e diferenciais',
  'Concorrentes',
  'Tom de voz e exemplos',
  'Provas (depoimentos, números, preços e planos)',
  'Canais, links e ativos',
  'SEO (palavras-chave e temas)',
  'Restrições (o que não dizer)',
]

export function buildCollectionPrompt({ projectId, apiUrl }: PromptInput): string {
  const documentsUrl = `${apiUrl}/projects/${projectId}/documents`
  const categoryLines = CATEGORIES.map((category, index) => `${index + 1}. ${category}`)

  return [
    `Você está com o Claude Code aberto na pasta de um repositório clonado. Investigue esta pasta e grave o que achar sobre o produto e o marketing do projeto ${projectId}.`,
    '',
    'Cubra estas 10 categorias:',
    ...categoryLines,
    '',
    'Divida o que achar em vários documentos curtos, um por assunto, em vez de um documento grande. Por exemplo, features importantes e features de média importância ficam em documentos separados.',
    '',
    `Grave cada documento com PUT ${documentsUrl} e o corpo JSON {"title": "...", "description": "...", "body": "..."}.`,
    '- title: o título do documento, até 120 caracteres. Gravar de novo com o mesmo título atualiza o documento que já existe, sem criar cópia.',
    '- description: uma descrição curta do documento, até 300 caracteres.',
    '- body: o conteúdo em markdown, até 100.000 caracteres.',
    '',
    'Quando uma categoria não tiver informação no repositório, grave um documento curto dizendo "não encontrado no repositório" naquela categoria. Não invente. O produto pode estar em fase inicial, sem clientes, provas ou concorrentes.',
  ].join('\n')
}
