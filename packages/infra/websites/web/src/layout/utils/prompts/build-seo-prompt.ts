import {
  SEO_PROMPT_CHECKLIST,
  SEO_PROMPT_COMPETITOR_STEPS,
  SEO_PROMPT_DATA_RULES,
  SEO_PROMPT_INTRO,
  SEO_PROMPT_RESULT_STRUCTURE,
  SEO_PROMPT_SEARCHES,
  SEO_PROMPT_WORKING_RULES,
} from '@/layout/utils/prompts/seo-prompt-text'

const SEO_MARKET = 'Brasil, português'

type PromptInput = {
  projectId: string
  apiUrl: string
}

type CompletePromptInput = PromptInput & {
  roundId: string
  missing: string[]
}

function buildProjectSection(projectUrl: string): string {
  return [
    '## Projeto',
    'Nada do projeto vem escrito neste prompt: leia na hora de rodar, para a lista nunca estar velha.',
    `1. Leia o nome e a descrição do projeto com GET ${projectUrl}.`,
    `2. Leia os concorrentes com GET ${projectUrl}/competitors. A resposta traz "approval" ("approved" ou "pending") e os concorrentes, cada um com "name", "role" ("main" é principal, "secondary" é secundário), "url" e "incorrect". Se "approval" não for "approved", pare e avise que a lista precisa ser aprovada na página Concorrentes do app. Pesquise só quem não está com "incorrect": true.`,
    `Mercado de busca: ${SEO_MARKET}`,
    'Pesquise todos os concorrentes aprovados. Use o "name" exatamente como veio da API, letra por letra, no campo `competitor` e no endereço da gravação.',
  ].join('\n')
}

function buildDeliverySection(projectUrl: string): string {
  const roundsUrl = `${projectUrl}/seo/rounds`

  return [
    '## Como entregar',
    'Grave pela API do app, nesta ordem. O corpo de cada chamada vai compacto, em JSON, com `Content-Type: application/json`.',
    `1. Abra a rodada com POST ${roundsUrl} e o corpo {"tool": "claude-code" ou "grok-bot", "collectedAt": "AAAA-MM-DD", "note": "...", "market": "${SEO_MARKET}", "searches": [...]}. \`note\`, \`collectedAt\` e \`searches\` são os do JSON da Parte 1; \`searches\` é \`[]\` quando você não fez a amostra. A resposta é 201 com {"id": "..."}: esse é o \`roundId\`. Se vier 409 NO_ACTIVE_COMPETITORS, a lista não está aprovada: pare e avise.`,
    `2. Para cada concorrente, um de cada vez, grave com PUT ${roundsUrl}/{roundId}/competitors/{nome}, com o nome passado por encodeURIComponent (nomes com ponto e vírgula, ponto, barra ou espaço quebram o endereço sem isso). O servidor compara o nome sem diferenciar maiúsculas e sem espaços nas pontas.`,
    '   O corpo é {"profile": {...}, "categories": [...], "clusters": [...], "comparisons": [...], "examples": [...], "folders": [...], "items": [...], "audiences": [...]}, com as 8 chaves sempre presentes (`[]` quando a lista do concorrente está vazia). `profile` é a entrada de `profiles` com `competitor` igual ao nome, sem o campo `competitor`; cada lista é a chave de topo de mesmo nome filtrada por `competitor` igual ao nome, com os itens sem o campo `competitor`.',
    '   Resposta 201: gravado. 400 VALIDATION_ERROR traz as chaves que faltaram: corrija e envie de novo. 404 COMPETITOR_NOT_FOUND quer dizer que o nome não é de um concorrente do projeto. 409 SEO_COMPETITOR_ALREADY_SAVED quer dizer que aquele concorrente já foi gravado nesta rodada: não envie de novo, siga para o próximo. 413 PAYLOAD_TOO_LARGE quer dizer que o corpo passou de 1 MB: confirme que está compacto, sem indentação nem texto repetido, e envie de novo.',
    `3. Para cada documento da Parte 2, grave com POST ${roundsUrl}/{roundId}/documents e o corpo {"title": "...", "fileName": "...", "about": "...", "body": "texto em Markdown"}. Se o corpo passar de 1 MB (413), divida o documento em dois, com títulos e \`fileName\` diferentes. 409 SEO_DOCUMENT_ALREADY_SAVED quer dizer que o documento já está na rodada: não envie de novo.`,
    `4. Confira com GET ${roundsUrl}/{roundId}: "status" "complete" ou "partial", a lista "missing" dos concorrentes que faltam e os "warnings". Na resposta final, diga só o que gravou, o "status", o "missing" e os "warnings" que vieram. Não escreva o JSON na conversa.`,
    'A rodada gravada não se edita nem se apaga: confira cada corpo antes de enviar.',
  ].join('\n')
}

