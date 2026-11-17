---
name: sem-nivel-0
description: 'Executa uma task longa mantendo o nível 0 limpo. Você não investiga, não lê arquivo de projeto, não interpreta o pedido, não escreve em disco e não acumula estado: você dispara o orquestrador O1 com a descrição verbatim e daí em diante só encaminha, usando três tools e nenhuma outra (Agent, AskUserQuestion, SendMessage). A pasta da run em .claude/tmp/orquestracoes/ é dos orquestradores: O1 a cria e quem estiver rodando a mantém. O gate de ambiguidade é do O1, que reconhece o código e volta com um bloco de perguntas já no schema da AskUserQuestion, para você perguntar e devolver as respostas. Todo subagente da cadeia, orquestrador ou filho de trabalho, obedece aos mesmos três tetos, sem exceção — 140k de janela, 50 rodadas de uso de tools e 45 minutos, medidos por ele mesmo. Quando um orquestrador chega num deles, ele escreve o estado num handoff em disco e devolve o spawn do sucessor; você copia três campos e dispara O2, O3, sem nunca abrir o arquivo. O que o usuário disse e o que a cadeia estabeleceu ao longo da sessão vive numa memória da sessão em disco, que vale para toda run: o único estado que você carrega é o caminho dela, copiado do campo memoria: do último bloco e passado a todo O1 novo. Use quando a task não cabe em uma janela só: migração ampla, auditoria, refatoração de muitas rodadas, execução longa de ponta a ponta.'
disable-model-invocation: true
---

# Task longa sem sujar o nível 0

## Overview

Um subagente é descartável. Ele nasce, suja a janela, entrega e morre. O nível 0 não é: o
contexto dele é relido em todo turn da task inteira e nada nunca sai de lá. O arquivo que você
abriu "só para conferir", o retorno de cada filho, o plano que passou por você: tudo isso segue
cobrando até o fim, e no estouro é o nível 0 que trava, não os filhos.

Então esta skill tira você do caminho. Quem pensa é um **orquestrador**, que é um filho: ele
investiga, dispara os próprios filhos, acumula o estado da task e, quando a janela dele acaba,
escreve esse estado em disco e é **substituído** por um sucessor fresco. Você é o **relay**
entre um orquestrador e o próximo, e o bastão nunca para na sua mão.

```text
usuário → nível 0        dispara O1 com o pedido cru. Nada em disco.
            └→ O1        mkdir da pasta → reconhece → volta com bloco: perguntas
          nível 0        AskUserQuestion → SendMessage com as respostas verbatim
            └→ O1        rodada 1 (filhos) → rodada 2 (filhos) → escreve handoff-1.md
          nível 0        no mesmo turn, copia 3 campos do retorno. Não abre o handoff.
            └→ O2        recebe só o caminho → rodada 3 → ... → relatorio-final.md
          nível 0        repassa o relatório ao usuário
```

O que você paga por orquestrador é uma linha de spawn. O estado da task inteira vive em disco e
na janela de quem é descartável.

## A memória da sessão

Numa sessão longa, cada mensagem nova do usuário depois de um `bloco: fim` vira uma run nova, com
O1, pasta e `briefing.md` próprios, e o O1 novo recebe só a mensagem nova. Sem mais nada, o que o
usuário disse na primeira run ("só casos depois de 28/10 16:00Z", "só o formato X") não chega à
décima, e o que a cadeia fez na terceira (o commit, a branch, a migração) a sétima não sabe. Na
sessão `revisao-casos-reprocess-prod` foram 36 runs, o corte de data apareceu no briefing de 9 e
as outras 27 trouxeram de volta justamente os casos que ele excluía. O usuário repetiu a frase
quatro vezes.

O conserto é um arquivo que vale para a sessão inteira, e não para uma run: a **memória da
sessão**. Ela guarda fatos, datados e só acrescentados: o que o usuário disse, literal, e o que a
cadeia estabeleceu (commit, branch, resultado). Ela não guarda regra: nenhum orquestrador
transforma um pedido em proibição. O primeiro O1 da sessão a cria. Todo orquestrador a lê antes
de trabalhar, acrescenta o que chegar, repassa o caminho dela a cada filho e presta contas dela
no relatório final.

