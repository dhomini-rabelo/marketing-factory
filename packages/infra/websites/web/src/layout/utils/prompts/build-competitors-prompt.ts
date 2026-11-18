import { COMPETITORS_COUNT, ROLE_KEYS } from '@/layout/utils/competitor-analysis/keys'

type PromptInput = {
  projectId: string
  apiUrl: string
}

export function buildCompetitorsPrompt({ projectId, apiUrl }: PromptInput): string {
  const projectUrl = `${apiUrl}/projects/${projectId}`
  const roleKeys = ROLE_KEYS.map(({ key }) => key).join(', ')

  return [
    `Você vai definir e qualificar os concorrentes do projeto ${projectId}. Não analise nenhum canal agora: isso fica para a pesquisa inicial, depois que o fundador aprovar a lista.`,
    '',
    'Use só leitura pública: não entre em nenhuma conta, não faça login e não use serviço pago.',
    '',
    'Siga esta ordem:',
    `1. Leia os dados básicos do projeto com GET ${projectUrl}.`,
    `2. Liste os documentos com GET ${projectUrl}/documents. Se existir um documento de concorrentes, leia-o com GET ${projectUrl}/documents/{slug} e use-o como ponto de partida.`,
    `3. Leia a lista já gravada com GET ${projectUrl}/competitors. Cada concorrente vem com "incorrect": true quando o fundador o marcou como "não é concorrente". Não proponha de novo quem está marcado.`,
    '4. Descubra os concorrentes pela busca na web, a partir do que o projeto faz, para quem e em que plataforma.',
    '5. Qualifique cada concorrente antes de qualquer canal: foco de mercado, serviços, features e público.',
    `6. Dê a cada concorrente o papel "main" (principal: atua no mesmo mercado e oferece serviço ou feature equivalente ao do projeto) ou "secondary" (secundário), comparado ao projeto, com a justificativa em rationale. Papéis aceitos: ${roleKeys}.`,
    '',
    'Troque os números abaixo à mão antes de colar, se quiser:',
    `Número de concorrentes: mínimo ${COMPETITORS_COUNT.minimum}, alvo ${COMPETITORS_COUNT.target}, máximo ${COMPETITORS_COUNT.maximum}`,
    `Alvo: ${COMPETITORS_COUNT.targetMain} principais e ${COMPETITORS_COUNT.targetSecondary} secundários. Máximo: ${COMPETITORS_COUNT.maximumMain} principais e ${COMPETITORS_COUNT.maximumSecondary} secundários.`,
    '',
    `Grave a lista inteira de uma vez com PUT ${projectUrl}/competitors e o corpo JSON {"competitors": [{"name": "...", "role": "main", "marketFocus": "...", "services": "...", "features": "...", "audience": "...", "rationale": "...", "url": "..."}]}. O campo url é opcional e, quando existir, começa com http:// ou https://.`,
    'Gravar de novo troca a lista anterior, mantém as marcas do fundador e leva a aprovação de volta para pendente.',
    '',
    `Se achar menos de ${COMPETITORS_COUNT.minimum} concorrentes, grave os que achou e diga ao fundador, no terminal, que a lista ficou abaixo do mínimo. Não invente concorrente.`,
    '',
    'Termine dizendo ao fundador, no terminal, para conferir a lista no app, marcar o que está errado e aprovar a lista. Não analise nenhum canal.',
  ].join('\n')
}
