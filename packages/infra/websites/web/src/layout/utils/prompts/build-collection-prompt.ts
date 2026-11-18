type PromptInput = {
  projectId: string
  apiUrl: string
}

export function buildCollectionPrompt({ projectId, apiUrl }: PromptInput): string {
  const documentsUrl = `${apiUrl}/projects/${projectId}/documents`

  return [
    'Você está com o Claude Code aberto na pasta do repositório de um produto. Leia o repositório e grave, num app local de marketing, documentos com o que ele mostra sobre o produto. Esses documentos vão servir depois para criar conteúdo de marketing (SEO, Instagram, TikTok e outros canais): escreva para quem faz marketing, não para quem programa.',
    '',
    `Projeto no app: ${projectId}`,
    `Documentos do projeto: ${documentsUrl}`,
    '',
    '## Regras',
    '- Só leia o repositório. Não crie, não edite e não apague arquivos dentro dele; arquivo temporário fica fora da pasta, por exemplo em /tmp.',
    '- Grave só o que o repositório mostra. Não invente nem complete com suposição. O produto pode estar em fase inicial, sem clientes.',
    '- O README e as pastas de documentação e de contexto (como docs/ e .claude/) valem como fonte e ajudam a achar o que importa, mas podem descrever o que foi planejado e ainda não existe. Toda afirmação que dá para conferir no código (feature, limite, prazo, papel, integração, plataforma), confira no código: se divergir, vale o código; se não achar no código, deixe de fora. O que o código não mostra, como a fase do produto, pode vir da documentação.',
    '- O que você não achou não vira afirmação sobre o produto: não escreva "sem site", "sem preços" ou "não tem app" só porque não encontrou. O que o produto não faz só entra quando o repositório diz isso, numa regra, numa mensagem ou na documentação. Nos documentos, não liste o que não encontrou; a única exceção é o documento de preços.',
    '- Grave só o detalhe que ajuda a falar do produto. Deixe de fora regras de formulário e de configuração, como tamanho mínimo de senha, limite de caracteres de um campo, validade de um código de verificação ou nomes que não podem se repetir, e funções que todo produto tem, como recuperar a senha.',
    '- Cada fato fica num documento só, o que trata do assunto. Um limite ou prazo gravado num documento não se repete em outro; se outro documento precisar dele, cite o título do documento em que ele está.',
    '- Não procure nem grave público-alvo, dores, proposta de valor, diferenciais, concorrentes, tom de voz, depoimentos ou números de clientes. Isso não fica no repositório e é coletado em outra etapa.',
    '- Escreva em português do Brasil, em linguagem de produto: o que a pessoa consegue fazer e o que acontece. Nada de caminho de arquivo, nome de função ou variável, código de erro, rota de API, comando ou endereço de desenvolvimento (localhost).',
    '- Nos documentos, não ponha seção de fontes, lista de onde você procurou nem o link do repositório.',
    '',
    '## O que gravar',
    '1. Visão geral do produto: o que é, onde roda (web, mobile, extensão) e em que fase está.',
    '2. Features principais e features secundárias, em dois documentos: o que cada uma permite fazer, em uma ou duas frases, sem limites nem prazos; esses números ficam só no documento do assunto.',
    '3. Preços e planos: valores, planos, limites por plano e período de teste que o repositório tiver. O repositório pode estar desatualizado, então abra o documento com "A confirmar: preços tirados do repositório, que pode estar desatualizado." e marque cada valor com "(a confirmar)". Se não houver nada, grave o documento só com "Não encontrado no repositório."',
    '4. Canais, links e ativos: domínio público, links de redes sociais e de lojas de apps, e-mail de contato, logo, cores e fontes da marca, imagens e vídeos de divulgação. Cite cada ativo pelo que ele é, sem caminho de arquivo. Deixe de fora o link do repositório, endereços de desenvolvimento e configurações internas.',
    '5. Palavras-chave de SEO: só as que já estão cadastradas no repositório (meta keywords, título e descrição das páginas públicas, listas de palavras-chave em configurações ou textos de SEO). Não tire palavras do vocabulário do produto. Se não houver nenhuma, não grave este documento.',
    '6. Documentos que você escolhe: um documento para cada assunto que o repositório explica e que ajuda a falar do produto com precisão. Por exemplo: a diferença entre os papéis de usuário (o que um membro e um admin podem fazer), regras de negócio, os fluxos principais de uso passo a passo, integrações, limites e o que o produto não faz (plataformas, navegadores, tamanhos, prazos). São exemplos, não uma lista a cumprir: crie só os que o repositório sustenta, quantos fizerem sentido, e diga em cada um o que aquilo significa para quem usa.',
    '',
    '## Como gravar',
    `Antes de começar, liste os documentos que já existem com GET ${documentsUrl}. Se um assunto já tiver documento, grave com o mesmo título.`,
    '',
    `Grave cada documento com PUT ${documentsUrl} e o corpo JSON {"title": "...", "description": "...", "body": "..."}.`,
    '- title: até 120 caracteres. O nome do assunto em linguagem simples, sem número na frente, por exemplo "Papéis: o que o membro e o admin podem fazer". Gravar de novo com o mesmo título atualiza o documento que já existe, sem criar cópia.',
    '- description: até 300 caracteres. Uma frase que diz o que o documento responde, para quem for ler decidir se precisa abri-lo.',
    '- body: o conteúdo em markdown, até 100.000 caracteres. Curto e direto.',
    '',
    'Monte o JSON com uma ferramenta que escape o texto (jq ou um script) e envie com curl -X PUT -H "Content-Type: application/json" --data @arquivo.json. A resposta 201 cria e a 200 atualiza; qualquer outra é erro: corrija e grave de novo.',
    '',
    'O app mostra primeiro o último documento gravado: grave a visão geral por último.',
    '',
    '## Resposta final',
    'Ao terminar, responda em até 8 linhas: os títulos dos documentos gravados e o que o usuário precisa confirmar, que são os preços que você achou e o que veio só da documentação, sem como conferir no código. Não peça para confirmar o que você já conferiu no código; se não houver nada a confirmar, diga só isso. Sem link do repositório, caminho de arquivo, comando, resposta da API ou relato de como você procurou.',
  ].join('\n')
}