A sua parte é uma só: **carregar o caminho.** Todo bloco que um orquestrador devolve traz o campo
`memoria:`. Você guarda o valor do último bloco, como guarda o `agentId`, e o põe em todo
disparo de O1 novo. Você não abre o arquivo, não escreve nele e não decide o que entra: é um
campo copiado, e não um resumo seu do que o usuário quer.

## Esta skill inverte a regra de ler os arquivos referenciados

A regra usual — e o `CLAUDE.md` de vários repos — manda ler os arquivos que um `SKILL.md`
referencia. **Aqui, não.** Os caminhos citados abaixo são endereços que você entrega aos
filhos, e o conteúdo deles é
exatamente o que não pode entrar na sua janela:

- `prompts/orquestrador.md` é leitura do orquestrador.
- `formats/arquivos-da-run.md` e `scripts/medir-janela.sh` são leitura dele também.
- `prompts/teto-filho.md` e `prompts/executor.md` são leitura dos filhos que o orquestrador
  dispara.

Este arquivo é o único que você lê nesta skill.

## Qual `subagent_type`

Use **`orquestrador-cadeia`** quando esse nome aparece na lista de agentes disponíveis do seu
contexto, e `general-purpose` quando não aparece. O agente (`.claude/agents/orquestrador-cadeia.md`)
fixa `model: sonnet` e o TTL de cache de 1h (`experimental.cacheTtl`). Um orquestrador passa de 20 a
45 min parado esperando filho, e com o TTL padrão de 5 min cada despertar regravava o contexto
inteiro. A lista de agentes é lida na abertura da sessão: agente criado depois só aparece numa
sessão nova.

## O que você faz, e só isso

1. Dispara O1 com a descrição do usuário verbatim e o caminho da memória da sessão, quando ela
   já existe.
2. Encaminha: `perguntas` vira `AskUserQuestion` e a resposta volta por `SendMessage`, handoff
   vira spawn do sucessor, mensagem do usuário no meio vira `SendMessage` para o orquestrador
   da vez.
3. Repassa ao usuário, verbatim, o texto que o orquestrador escreveu para ele.

Três tools, e nenhuma outra: `Agent`, `AskUserQuestion`, `SendMessage`.

Guardrails, porque cada um destes já custou uma task na prática:

- **Nenhuma leitura de arquivo.** Nem o handoff, nem o briefing, nem o plano, nem o log. Nem
  `Read`, nem `cat`, nem `Grep`, nem `Glob`, nem `Explore` "para dar uma olhada".
- **Nenhuma escrita.** Nenhum arquivo do projeto, nenhum arquivo da run, e nem o `mkdir` da
  pasta: quem cria e mantém a pasta é o orquestrador da vez, que é quem sabe o que vai dentro
  dela.
- **Nenhum comando**, e não é só comando de projeto: nada de `git`, lint, build, teste, `curl`,
  `date`, `ls`. Você não usa `Bash` nesta skill.
- **Nenhum resumo do que o filho fez.** O retorno dele já está na sua janela; repasse os campos,
  não reescreva o conteúdo.
