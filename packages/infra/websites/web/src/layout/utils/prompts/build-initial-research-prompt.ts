import { ASPECT_KEYS, CHANNEL_KEYS } from '@/layout/utils/competitor-analysis/keys'

type PromptInput = {
  projectId: string
  apiUrl: string
}

export function buildInitialResearchPrompt({ projectId, apiUrl }: PromptInput): string {
  const projectUrl = `${apiUrl}/projects/${projectId}`
  const channelLines = CHANNEL_KEYS.map(({ key, label }) => `- ${key}: ${label}`)
  const aspectKeys = ASPECT_KEYS.map(({ key }) => key).join(', ')

  return [
    `Você vai fazer a pesquisa inicial dos canais de marketing dos concorrentes do projeto ${projectId}.`,
    '',
    'Antes de tudo, leia a lista de concorrentes e a aprovação:',
    `1. Leia os dados básicos do projeto com GET ${projectUrl}.`,
    `2. Leia a lista com GET ${projectUrl}/competitors. A resposta traz "approval" ("approved" ou "pending") e os concorrentes, cada um com "incorrect": true quando o fundador o marcou como "não é concorrente".`,
    'Se a lista não estiver aprovada ou não tiver ao menos um concorrente não marcado, não analise nem grave nenhum canal. Diga ao fundador, no terminal, para aprovar a lista de concorrentes no app, e pare.',
    '',
    'Com a lista aprovada:',
    '- Pule os concorrentes marcados. Analise todos os outros, os principais ("main") primeiro e com mais peso na nota do canal que os secundários ("secondary").',
    '- Use só leitura pública: não entre em nenhuma conta, não faça login e não use serviço pago. Onde a leitura pública não alcança, diga isso na justificativa e marque os achados como hipótese.',
    '- Escreva o nome de cada concorrente exatamente como está na lista, para os achados se juntarem ao concorrente certo.',
    '',
    'Cubra os nove canais, dividindo o trabalho por canal: use um agente auxiliar para cada canal. Chaves dos canais:',
    ...channelLines,
    '',
    'Para cada canal, produza:',
    '- score: nota de 0 a 10, inteira, que combina a atividade dos concorrentes ali (os principais pesam mais, os secundários menos) com a aderência do canal ao projeto (plataforma e fase), e rationale com a justificativa.',
    '- bestContent: {"type": "...", "evidence": "...", "basis": "fact"}, o tipo de conteúdo que performa melhor no canal. Use basis "fact" só quando houver número público (curtidas, comentários, visualizações ou posição no Google); no resto, use "hypothesis".',
    `- findings: a lista de achados, cada um classificado em um dos cinco aspectos (${aspectKeys}). Dê o mesmo aspecto a achados de concorrentes diferentes que tratam da mesma coisa.`,
    '',
    'Cada achado tem {"competitor": "...", "aspect": "...", "kind": "fact", "statement": "...", "url": "...", "excerpt": "...", "tool": "..."}. Registre como "fact" só o que tem link (url), trecho (excerpt) e a ferramenta usada (tool). O que não tiver os três é "hypothesis". Não invente fonte.',
    '',
    `Grave um canal de cada vez com PUT ${projectUrl}/channels/{canal} e o corpo JSON {"score": 0, "rationale": "...", "bestContent": {...}, "findings": [...]}, usando a chave do canal. Rodar de novo o mesmo canal substitui a análise anterior, sem criar outra.`,
  ].join('\n')
}
