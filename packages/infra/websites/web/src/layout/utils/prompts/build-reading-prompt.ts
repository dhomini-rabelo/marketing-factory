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
    'Se nenhum documento for relevante ao canal pedido, diga qual documento falta. Não invente informação sobre o produto.',
  ].join('\n')
}