- **Nenhuma reescrita do retorno.** O texto que antecede o bloco vai ao usuário verbatim. Você
  não reformata, não traduz para outro formato (passo a passo, diagrama, tabela, "linguagem
  simples"), não acrescenta análise, ressalva ou "ponto que o orquestrador não comentou". O
  máximo que você faz é omitir o próprio bloco final e trocar um id interno, se houver. Dois
  motivos. O retorno já entrou na sua janela, que nunca esvazia: a versão reescrita entra de
  novo, junto com o raciocínio que a produziu, e numa run de trinta idas e voltas isso sozinho
  levou o nível 0 a 112k. E a análise é de quem leu o código: ressalva sua é palpite sobre um
  repo que você não abriu.
- **Nenhum conserto de formato.** Preferência de formato ou estilo do usuário ("explique
  visual", "passo a passo", "sem jargão") é instrução para o orquestrador, não para você. Ela
  vai verbatim na task de O1 ou por `SendMessage` ao orquestrador da vez, e quem cumpre é ele.
  Se a resposta veio fora do formato pedido, devolva por `SendMessage` pedindo o formato; não
  reescreva você mesmo.
- **Nenhum comentário seu sobre o retorno.** Se algo nele parece duvidoso ou contraditório, você
  não responde nem comenta por conta própria: repassa o retorno verbatim e, se quiser, manda a
  dúvida ao orquestrador por `SendMessage`. Quem resolve é quem pode abrir o arquivo.
- **Nenhuma pergunta de sua autoria.** A pergunta que chega ao usuário foi escrita por um
  orquestrador, que leu o código. Você repassa; não reformula, não acrescenta, não corta.

## O gate não é seu

Você é o único agente da cadeia que alcança o usuário, e o pior colocado para saber o que
perguntar: você não leu o repo, não vai ler, e pergunta feita no escuro sobre código que você
nunca abriu vira premissa errada herdada pela task inteira. Pior, para perguntar bem você teria
que investigar, e investigar é exatamente o que a sua janela não pode pagar.

Então o gate desce. O1 recebe o pedido cru, gasta uma rodada de filhos read-only reconhecendo o
terreno, e volta com `bloco: perguntas` — só as dúvidas que o código não respondeu, já no
formato da tool. Metade do que parecia ambíguo morre nessa leitura, e o que sobra é pergunta que
valia a interrupção.

Consequência prática: **não interprete o pedido.** Não preencha lacuna, não normalize o texto,
não decida escopo "para adiantar". A descrição do usuário vai verbatim para O1, e a primeira
pergunta ao usuário sai de lá.

## Etapa 1 — disparar O1

```text
subagent_type: 'orquestrador-cadeia'   # ou 'general-purpose' se ele não estiver listado
model: 'sonnet'
description: 'orq-{slug}-o1'
run_in_background: false
prompt:
  Você é o orquestrador O1. Leia .claude/skills/sem-nivel-0/prompts/orquestrador.md e siga.

  Slug desta run: {slug}
  Memória da sessão: {o campo memoria: do último bloco desta sessão, ou "nenhuma"}
  Task, como o usuário descreveu: {a descrição dele, verbatim}
```

O `{slug}` é kebab-case, curto, tirado da task: `migrar-tsup`, `auditar-permissoes`. É rótulo,
não decisão: ele entra no `description` e na pasta que O1 cria, e é a única coisa que você
deriva do pedido. O caminho da pasta, a data e o que vai dentro são problema de O1.

A `Memória da sessão` é `nenhuma` só na primeira run da sessão, e quando o usuário pede
explicitamente para começar do zero ("memória nova", "esquece o que eu disse antes"). Em
qualquer outro caso vai o caminho do último bloco, mesmo que a task nova pareça não ter nada a
ver com as anteriores: quem decide se um fato importa é o orquestrador, que lê a memória.
Se o usuário passar um caminho de memória no pedido, use esse.

Quatro coisas neste disparo não são negociáveis:

1. **O prompt é ponteiro, nunca conteúdo.** Você passa o caminho de
   `prompts/orquestrador.md`; o orquestrador abre. Um `@caminho` dentro do parâmetro `prompt`
   da tool `Agent` não expande (a expansão de `@` acontece na entrada do usuário no CLI), então
   o filho recebe texto e lê o arquivo por conta própria, que é o que você quer. Se expandisse
   seria pior: o arquivo inteiro entraria na **sua** janela ao montar a chamada.

2. **`model` explícito, sempre `sonnet`.** Disparo sem `model` herda o modelo do pai. Os
   orquestradores desta skill são somente `sonnet`: O1 nasce em `sonnet` e todo sucessor também,
   qualquer que seja o `model` do bloco de handoff (se vier outro valor, dispare em `sonnet` mesmo
   assim). Quem decide `haiku` para um filho mecânico é o orquestrador, nunca o nível 0, e é ele
   quem refaz em `sonnet` a entrega `haiku` reprovada (`prompts/orquestrador.md`, "Modelos").

3. **`description` único e estável.** Ele é o endereço pelo qual o filho mede a própria janela.
   `orq-{slug}-o{n}` para orquestrador.

4. **A memória vai sempre que existe.** Disparo de O1 sem a linha `Memória da sessão` é o
   defeito que esta seção existe para evitar: o O1 novo trabalha sem o que o usuário já disse.

## Etapa 2 — encaminhar

Todo orquestrador termina o retorno com um bloco de 4 a 7 linhas. É a sua instrução, e é a única
parte do retorno que você usa. Guarde o `agentId` de quem está rodando e o valor do campo
`memoria:`, que vem em todo bloco.

### `bloco: handoff`

```text
bloco: handoff
handoff: .claude/tmp/orquestracoes/2026-08-21-migrar-tsup/handoff-1.md
proximo: O2
model: sonnet
description: orq-migrar-tsup-o2
memoria: .claude/tmp/orquestracoes/memorias/2026-08-21-migrar-tsup.md
motivo: janela 128k, projeção passa de 140k, faltam 3 pacotes
```

Copie `description` e `handoff` para um disparo novo (o `model` é sempre `sonnet`). A memória
não entra neste disparo: o handoff já aponta para ela.

```text
subagent_type: 'orquestrador-cadeia'   # ou 'general-purpose' se ele não estiver listado
model: 'sonnet'
description: '{description do bloco}'
run_in_background: false
prompt:
  Você é o orquestrador {proximo}. Leia .claude/skills/sem-nivel-0/prompts/orquestrador.md e siga.
  Handoff do seu antecessor: {handoff do bloco}
```

O sucessor recebe **um caminho**, e nada mais. Ele reconstrói o resto lendo o disco. Você não
abre o handoff, não o resume e não acrescenta contexto "para ajudar": o que você acrescentaria
é justamente o que o antecessor já escreveu no arquivo.

Ao usuário, uma linha: o `motivo` e qual orquestrador assumiu.

### `bloco: fim`

O relatório final já veio no retorno, escrito pelo orquestrador para o usuário. Repasse o texto
que antecede o bloco verbatim, mais o caminho que veio no campo `relatorio:`, e pare. Sem
reescrita, sem reformatação, sem comentário seu antes ou depois: se o formato não é o que o
usuário pediu, a correção é `SendMessage` ao orquestrador, não edição sua. Não comite e não dê
push: isso é decisão do usuário.

Guarde o `memoria:` do bloco. Se o usuário mandar outra mensagem depois do `fim`, ela é uma run
nova: O1 novo, slug novo, e essa mesma memória no disparo.

### `bloco: perguntas`

```text
bloco: perguntas
rodada: 1
memoria: .claude/tmp/orquestracoes/memorias/2026-08-21-migrar-tsup.md
motivo: reconhecimento fechado, 2 dúvidas travam a rodada 1
perguntas: [
  {"question": "A migração cobre o pacote com plugin custom?", "header": "Escopo",
   "multiSelect": false,
   "options": [{"label": "Deixar de fora (recomendada)", "description": "..."},
               {"label": "Migrar com shim", "description": "..."}]}
]
```

O array já vem no schema de `AskUserQuestion`. Copie para o parâmetro `questions` **verbatim**:
não reescreva pergunta, não troque opção, não corte descrição e não acrescente uma opção
"Outro" — a tool já oferece.

`AskUserQuestion` aceita 4 perguntas por chamada. Se vierem mais, faça chamadas consecutivas de
até 4 **no mesmo turn**, na ordem em que o orquestrador mandou, e junte tudo numa `SendMessage`
só. Uma rodada de pergunta que vira três turns no nível 0 custa mais que a rodada de trabalho
que ela destrava.

Devolva para o `agentId` do orquestrador, com o prefixo literal na primeira linha e depois uma
linha por par, resposta verbatim — incluindo o texto livre, se o usuário escolheu "Outro":

```text
[resposta do usuário ao AskUserQuestion, verbatim]
{pergunta}: {resposta}
```

Ele retoma de onde parou, com a janela que já tem. Um orquestrador pode voltar com `perguntas`
mais de uma vez, e O2 ou adiante também pode: quando o `motivo` nomeia uma ação destrutiva ou
externa, é pedido de autorização, e o tratamento é o mesmo. Perguntar e devolver, nada além.

### Retorno sem bloco

`SendMessage` para o `agentId`: *"feche com o bloco `handoff`, `fim` ou `perguntas` do
`prompts/orquestrador.md`"*. Não deduza o campo que faltou, e não abra arquivo para descobrir.

Bloco sem o campo `memoria:` recebe o mesmo tratamento: `SendMessage` pedindo o campo, e só então
você encaminha. Não reaproveite um caminho antigo nem siga sem ele: o próximo O1 sairia sem o que
o usuário já disse.

### Mensagem do usuário no meio da run

Repasse verbatim por `SendMessage` para o orquestrador da vez, começando com o prefixo literal
`[mensagem do usuário, verbatim]` e o texto dele logo depois. Se ela muda o escopo, diga isso na
mensagem, fora do trecho verbatim, e deixe ele decidir o que fazer com as rodadas pendentes.
Pedido de formato ou estilo de resposta vai pelo mesmo caminho, e quem passa a cumprir é ele. O
que a mensagem disser ("daqui pra frente só X") também: quem registra na memória é o
orquestrador, não você.

Os dois prefixos existem porque o que você manda chega ao orquestrador como `SendMessage`, sem
dizer quem escreveu, e ele não tem outro jeito de distinguir o usuário de um agente: sem a marca,
ele trata a autorização do usuário como fala de agente e recusa a ação que o usuário liberou.
Use-os só em texto do usuário, nunca numa observação sua.

Ao usuário, enquanto o orquestrador trabalha, uma linha curta: *"Repassei ao orquestrador; trago
a resposta quando ele terminar."* Não reexplique o pedido dele: ele acabou de escrevê-lo.

## Disparo é síncrono, e a espera é de graça

Todo disparo leva `run_in_background: false`. Isso não trava nada: a tool `Agent` retorna na
hora com um id, o filho roda em background e a notificação de conclusão chega sozinha. O padrão
correto, **enquanto o filho roda**, é encerrar o turn.

- **Não sonde.** Nada de `TaskOutput` ou `Monitor` em loop esperando o orquestrador.
- **Não durma.** Nada de `sleep`, `true`, `echo .`, `date` ou um `ls` repetido para passar o
  tempo. Cada um é um turn pago que não produz nada, e turn pago no nível 0 relê a janela
  inteira.
- **Não crie agente de espera.** Nenhum fork ou placeholder cujo propósito seja aguardar outro.
  Um fork herda o contexto inteiro do pai e roda no modelo do pai: é a forma mais cara possível
  de não fazer nada.

**Todo subagente tem teto: 140k de janela, 50 turns e 45 min**, em todos os níveis, sem exceção. Você
não mede nem fiscaliza isso: o orquestrador mede a si mesmo e põe o teto no prompt de cada filho
que dispara. A sua parte é só uma: todo disparo seu é de orquestrador, e o prompt dele aponta
para `prompts/orquestrador.md`, que é onde os tetos vivem.

**Profundidade máxima é 3**: nível 0 → orquestrador → filho de trabalho. O filho não
sub-delega, e o orquestrador não dispara outro orquestrador (a substituição passa por você, é
o que mantém a cadeia viva quando um deles morre).

## O bastão volta no mesmo turn

Encerrar o turn é o padrão enquanto o filho roda. Quando o retorno dele entra na sua janela o
padrão inverte: o bloco é a sua vez, e a sua vez é agora. Leia o campo `bloco:` e execute a ação
dele no mesmo turn em que o retorno chegou. `handoff` vira o disparo do sucessor, `perguntas` vira
`AskUserQuestion`, `fim` vira o relatório ao usuário.

Turn que fecha com bloco pendente mata a cadeia em silêncio. O orquestrador que devolveu o handoff
já morreu, o estado dele está em disco e não existe mais ninguém para disparar o sucessor: a task
fica parada até o usuário perguntar por que parou, e a janela que ele pagou não rendeu nada.

O gatilho é o retorno, não a mensagem do usuário. Quando o turn seguinte abrir com uma
system-reminder, com a notificação de conclusão do filho ou com "Continue from where you left
off", a continuação é o bloco pendente, e a resposta a ele é o disparo. "No response requested"
cabe quando o último bloco da sua janela já foi encaminhado.

## Requirements

- O nível 0 usa `Agent`, `AskUserQuestion` e `SendMessage`, e nenhuma outra tool. Não lê, não
  escreve, não roda comando: a pasta da run é criada por O1 e mantida por quem estiver
  orquestrando.
- Todo disparo leva `subagent_type: 'orquestrador-cadeia'` (ou `general-purpose`, se ele não
  estiver listado), `model` e `description` explícitos, e `run_in_background: false`.
- O prompt de um disparo é ponteiro mais delta curto. Nunca corpo de prompt, nunca conteúdo de
  arquivo.
- Você não escreve pergunta. O gate é do orquestrador: o que chega ao usuário é o array de
  `bloco: perguntas`, repassado verbatim, em lotes de até 4 no mesmo turn.
- A cadeia de orquestradores é O1 → O2 → O3, cada um disparado por você com o caminho do
  handoff do antecessor.
- Todo O1 depois do primeiro da sessão leva a linha `Memória da sessão` com o `memoria:` do
  último bloco. O único estado que você carrega entre runs é esse caminho; o conteúdo dele você
  não lê, não resume e não completa.
- O texto do retorno que antecede o bloco vai ao usuário verbatim. Você não reescreve, não
  reformata, não traduz para outro formato e não acrescenta análise ou ressalva. Formato fora do
  pedido ou dúvida sobre o conteúdo voltam ao orquestrador por `SendMessage`.
- Preferência de formato ou estilo do usuário é instrução para o orquestrador, repassada
  verbatim; quem cumpre é ele.
- Resposta do `AskUserQuestion` e mensagem do usuário vão ao orquestrador com o prefixo de
  origem (`[resposta do usuário ao AskUserQuestion, verbatim]`, `[mensagem do usuário, verbatim]`),
  e só texto do usuário leva prefixo.
- Enquanto o orquestrador trabalha, a sua mensagem ao usuário é uma linha curta, sem reexplicar
  o pedido.
- Bloco na sua janela é encaminhado no mesmo turn. Um turn seu só fecha com a janela sem bloco
  pendente.
- Nada de fork, agente de espera, sondagem, `sleep` ou chamada no-op.
- Sem commit e sem push.

## Example

```text
Usuário: /sem-nivel-0 migrar os 9 pacotes de rollup para tsup e provar cada build

Nível 0:
  E1  dispara orq-migrar-tsup-o1 (orquestrador-cadeia, sonnet) com o slug, "Memória da
      sessão: nenhuma" e a task verbatim
      → O1 cria .claude/tmp/orquestracoes/2026-08-21-migrar-tsup/ e a memória da sessão
      → manda 2 filhos read-only mapearem os 9 pacotes
      → retorna bloco: perguntas, 1 pergunta (o pacote com plugin custom)
  E2  AskUserQuestion com a pergunta que O1 escreveu; resposta verbatim por SendMessage
      → O1 escreve briefing.md, migra 6 pacotes em 3 rodadas de filhos
      → retorna bloco: handoff, motivo "janela 128k, projeção passa de 140k, faltam 3 pacotes"
  E2  dispara orq-migrar-tsup-o2 (orquestrador-cadeia, sonnet) só com o caminho do handoff-1.md
      → O2 fecha os 3 pacotes restantes, roda a rodada de prova
      → retorna bloco: fim
  E2  repassa o relatório verbatim e o caminho que veio em relatorio:. Sem commit.

Usuário: agora faz o mesmo nos 4 pacotes de apps/, mas sem mexer no apps/legacy

Nível 0:
  E3  run nova: dispara orq-tsup-apps-o1 com o slug, "Memória da sessão:
      .claude/tmp/orquestracoes/memorias/2026-08-21-migrar-tsup.md" e a task verbatim
      → O1 lê a memória (a resposta sobre o plugin custom continua lá) e registra nela
        o pedido novo, com o "sem mexer no apps/legacy" literal

Janela do nível 0 no fim: ~20k, e nenhuma tool além das três. A task inteira passou por
3 orquestradores e 13 filhos.
```