function joinSections(sections: string[]): string {
  return sections.join('\n\n')
}

function buildResearchSections(): string[] {
  return [
    SEO_PROMPT_WORKING_RULES,
    SEO_PROMPT_COMPETITOR_STEPS,
    SEO_PROMPT_SEARCHES,
    SEO_PROMPT_DATA_RULES,
    SEO_PROMPT_RESULT_STRUCTURE,
    SEO_PROMPT_CHECKLIST,
  ]
}

export function buildSeoPrompt({ projectId, apiUrl }: PromptInput): string {
  const projectUrl = `${apiUrl}/projects/${projectId}`

  return joinSections([
    SEO_PROMPT_INTRO,
    buildProjectSection(projectUrl),
    '## Como trabalhar',
    ...buildResearchSections(),
    buildDeliverySection(projectUrl),
  ])
}

export function buildSeoCompletePrompt({
  projectId,
  apiUrl,
  roundId,
  missing,
}: CompletePromptInput): string {
  const projectUrl = `${apiUrl}/projects/${projectId}`
  const roundUrl = `${projectUrl}/seo/rounds/${roundId}`
  const missingLines = missing.map((name) => `- ${name}`).join('\n')

  return joinSections([
    `Você vai completar a rodada de SEO ${roundId} do projeto ${projectId}: ela já foi aberta e gravada pela API, e faltam concorrentes. Pesquise só o SEO do site público de cada concorrente que falta, no mesmo formato da rodada, e grave cada um nela. Não abra uma rodada nova, não grave de novo quem já está na rodada e não entre em nenhuma conta.`,
    [
      '## Concorrentes que faltam',
      `Leia a rodada com GET ${roundUrl}: "missing" lista os concorrentes sem dado, "market" é o mercado e "tool" e "collectedAt" são os da rodada. Leia também o nome e a descrição do projeto com GET ${projectUrl}, e os concorrentes com GET ${projectUrl}/competitors, para saber o site e o papel de cada um.`,
      'Na hora em que este prompt foi copiado, faltavam:',
      missingLines,
      'Se a lista de "missing" da API for diferente, vale a da API. Use o "name" exatamente como veio, letra por letra.',
    ].join('\n'),
    '## Como trabalhar',
    ...buildResearchSections(),
    [
      '## Como entregar',
      `Para cada concorrente que falta, um de cada vez, grave com PUT ${roundUrl}/competitors/{nome}, com o nome passado por encodeURIComponent (nomes com ponto e vírgula, ponto, barra ou espaço quebram o endereço sem isso). O servidor compara o nome sem diferenciar maiúsculas e sem espaços nas pontas.`,
      'O corpo é {"profile": {...}, "categories": [...], "clusters": [...], "comparisons": [...], "examples": [...], "folders": [...], "items": [...], "audiences": [...]}, compacto, com as 8 chaves sempre presentes (`[]` quando a lista está vazia). `profile` é a entrada de `profiles` com `competitor` igual ao nome, sem o campo `competitor`; cada lista é a chave de topo de mesmo nome filtrada por `competitor` igual ao nome, com os itens sem o campo `competitor`.',
      'Resposta 201: gravado. 400 VALIDATION_ERROR traz as chaves que faltaram: corrija e envie de novo. 409 SEO_COMPETITOR_ALREADY_SAVED quer dizer que o concorrente já está na rodada: não envie de novo. 413 PAYLOAD_TOO_LARGE quer dizer que o corpo passou de 1 MB: confirme que está compacto e envie de novo.',
      `Os documentos (Parte 2) só entram se algum assunto novo se sustentar no que você leu agora: grave com POST ${roundUrl}/documents e o corpo {"title": "...", "fileName": "...", "about": "...", "body": "texto em Markdown"}. Não repita um documento que a rodada já tem.`,
      `No fim, confira com GET ${roundUrl}: "status", "missing" e "warnings". Na resposta final, diga só o que gravou e o que a API ainda mostra em "missing" e em "warnings". Não escreva o JSON na conversa.`,
    ].join('\n'),
  ])
}
