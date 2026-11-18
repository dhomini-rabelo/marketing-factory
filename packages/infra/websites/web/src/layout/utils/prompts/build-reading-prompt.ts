type PromptInput = {
  projectId: string
  apiUrl: string
}

export function buildReadingPrompt({ projectId, apiUrl }: PromptInput): string {
  const projectUrl = `${apiUrl}/projects/${projectId}`

  return [
    `Antes de criar qualquer conteúdo de marketing para o projeto ${projectId}, leia o que já está registrado sobre ele, nesta ordem:`,
    `1. Leia os dados básicos do projeto com GET ${projectUrl}.`,
    `2. Liste os documentos com GET ${projectUrl}/documents.`,
    `3. Leia os documentos relevantes ao canal pedido (SEO, Instagram, Facebook, TikTok e similares) com GET ${projectUrl}/documents/{slug}, usando o slug de cada item da lista.`,
    '4. Só então crie o conteúdo.',
    '',
    'Se a lista de documentos vier vazia, avise que ainda não há nada coletado e sugira rodar o prompt de coleta no repositório do projeto.',
    'Se faltar informação para o canal pedido, diga qual falta. Não invente informação sobre o produto.',
    'O prompt de coleta só grava o que está no repositório do produto. Público-alvo, dores, proposta de valor, diferenciais, tom de voz, depoimentos e números de clientes não vêm dele: não sugira rodar a coleta de novo para isso; peça essas informações ao usuário.',
    `Concorrentes não ficam nos documentos: leia a lista com GET ${projectUrl}/competitors. Se vier vazia, sugira o prompt "Descobrir concorrentes" da página Concorrentes do app.`,
  ].join('\n')
}
