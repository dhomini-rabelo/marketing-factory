---
name: implementar-e-validar
description: >-
  Executes an already-approved plan acting only as an orchestrator, the
  autonomous half of the method: no question reaches the developer from
  start to finish. Level 0 never reads code, never edits a file and never
  runs a verification or test command itself — it receives the run folder
  that decidir-especificar-e-planejar left under .claude/tmp/orquestracoes/
  with spec.md and plano.md approved, and only dispatches subagents in
  sequence (implementation by plan checkpoints → pattern-and-code review
  every ~5 checkpoints and always on the last one → validation at the
  milestones the plan declared plus one full pass at the end, one tester per
  proof lane — curl, browser, teste, codigo → correction → adaptation of the
  future plan when the defect is in the plan rather than in the code →
  context-documentation sweep), keeping a
  short ledger in the same folder. No project fact is hardcoded: every
  command, unit, test convention, environment prerequisite and fixture
  mechanism comes from the project card (projeto.md) the planning skill
  left in the run folder, or is discovered at runtime by the child that
  needs it; a lane whose required card field reads "nenhum" is unavailable,
  never defaulted to a guess. Validation is per requirement — every RT-00N
  and every PR-00N of the spec, all mandatory, zero RT allowed — and level 0
  sums the verdict by AC-00N and CB-00N: an AC or CB is delivered when every
  RT and PR that cites it passed; the spec's 'Continua como hoje' lines are
  regression checks revalidated after every fix. After a passing validation,
  a context child sweeps the project's context docs with the context skill
  the card names. When the plan carries a prototype base, the
  implementer builds the screen from it and deletes the prototype folder
  in the last checkpoint, before the final validation. A
  wrong plan no longer kills the run: an adaptor reads the spec and rewrites
  the future checkpoints, always choosing the path that preserves the AC the
  developer approved. A task split into waves runs one wave per execution:
  the ondas.md in the folder says which is current, its files carry the
  -o{k} suffix, and the ceilings count per wave. Ambiguity that turns up
  becomes an assumed premise recorded in the final report; only external
  action interrupts. Each stage that changes a file commits its own work,
  and level 0 gives a single git push at the end. Every child measures its
  own two ceilings with scripts/medir-janela.sh: 140k of context window and
  50 turns. Sonnet in every execution role; only the adaptor pays Opus, and
  only on a complex task. This skill fires only on explicit request
  (disable-model-invocation: true) and coexists with whatever pipeline the
  repo already has — it neither deprecates nor replaces any of them, and
  letting the router pick between them by inference is the most likely
  failure mode of that coexistence.
  Use when the user asks for implementar-e-validar, /implementar-e-validar,
  or to implement a plan that /decidir-especificar-e-planejar delivered.
disable-model-invocation: true
---

# Orquestrar a implementação de um plano

## Overview

Você é **despachante, não executor**. O agente principal (nível 0) conduz a implementação inteira
sem tocar no código: dispara um subagente por etapa, anota o resultado em poucas linhas no ledger
e passa para a etapa seguinte.

Esta é a segunda metade do método:

- **`/decidir-especificar-e-planejar`** — decide, especifica, monta o roteiro e planeja com o dev.
  Entrega uma pasta de run com `spec.md`, `projeto.md`, `reconhecimento.md`, `roteiro.md` e
  `plano.md` aprovados.
- **`implementar-e-validar`** (esta skill) — pega isso e vai até o push, **sem fazer pergunta
  nenhuma**.

A spec e o plano que você recebe já foram lidos e aprovados pelo dev. É isso que autoriza esta
metade a rodar sozinha: o rumo foi combinado, então interromper agora só atrasa. Ambiguidade que
aparecer no caminho vira **premissa assumida**, registrada no ledger e reportada no fim.

O que muda em relação a executar um plano solto é que **existe um contrato para provar**. O
`spec.md` traz as `AC` e as `CB` (o que o dev espera, dentro e fora do caminho feliz), os `RT` (decisão
técnica; pode não haver nenhum) e as `PR` (como se mostra). Cada passo do plano cita o `RT` ou a `PR`
que implementa, e a run só fecha `entregue` quando todo `RT` e toda `PR` passou ou está declarado em
`## Desvios da spec`.

A razão de o nível 0 não executar é de custo, e é simples de enunciar:

```text
custo do nível 0 ≈ turns × contexto médio × preço do cache read
```

O contexto do nível 0 é relido a cada turn da task inteira. Tudo que entra nele — um arquivo lido
"só para conferir", a saída de um `tsc`, um diff — é pago de novo em todo turn seguinte. Por isso o
trabalho pesado vive **dentro** dos filhos, cujo contexto nasce e morre na etapa.

Esta skill **não sabe nada do repositório em que está rodando**: os comandos, as unidades e as
convenções saem do **cartão do projeto** que a skill de planejamento deixou em
`{pasta-da-run}/projeto.md`, não de um nome de unidade ou de pacote escrito aqui. Nenhum filho decide
por conta própria o que o cartão já responde.

### O que o nível 0 NUNCA faz

- Ler arquivo de código, plano, diff ou log de filho.
- Editar qualquer arquivo do projeto.
- Rodar o comando de verificação, o comando de teste, `curl`, build ou teste — e nenhum comando
  `git` além do `git push` único da Etapa 7.
- Chamar `Grep`, `Glob` ou `Explore` para "dar uma olhada rápida".

### O que o nível 0 faz, e só isso

1. Localiza a pasta da run e escreve o ledger (Etapa 0).
2. Dispara os subagentes, um por etapa, e anota o veredito de cada um.
3. Dispara a atualização da documentação de contexto, depois de o teste passar.
4. Dá o `git push` da branch, uma vez, no fim.
5. Entrega o relatório final ao dev.

> **Escrever o ledger é a única escrita permitida ao nível 0**, e ele nunca relê o que escreveu: o
> que ele precisa saber já está na notificação de conclusão do filho. Os commits são dos filhos;
> do nível 0 é só o push. Numa task em ondas há uma segunda escrita, de uma linha: marcar a onda
> como `implementada` no `ondas.md`, na Etapa 7.

---

## Autonomia: zero pergunta, com uma exceção

O `CLAUDE.md` deste repo manda usar `AskUserQuestion` quando há ambiguidade. Nesta skill essa
porta já foi fechada: as perguntas foram feitas na skill de planejamento, e o plano que saiu de lá
tem a aprovação do dev.

- **Você não pergunta nada.** Ambiguidade que aparecer no meio vira premissa assumida, registrada
  no ledger na seção `Premissas` e reportada no fim.
- **Nenhum filho pergunta nada.** Diga isso explicitamente em **todo** prompt de disparo: *"não
  chame `AskUserQuestion`; toda ambiguidade vira premissa assumida e documentada"*.
- **A única exceção é ação externa** não autorizada: publicar, enviar e-mail ou mensagem,
  cobrança. Aí você para e pergunta, mesmo no meio. Essas integrações são reais mesmo com o
  pré-requisito local — e o pré-requisito sobe na máquina, pelo gate da seção seguinte.

Se o plano estiver errado de um jeito que a implementação não consegue contornar, o caminho não é
perguntar: é **fechar como bloqueado** e devolver ao dev com o motivo. Um plano errado se corrige
na skill de planejamento, que é onde existe conversa.

---

## O pré-requisito de ambiente, e quem o confere

Uma prova precisa de mais do que código: precisa do serviço de que o código depende de pé — banco,
fila, storage, o processo que serve a rota. Qual é ele e o que o sobe está no campo
`pré-requisito de ambiente` do cartão do projeto, e é o cartão que manda, não a leitura que um
tester faz do plano.

Quem confere o pré-requisito é **o filho que vai executar**, nunca você:

- **Os testers de lane `curl`, `browser` e `teste` da Etapa 4**, na primeira chamada de cada um,
  antes de subir processo. A lane `codigo` não confere nada, porque a prova dela é estática.
- **O implementador**, só se a implementação precisar executar algo contra o serviço: uma migration
  do plano, um script de conferência, uma suíte que ele mesmo escreveu.

A ordem é **conferir antes de subir**. Serviço já no ar é serviço que se reusa: o filho checa o que
o cartão nomeia como pré-requisito, e só roda o comando de subida quando ele não está de pé.
Ninguém derruba nem recria o que já estava rodando — o serviço pode ser compartilhado com outra
sessão, e recriá-lo apaga o estado que a rodada anterior deixou. É isso que também faz a barreira
paralela funcionar: a primeira lane sobe, as outras duas encontram tudo pronto.

O pré-requisito sobe **na máquina**. Nenhum filho aponta o alvo para outro host, nem em leitura, e
**nenhum filho edita arquivo de configuração versionado** para conseguir isso: um retorno por
BLOCKER, `handoff` ou `preso` deixaria a árvore suja e os comandos seguintes apontando para o lugar
errado. Quando um comando ignora o override, passe a variável no próprio comando ou aponte-o para
uma cópia temporária fora do repositório. Se o campo `pré-requisito de ambiente` nomeia um serviço
remoto compartilhado, ou diz `nenhum` enquanto a suíte ou o ambiente exigem um serviço de pé, isso
é BLOCKER com o campo nomeado — não é uma decisão que o tester tome sozinho.

O veredito é uma linha, não prosa: **pré-requisito de pé, ou BLOCKER com o motivo.** BLOCKER aqui
não vira pergunta ao dev e não vira rodada de correção: não é o código que está errado, é a máquina
sem o serviço. O tester devolve BLOCKER com o motivo, você anota no ledger e a run fecha
**bloqueada**, sem push. Quando o cartão diz `pré-requisito de ambiente: nenhum` e nada exige
serviço, o filho escreve `pré-requisito: nenhum` no relatório e segue.

O que continua real com o serviço local são as **integrações externas** — e-mail, mensagem,
cobrança. É por elas que a exceção de autonomia da seção anterior existe.

---

## As fixtures são como o teste chega ao estado

Serviço de pé e vazio não prova quase nada: a maior parte das provas precisa de um sistema em algum
estado — a conta que já existe, o registro que já está no cenário que a prova exige, o arquivo que já foi importado.
Quem fabrica esse estado é o **mecanismo de fixtures** do projeto, e o campo homônimo do cartão diz
qual é o daqui, qual comando o roda e qual arquivo é o contrato dele. O plano que você recebeu já
traz o comando na linha `estado:` do `## Plano de teste`, e é ele que o tester roda, como está,
depois de o pré-requisito estar de pé.

A seção `## Fixtures` do plano responde o que esta run faz com o mecanismo, com um de quatro
vereditos:

- **`sincronizar`** — a task muda algo que o mecanismo fabrica, então ele muda junto. Passo de plano
  como qualquer outro, com uma exigência a mais: o arquivo que o cartão aponta como contrato do
  mecanismo sai no **mesmo commit** que a mudança de comportamento. Todo agente que usa o mecanismo
  lê esse arquivo e nenhum lê a implementação dele.
- **`estender`** — a prova precisa de um cenário que o mecanismo não alcança hoje, e o plano cria o
  que falta. Esses passos costumam ser um checkpoint próprio, e ele vem **antes** dos checkpoints
  que dependem dele: o estado do teste depende de a fixture existir.
- **`sem mudança`** — o que existe alcança o cenário. Nada a fazer.
- **`sem mecanismo`** — o projeto não tem nenhum. A linha `estado:` diz `nenhum`, o estado de
  partida é montado num passo do plano, e nenhum tester o monta na mão.

Quando o diff toca o mecanismo, ele entra nos gates do checkpoint como qualquer outro código: o
**comando de verificação** do cartão e, se o cartão disser como rodar um alvo só, o **comando de
teste** restrito a ele. Mudança em fixture que ninguém rodou é mudança que ninguém conferiu, e o
custo dela é a próxima task testando contra um estado que o produto já não produz.

---

## A validação é por `RT` e `PR`, e a `AC` e a `CB` fecham por soma

O `spec.md` tem listas que falam línguas diferentes. As `AC-00N` e as `CB-00N` são o que o dev
espera, escritas como ele as descreveria. Os `RT-00N` e as `PR-00N` são o que alguém prova, e cada um
aponta as `AC` e `CB` que atende. Todo requisito é obrigatório: não há prioridade, e `RT` escrito é
`RT` que vale.

**Os testers provam `RT` e `PR`.** É a única coisa que dá para provar: um requisito é concreto e
binário, e um tester que julgasse "o usuário espera mensagens claras" estaria dando opinião. Cada
tester devolve uma linha por requisito da lane dele, com o alvo copiado da linha do requisito na
spec. O alvo é o grupo entre parênteses que lista `AC`, `CB` ou `geral`, mesmo quando a linha traz
outros parênteses, como `(sem captura)` ou `(agente)`:

```text
RT-003 (AC-001) PASS
PR-003 (AC-001, AC-002, CB-005) FAIL — S05: aviso "Gerando o arquivo…" não aparece
```

Os vereditos possíveis são `PASS`, `FAIL`, `BLOCKER` e `n/d: {motivo}`. Não existe `PASS com
ressalva`: o requisito passou ou não passou.

Cada prova `S0n`/`T0n` do roteiro cita o requisito que serve: `S02 (PR-003; AC-002, CB-005)` ou
`S01 (RT-003)`. Numa lane `browser` ou `teste`, o requisito só dá `PASS` quando **todas** as provas
que o citam, na rodada em curso, deram `PASS`; uma prova em `FAIL` derruba o requisito, e o motivo
nomeia o id da prova. Uma `PR` de vídeo chega como vários `S0n` na ordem da interação, todos com a
mesma `PR` e o primeiro marcado `(era vídeo)`: o tester produz um PNG por `S0n` e dá o veredito da
`PR`. Não há gravação de vídeo.

**Você soma a `AC` e a `CB`.** Uma `AC` costuma ser servida por vários requisitos, às vezes em lanes
diferentes, então nenhum tester sozinho consegue fechá-la. Você tem as quatro lanes na mão, e a regra
é uma linha:

> Uma `AC` ou uma `CB` está entregue quando **todo** `RT` e toda `PR` que a citam passaram.

A `CB` só é provada por `PR`. Isso é aritmética sobre linhas que já estão no seu contexto, não
leitura de arquivo. Quatro coisas mudam a conta:

- **Requisito em `## Desvios da spec`** não conta contra a `AC`/`CB`. O dev viu o desvio no gate do
  plano e seguiu mesmo assim. Diga isso na linha: `entregue com desvio — {id} em Desvios`.
- **`n/d`** em algum requisito que a cita: `não verificada — {id}: {motivo}`.
- **FAIL ou BLOCKER restante**: `não entregue — {id} reprovou: {motivo}`.
- **`AC`/`CB` que nenhum requisito cita** nas linhas recebidas: `sem prova`. É defeito de
  planejamento; vai em ressalva e aponta `/decidir-especificar-e-planejar {pasta}`.

**Requisito `(geral)`** (`RT` ou `PR`) tem veredito próprio e entra na Etapa 5 como qualquer outro,
mas não entra na soma de `AC`/`CB`. No relatório e no ledger aparece numa linha `Geral` depois das
`AC` (`Geral   RT-001 PASS · PR-006 PASS`).

**Zero `RT` é válido**: a conta roda só com `PR`, a cobertura diz `0/0 RT`, e as lanes sem trabalho
não são disparadas.

**De onde vêm os ids de `AC` e `CB` sem abrir a spec.** A primeira linha de retorno do implementador
traz `spec: {N} AC · {N} CB · {N} RT · {N} PR · regressão: AC-00N, ... | nenhuma`, e você a copia no
cabeçalho do ledger. A soma fecha quando `entregues + com desvio + não verificadas + não entregues +
sem prova + pendentes = N AC` (idem para `CB`).

**Veredito da run:**

- `entregue`: todo requisito da onda `PASS` ou em Desvios declarado no plano, toda `AC`/`CB`
  `entregue` ou `entregue com desvio`, todo `(geral)` `PASS`.
- `entregue com ressalvas`: nenhum FAIL ou BLOCKER restante, mas há `AC`/`CB` `não verificada`,
  `AC`/`CB` `sem prova`, desvio criado por adaptação (Etapa 5.5) ou Etapa 6 `incompleta`.
- `bloqueado`: BLOCKER, 25 rodadas, 2 adaptações esgotadas ou contrato vazio.

**Por que a `AC` e não só o requisito.** `PR-003 reprovado` diz ao implementador o que consertar.
`AC-002 não entregue` diz ao dev o que ele não vai receber. São dois leitores, e o relatório final é
para o segundo.

---

## `Continua como hoje` é regressão

As `AC` da seção `### Continua como hoje` da spec são `AC` de regressão: o dev pediu que aquele
comportamento siga igual. Elas fecham pela mesma soma, pelas `PR` que as citam, e ganham três
tratamentos a mais:

1. **Lista no ledger.** Vem na linha `spec:` do primeiro retorno do implementador (`regressão: ...`).
2. **Revisor (Etapa 3.5).** Comportamento descrito numa linha de `Continua como hoje` que o diff do
   lote altera é **bloqueante**, mesmo sem `RT` citado.
3. **Revalidação.** Na rodada `n+1` depois de uma correção (Etapa 5) ou adaptação (Etapa 5.5), você
   redispara as lanes que reprovaram **e** toda lane que tem `PR` cujo alvo cita `AC` de regressão.
   É exceção explícita a "redispare só as lanes que reprovaram": o `PASS` de regressão expira quando
   o código mudou depois dele.

No relatório, cada `AC` de regressão leva o sufixo `(regressão)` na linha.

---

## Modelos por papel

Sonnet em todo papel de execução. Opus entra em um lugar só, e é o mesmo lugar da outra metade: o
raciocínio de plano de uma task complexa. Aqui esse papel é o adaptador, e ele herda a regra da
skill de planejamento — Sonnet quando a task é `simples`, Opus quando é `complexa`. O veredito de
dificuldade sai do `reconhecimento.md`, não do `plano.md` — o template do plano não tem seção de
dificuldade —, e chegou a você no retorno do implementador, que o leu na leitura dirigida do
reconhecimento (ver "O cartão do projeto é a entrada de fatos"). Sem `reconhecimento.md`,
`## Marcos de validação: nenhum` lê como `simples` e qualquer marco declarado lê como `complexa`.

| Papel | Modelo |
|---|---|
| Implementador | `sonnet` |
| Revisor | `sonnet` |
| Tester (curl, browser, teste ou codigo) | `sonnet` |
| Correção | `sonnet` |
| Adaptador | `sonnet` se `simples` \| `opus` se `complexa` |
| Atualizador de contexto | `sonnet` |
| Executor mecânico (rodar lista de comandos, laço de specs, repetição para taxa de flake) | `haiku` |
| Outro filho mecânico e checável (critérios abaixo) | `haiku` só se passar, senão `sonnet` |

**O executor mecânico é o papel fixo em `haiku`, e nunca julga.** Ele roda a lista que você
escolheu, grava a saída crua em arquivo e devolve contagem (`prompts/executor.md`,
`subagent_type: 'executor-mecanico'` quando o agente está listado, senão `general-purpose` com
`model: 'haiku'`). O tester `sonnet` da lane lê o arquivo dele e é quem julga se o caso prova o
`RT`. Na run `qualidade-gravacao` o tester da lane `teste` gastou 50 turns e $3,38 só rodando
~48 specs um a um; é esse laço que vai ao executor. A janela dele é **100k**, não 140k (acima de
100k de prompt o Haiku 5.5 cobra 5× no input e no output): `teto_janela=100000` na linha `TETO:`
do prompt dele. Voltou `parcial`, `preso` ou saída que não bate com a lista: continue num filho
`sonnet`.

**Todo disparo leva `model` explícito.** Disparo sem `model` herda o modelo do pai — que aqui é
Opus. Um implementador rodando em Opus por esquecimento custa várias vezes o orçamento da etapa e
não entrega nada a mais.

### Haiku nos filhos mecânicos e checáveis

Fora o executor, um filho só vai para `haiku` quando o brief passa nos três critérios. Falhou
um, ou ficou em dúvida, o filho é `sonnet` (a tabela acima continua o padrão).

1. **Brief fechado:** quem dispara já escolheu comando, padrão de busca e escopo; o filho não
   escolhe nem interpreta.
2. **Resposta em `arquivo:linha`, contagem ou saída crua**, sem prosa e sem veredito.
3. **Conferível de fora:** existe um critério verificável (a contagem bate com a lista do brief,
   cada `arquivo:linha` existe com o trecho citado, o arquivo de entrega existe e é o único criado).

O que muda no disparo e depois dele:

- **Escrita:** o prompt manda escrever só o arquivo de entrega (o piloto de 2026-11-03 viu um
  Haiku criar e apagar arquivo temporário contra a instrução) e leva `teto_janela=100000` na `TETO:`.
- **Conferência antes de confiar:** o nível 0 confere o retorno contra o brief (ids e contagem);
  o que exige abrir o arquivo (`arquivo:linha` com o trecho) é conferido pelo filho `sonnet` que
  consome a entrega e a devolve como `reprovada` se não bater.
- **Reprovou:** refaça **uma vez** em `sonnet`, com o mesmo brief e o mesmo arquivo de entrega, e
  anote no ledger (`log-implementacao.md`) `haiku reprovado em {papel}: {motivo}`. Não repita em `haiku`.

**Veredito por papel** (pelo prompt de cada um):

- **`codigo` (tester de código): não elegível.** Ele julga `PASS`/`FAIL` por requisito e escolhe o
  escopo da busca (diff para o que manda fazer, área inteira para o que proíbe), a decisão que mais
  erra segundo o próprio prompt. Só a busca com padrão e escopo literais, quando o plano os dá,
  é mecânica, e ela já é o executor.
- **`contexto` (atualizador de contexto): não elegível.** Ele decide se a mudança tornou a doc
  incorreta, escreve prosa no estilo do documento e comita; nenhum critério externo confere isso
  sem reler o diff.

Preço base: Haiku 5.5, até 100k / acima de 100k de prompt, em US$ por 1M tokens: input 0,10 /
0,50; output 0,50 / 2,50; cache read 0,01 / 0,05 (fonte: https://www.anthropic.com/claude-haiku-5-5,
lida em 2026-11-16; a página não traz cache de 1h nem batch). Derivado, contra Sonnet a 3/15:
1/30 até 100k, 1/6 acima, por turn.

---

## Dois tetos por filho: 140k de janela e 50 turns

Cada subagente mede a **própria** ocupação e para antes de virar problema. Os tetos são **140k de
janela** e **50 turns**, e o primeiro que estourar manda. O script corta 5 turns antes
do teto de turns (no 45), para o handoff ser escrito sem cruzar o 50.

Eles não são redundantes: medem riscos diferentes.

- **O teto de janela é segurança.** Previne o filho morrer no meio do trabalho. Dispara em quem
  tem `taxa` alta — um revisor que abre arquivo grande enche 140k em 20 turns.
- **O teto de turns é custo.** O gasto de um filho é a integral do contexto ao longo dos turns.
  Como a janela cresce quase linear, o custo cresce com o **quadrado** dos turns:
  `taxa × turns² / 2`. Um filho de 226 turns medido numa run real consumiu 37,3M de tokens — 49%
  da run inteira — e 82% do custo dele era releitura de contexto. Partido em 4 sucessores de ~56
  turns, o mesmo trabalho custaria 12,7M em vez de 31,3M, porque cada sucessor recomeça perto do
  zero.

E o teto de janela não cobre o caso do outro: um filho em laço de baixo rendimento (`taxa` ~300)
precisa de **~400 turns** para tocar 140k. São ~24M de tokens sem o teto de janela piscar uma vez.

O script está em `scripts/medir-janela.sh` e lê o transcript ao vivo do agente. Todo prompt de
filho carrega o bloco de medição — os arquivos em `prompts/` já o trazem inline, não remova.

**Como o filho se mede:**

```bash
.claude/skills/implementar-e-validar/scripts/medir-janela.sh --self
```

Saída em uma linha:

```text
janela=118539 teto=140000 pct=84 turns=33 teto_turns=50 taxa=1084 proj=145639 proxima=45 status=handoff fonte=self-mtime desc="..."
```

- **`status=ok`** — siga trabalhando, e meça de novo no turn indicado por `proxima`.
- **`status=handoff`** — pare de abrir frente nova, feche o que está na mão, escreva o estado no
  arquivo da etapa e retorne. Vem de janela cheia **ou** de 45 turns rendendo trabalho de verdade.
  O gatilho de janela dispara pela **projeção**, não pelo estouro: medir só o valor instantâneo já
  deixou agente passar de 250k sem nunca pedir socorro.
- **`status=preso`** — 45 turns ou mais com `taxa` abaixo de 400: muitos turns rendendo quase
  nada, que é assinatura de laço. **Pare e reporte**, sem fingir conclusão: escreva no arquivo da
  etapa o que fez, o que falta e no que você está travado, e retorne dizendo `preso`.

`preso` não é sinônimo de `handoff`, e é por isso que são dois status. Um sucessor que herda o
estado de um laço repete o laço, e o custo é pago duas vezes. O discriminador é a `taxa`, não a
janela: nos 15 filhos medidos, a `taxa` de quem produzia ficou entre 684 e 7.779 tokens por turn,
e laço de baixo rendimento gira em 200–300.

**Quando você recebe um retorno com `handoff`**, dispare um filho **fresco** da mesma etapa,
passando o caminho do arquivo que o anterior deixou em disco. Não tente continuar o agente
estourado por `SendMessage` — a janela dele é o problema.

**Quando o retorno vem com `preso`**, não relance por reflexo. Leia o motivo no retorno (dez
linhas, não o arquivo) e decida:

- **Progresso real, só longo** — dispare o sucessor fresco como num `handoff`.
- **Laço de verdade** (mesmo comando repetido, gate que não passa, dependência que não sobe) — a
  etapa está bloqueada. Registre no ledger e feche a run como bloqueada. Relançar sem mudar nada
  paga o mesmo laço de novo.

**Nenhum papel sobe o teto.** Um tester com muitos casos curtos, por exemplo, mede `taxa` de quem
produz e por isso recebe `handoff`, não `preso`: o sucessor fresco retoma pelos casos que faltam.

Se o `--self` errar o alvo (o `desc=` impresso não é o filho), meça com o `description` do spawn
como nonce: `medir-janela.sh "<description>"`. Por isso **o `description` de todo disparo deve ser
único e estável** — ele é o endereço da medição.

---

## Disparo: síncrono, sem sondagem, sem agente de espera

Todo disparo usa `run_in_background: false`.

Isso **não** trava a chamada: a tool `Agent` retorna na hora com um id e o filho roda em
background. O padrão correto é **encerrar o turn** — a notificação de conclusão chega sozinha.

Daí saem três proibições:

1. **Não sonde.** Nada de `TaskOutput` ou `Monitor` em loop esperando o filho.
2. **Não durma.** Nada de `sleep`, `true`, `echo .`, `date` ou um `ls` repetido "para passar o
   tempo". Cada um é um turn pago que não produz nada.
3. **Não crie agente de espera.** Nenhum fork, placeholder ou subagente cujo propósito seja
   aguardar outro. Um fork herda o contexto inteiro do pai e roda no modelo do pai — é a forma
   mais cara possível de não fazer nada.

**Barreira paralela sai de graça**: para rodar dois filhos em paralelo, faça as duas chamadas
`Agent` na mesma mensagem. As duas disparam no mesmo turn e cada retorno chega por notificação
própria. É barreira sem nenhum agente de espera.

**Profundidade máxima é 3** (nível 0 → etapa → nada). Nenhum agente de trabalho sub-delega.

---

## Commits durante a run, um push no fim

A run não termina com a árvore suja: **cada etapa que muda arquivo comita o próprio trabalho**, e o
nível 0 dá um único `git push` no fim.

Quem comita é quem editou, pela mesma razão que rege o resto da skill: o commit precisa da lista de
arquivos e do porquê da mudança, e isso só existe dentro da janela de quem fez o trabalho. O nível
0 comitando às cegas cairia num `git add -A` — que varre arquivo sujo alheio à run — e numa
mensagem genérica.

| Etapa | Quem comita | Mensagem |
|---|---|---|
| E3 implementação | implementador | `{tipo}({escopo}): {o que a task entrega}` |
| E3.5 e E5 correção | implementador | `fix({escopo}): {o que o review ou o teste apontou}` |
| E6 documentação | atualizador de contexto | `docs: {a regra ou o fluxo que passou a constar}` |

Regras que valem para todo commit da run:

- **`git add` por caminho, nunca `git add -A`.** A árvore pode ter mudança anterior à run, e ela
  não é da task. Cada agente adiciona só os arquivos que ele mesmo alterou.
- **A mensagem segue o histórico do repo**, descoberto com `git log --oneline -25` antes do
  primeiro commit — não uma convenção fixa. Sem padrão legível no histórico, o fallback é
  conventional commit (`feat:`, `fix:`, `refactor:`, `docs:`), e isso vira uma linha em
  `Premissas`.
- **Uma rodada, um commit.** Cada rodada de correção fecha com o commit dela, e é isso que faz o
  histórico contar o que a orquestração fez.
- **Gate vermelho não comita.** O implementador comita depois de o **comando de verificação** do
  cartão passar, nunca antes.
- **A pasta da run não entra.** `.claude/tmp/` está no `.gitignore`, então nenhum `plano.md` ou
  `review-{n}.md` vira commit.
- **Etapa que não muda arquivo não comita.** Review e teste não produzem commit — o que eles
  escrevem mora na pasta ignorada da run.
- **Branch.** A run comita na branch em que a sessão já está. O implementador descobre a branch
  default com `git symbolic-ref --short refs/remotes/origin/HEAD` (fallback:
  `git remote show origin`; sem remoto, compara com o que `git branch --list` mostra como
  principal). Se a sessão está nela, ele cria a branch da task antes do primeiro commit — o nome
  segue o padrão que `git branch -a` mostrar, e sem padrão visível o fallback é `task/{slug}` — e
  devolve o nome no retorno; é para essa branch que o push da Etapa 7 vai. Sem branch default
  identificável, ele comita na branch corrente e diz isso no retorno.

### A base da run, e por que o revisor precisa dela

Com a Etapa 3 comitada, um `git diff` seco volta vazio e o revisor não veria nada. Por isso o
implementador registra, **antes da primeira edição**, o `git rev-parse HEAD` da run na seção
`Base da run` do `implementacao.md`. O revisor lê essa base no arquivo e diffa contra ela, o que
lhe entrega o trabalho inteiro da run — comitado e não comitado — numa saída só.

### O push (Etapa 7)

Um `git push` só, no fim, feito pelo nível 0:

```bash
git push -u origin HEAD
```

É a única exceção à regra de o nível 0 não rodar `git`, e ela se paga: a saída cabe em duas linhas,
e um subagente só para isso custaria um spawn inteiro.

**Task bloqueada não sobe.** Se a run fechou como `bloqueado` — blocker intocado em duas rodadas,
plano em dúvida, ou vinte e cinco FAILs de teste —, os commits ficam locais e o relatório final diz isso.
Publicar código que não passou no teste é decisão do dev, não da orquestração.

---

## A pasta da run em `.claude/tmp/orquestracoes/`

Você **não cria** a pasta: ela já existe, feita pela skill de planejamento, e é o parâmetro desta
skill. `.claude/tmp/` está no `.gitignore`, então nada disso vaza para o commit.

```text
.claude/tmp/orquestracoes/{YYYY-MM-DD}-{slug-da-task}/
├── log-planejamento.md      ← ledger da outra metade; você não abre e não escreve nele
├── corte.md                 ← da planejadora, só em pasta que é uma parte; esta skill não abre
├── decisao.md               ← da planejadora; esta skill não abre
├── prototipo.md             ← da planejadora; esta skill não abre
├── spec.md                  ← o contrato: AC, CB, RT e PR. A entrada desta skill, com o plano
├── ondas.md                 ← só em task partida em ondas; esta skill marca `implementada` ao fechar a onda
├── projeto.md               ← o cartão do projeto; sem sufixo de onda, um por pasta
├── reconhecimento.md        ← leitura dirigida do implementador e do revisor (ver adiante)
├── roteiro.md               ← o roteiro de comprovação que o dev fechou; já está dentro do plano,
│                               e nenhum papel desta skill o abre
├── plano.md                 ← a entrada desta skill
├── log-implementacao.md     ← o seu ledger; só o nível 0 escreve
├── implementacao.md         ← Etapa 3
├── review-{n}.md            ← Etapa 3.5, um por rodada
├── teste-{n}-{lane}.md      ← Etapa 4, um por lane por rodada
├── screenshots/             ← Etapa 4, um PNG por prova `S0n` do roteiro (PR de vídeo = sequência de PNGs): r{n}-s0X-{slug}.png
├── adaptacao-{n}.md         ← Etapa 5.5, quando o plano precisou ser adaptado
└── contexto.md              ← Etapa 6
```

O `{slug}` sai do nome da pasta, sem a data. Ele nomeia todo `description` de disparo e a branch
`task/{slug}`, se ela precisar ser criada.

### Task em ondas: o mesmo fluxo, com sufixo no nome do arquivo

Um plano pode cobrir só uma parte da spec. Quando os passos do resto dependiam do formato de um
código que ninguém tinha escrito ainda, a skill de planejamento partiu a task em **ondas**: um
plano por onda, cada um planejado depois de a anterior estar implementada e validada. O `ondas.md`
da pasta diz qual é a corrente.

Para você isso muda **uma coisa e só uma**: o nome dos arquivos. Na onda `k > 1`, todo arquivo da
run leva o sufixo `-o{k}` — `plano-o2.md`, `log-implementacao-o2.md`, `implementacao-o2.md`,
`review-o2-{n}.md`, `teste-o2-{n}-{lane}.md`, `adaptacao-o2-{n}.md`, `contexto-o2.md`. A onda 1 usa
os nomes de sempre, e o `spec.md` é um só para todas. Da planejadora, a onda `k > 1` traz também
`reconhecimento-o{k}.md`; é ele que vai no delta no lugar de `reconhecimento.md`.

O sufixo não é organização: sem ele a onda 2 sobrescreve `implementacao.md` e `teste-{n}-{lane}.md`
da onda 1, que são a prova do que já foi entregue e o que o próximo planejador vai ler para saber o
que existe no código.

**Os três tetos são por onda**, porque cada onda é uma execução inteira desta skill, com o próprio
ledger: 25 rodadas de teste contadas pelo `n` da Etapa 4 desta onda, duas adaptações de plano, e a
cadência de review calculada sobre os checkpoints deste plano. Uma onda não herda contador gasto
da anterior, e nenhum dos três teve o significado alterado.

**A validação final é da onda, não da task.** Ela prova os `RT` e as `PR` que este plano cobre. Os requisitos que
ficaram para a onda seguinte não são `n/d` e não são desvio: eles ainda não têm código, e o
relatório final os lista como pendentes da próxima onda.

### Disco é o canal de entrega

**Todo filho escreve o arquivo da etapa antes de retornar**, e o retorno dele é um ponteiro:
caminho do arquivo, veredito, no máximo 10 linhas. Retorno de filho já chegou no agente errado em
execução real — quando isso acontece, a pasta da run tem que bastar para reconstruir tudo.

**Os testers da Etapa 4 têm uma exceção, e ela é o que faz a soma das `AC` e `CB` funcionar**: eles
devolvem uma linha por requisito da lane deles, e num plano de muitos requisitos isso passa de 10 linhas. Só
essas linhas viajam; o resto do relatório fica em disco. Elas são a única entrada que você tem para
fechar o veredito por `AC` e `CB` sem abrir arquivo nenhum.

Três formatos ficam em `formats/`, e cada um é lido antes da etapa que o usa:

- [`formats/log-implementacao.md`](formats/log-implementacao.md) — o ledger. Leia antes de escrever
  a primeira linha dele, na Etapa 0.
- [`formats/teste.md`](formats/teste.md) — o relatório de validação, compartilhado pelas quatro
  lanes. Quem o lê são os testers; você passa o caminho no disparo da Etapa 4.
- [`formats/projeto.md`](formats/projeto.md) — o cartão do projeto. Quem o lê e o escreve é o
  implementador; você nunca o abre.

### Você passa caminhos, o filho lê

Nunca cole conteúdo de arquivo no prompt de um disparo — nem o corpo do prompt de `prompts/`, nem o
plano, nem o relatório de teste. Passe o **caminho**; o filho abre.

Numa onda `k > 1`, todo caminho que você passa e todo nome de arquivo de saída que você pede levam
o sufixo `-o{k}`. O prompt de cada filho cita o nome sem sufixo, e diz que o nome vindo no delta
vence: é você quem sabe em que onda a run está.

Um `@caminho` dentro do parâmetro `prompt` da tool `Agent` **não é expandido**: a expansão de `@`
acontece na entrada do usuário no CLI, não em parâmetro de tool. Então o filho receberia o caminho
como texto e teria que ler o arquivo de qualquer jeito — que é exatamente o que você quer. Se fosse
expandido seria pior ainda: o arquivo inteiro entraria no **seu** contexto ao montar a chamada, que
é o custo que esta skill existe para evitar.

---

## O cartão do projeto é a entrada de fatos

`{pasta-da-run}/projeto.md` é o cartão que a skill de planejamento escreveu — um por pasta, sem
sufixo de onda. Ele é a única fonte de comando, unidade, convenção e mecanismo desta skill; nenhum
papel decide um nome de unidade, de script ou de pacote por conta própria.

**O nível 0 nunca abre o `projeto.md`.** O que ele precisa — o comando de ambiente para o ledger, o
veredito de fixtures, o pré-requisito — chega no retorno dos filhos, como todo o resto.

Cada papel lê os campos que o trabalho dele exige:

| Papel | Campos que ele lê |
|---|---|
| implementador | `unidade afetada`, `skills de contexto`, `docs de contexto`, `comando de verificação`, `comando de teste`, `convenção de teste`, `mecanismo de fixtures`, `fluxo de dados persistentes`, `pré-requisito de ambiente`, `convenções que o plano tem que respeitar` |
| revisor | `unidade afetada`, `skills de contexto`, `docs de contexto`, `comando de verificação`, `mecanismo de fixtures`, `convenções que o plano tem que respeitar` |
| tester `curl` | `comando de ambiente`, `pré-requisito de ambiente`, `mecanismo de fixtures` |
| tester `browser` | `comando de ambiente`, `pré-requisito de ambiente`, `mecanismo de fixtures` |
| tester `teste` | `comando de teste`, `pré-requisito de ambiente`, `convenção de teste`, `mecanismo de fixtures` |
| tester `codigo` | `unidade afetada`, `convenções que o plano tem que respeitar` (nenhum comando: a prova é estática) |
| adaptador | `comando de teste`, `comando de verificação`, `comando de ambiente`, `mecanismo de fixtures`, `fluxo de dados persistentes` |
| atualizador de contexto | `docs de contexto`, `memória do projeto`, `skills de contexto`, `unidade afetada` |

**Quando o cartão não existe.** Se o `ls` da Etapa 0 não achar `projeto.md`, o nível 0 **não** o
levanta — ele não lê código. Quem levanta é o **implementador**, como item 0 do trabalho dele,
seguindo [`formats/projeto.md`](formats/projeto.md), seção "Como levantar". Teto de
~10 chamadas de tool, nenhum arquivo de código-fonte aberto por causa disso, campo que não fecha em
duas tentativas vira `desconhecido`. Ele escreve `{pasta-da-run}/projeto.md` e diz em uma linha do
retorno que levantou o cartão. **A ausência de `projeto.md` não é motivo de parada da Etapa 0.**

---

## Workflow

### Etapa 0 — localizar a pasta da run (nível 0)

Sem ler código, sem abrir o plano. Você precisa de duas coisas: **o caminho da pasta da run** e,
quando ela tem `ondas.md`, **qual onda é a corrente**.

- **O dev passou o caminho** — use-o.
- **O dev não passou** — liste os candidatos numa chamada e pegue o mais recente que tenha um
  plano:

  ```bash
  ls -dt .claude/tmp/orquestracoes/*/ | head -5
  ```

  Se houver mais de um candidato plausível, `AskUserQuestion` com a lista. Esta é a única pergunta
  que a skill admite fora da exceção destrutiva, e ela acontece **antes** do primeiro disparo:
  implementar o plano errado desperdiça a run inteira.

Um `ls` da pasta responde às duas perguntas de uma vez, e de brinde diz se há `projeto.md` — sem
ele, a Etapa 3 é quem levanta o cartão (ver "O cartão do projeto é a entrada de fatos"), e isso não
para a Etapa 0:

```bash
ls .claude/tmp/orquestracoes/{pasta}/
```

- **A pasta tem `ondas.md`** — abra-o, e só ele. Ele diz qual é a primeira onda não `implementada`: se ela está `planejada`,
  essa é a sua, o plano dela é o que a tabela nomeia, e daí sai o sufixo que todo
  arquivo desta run vai carregar. Duas paradas, e nenhuma delas é pergunta:

  - **A onda corrente está `pendente`, sem plano** — pare e aponte
    `/decidir-especificar-e-planejar {pasta}`. Onda pendente é onda que ninguém planejou, e
    implementar sem plano é a metade autônoma decidindo o que o dev não aprovou.
  - **Todas as ondas estão `implementada`** — pare e diga isso. A task acabou.

  Ler o `ondas.md` é a única leitura de arquivo da run que você faz na skill inteira, e ela existe
  porque sem ela você não sabe qual plano disparar.

- **Falta o `spec.md` ou o plano da onda corrente** — pare e diga ao dev qual dos dois falta,
  apontando `/decidir-especificar-e-planejar {pasta}`. Esta skill não planeja e não especifica; sem os dois
  arquivos ela não tem contrato para provar, e uma run que roda sem `spec.md` entrega código que
  ninguém sabe validar.

Escreva o cabeçalho do `log-implementacao.md` na mesma pasta, com o sufixo da onda quando houver, e
siga direto. Não abra nem o plano nem o `spec.md`: quem precisa deles são os filhos, e as contagens
que vão no cabeçalho chegam no primeiro retorno da Etapa 3, na linha `spec:`.

Plano com `0/0 RT · 0/0 PR` é contrato vazio, mas você não abre o plano para saber. A parada
acontece no primeiro retorno do implementador, quando a linha `spec:` traz `contrato vazio` (ou
`0 RT · 0 PR`): feche `bloqueado` apontando `/decidir-especificar-e-planejar {pasta}`.

Se o `ls` mostrou `corte.md`, esta pasta é uma parte de uma quebra. O relatório final diz isso em uma
linha: "esta pasta é uma parte; as próximas, na ordem de `corte.md`, entram por
`/decidir-especificar-e-planejar {pasta-da-parte}`". Você não abre o `corte.md`.

### Etapas 3 a 7 — um arquivo por etapa

O resto do workflow vive em `etapas/`, um arquivo por etapa. **Ao chegar numa etapa, leia o arquivo
dela, e só ele.** Etapa que você ainda não alcançou não entra na sua janela: o contexto que você
carrega é relido em todo turn até o fim da run, e ler as sete de uma vez custa ~10k tokens que
nenhuma etapa usa antes da sua vez. Os nomes de etapa em qualquer parte deste arquivo ("Etapa 4",
"Etapa 5.5") apontam para esta tabela.

| Etapa | Arquivo | Leia quando |
|---|---|---|
| 3 — implementação | [`etapas/etapa-3-implementacao.md`](etapas/etapa-3-implementacao.md) | for disparar um checkpoint |
| 3.5 — review | [`etapas/etapa-3-5-review.md`](etapas/etapa-3-5-review.md) | um lote de checkpoints fechou |
| 4 — validação | [`etapas/etapa-4-validacao.md`](etapas/etapa-4-validacao.md) | chegou um marco ou o último checkpoint aprovado |
| 5 — correção | [`etapas/etapa-5-correcao.md`](etapas/etapa-5-correcao.md) | um requisito reprovou |
| 5.5 — adaptar o plano | [`etapas/etapa-5-5-adaptar-plano.md`](etapas/etapa-5-5-adaptar-plano.md) | o defeito está no plano |
| 6 — contexto | [`etapas/etapa-6-contexto.md`](etapas/etapa-6-contexto.md) | a validação final passou |
| 7 — push e relatório | [`etapas/etapa-7-push-relatorio.md`](etapas/etapa-7-push-relatorio.md) | a Etapa 6 fechou |

---

## Requirements

- A entrada desta skill é uma pasta de run com `spec.md` **e** o plano da onda corrente. Faltando
  um dos dois, ela para e aponta `/decidir-especificar-e-planejar {pasta}`.
- **Task em ondas roda uma onda por execução.** O `ondas.md` diz qual é a corrente, todo arquivo da
  onda `k > 1` leva o sufixo `-o{k}`, e os três tetos (25 rodadas de teste, 2 adaptações, a
  cadência de review) contam por onda, sem herdar nada da anterior. A validação final prova os `RT` e `PR`
  desta onda; os das próximas saem no relatório como pendentes, nunca como `n/d` nem como desvio.
- O nível 0 não lê, não edita e não roda comando de projeto. As únicas exceções são a escrita do
  ledger, a leitura do `ondas.md` e a marcação da onda como `implementada` nele, o `ls` da Etapa 0
  e o `git push` da Etapa 7.
- Ninguém chama `AskUserQuestion` depois do primeiro disparo. As exceções são a escolha da pasta
  da run na Etapa 0 e ação destrutiva ou externa. Toda outra ambiguidade vira premissa registrada.
- Todo disparo leva `model` explícito e `description` único. Sonnet em todo papel que pensa; o
  adaptador é o único que paga Opus, e só quando a task é `complexa`; Haiku só no executor
  mecânico e no filho que passa nos critérios de "Haiku nos filhos mecânicos e checáveis".
- Todo prompt de filho vai como **caminho** para um arquivo de `prompts/`, com um delta curto.
  Ninguém cola corpo de prompt nem conteúdo de arquivo na chamada: o filho lê o que precisa por
  conta própria, e assim o texto nunca passa pelo contexto do nível 0.
- Todo filho escreve seu arquivo em disco antes de retornar e devolve no máximo 10 linhas.
- Nenhum código chega aos testers sem passar pela Etapa 3.5. O review é um agente só, com as duas
  lentes: padrões (as **skills de contexto** que o cartão nomeia para a unidade tocada, ou o
  `## Padrão da vizinhança` do reconhecimento sem nenhuma) e correção do código. Ele lê, julga e
  reroda o **comando de verificação** do cartão, em modo leitura; ele não edita arquivo do projeto
  e não prova a lane `codigo`, que tem tester próprio na Etapa 4.
- Nenhum fato de projeto está escrito nesta skill. Comando, unidade, convenção de teste, mecanismo
  de fixtures, memória e fluxo de dados persistentes saem do **cartão do projeto**
  (`{pasta-da-run}/projeto.md`), e o nível 0 nunca o lê.
- **Review roda a cada lote de ~5 checkpoints, e sempre no último**: com `L = (N + 2) ÷ 5` lotes
  (mínimo 1) de `N ÷ L` checkpoints cada, dispare-o quando o implementador fechar o último
  checkpoint de um lote — e `k == N` sempre fecha um —, sobre o lote desde a última rodada; nos
  demais o implementador segue direto. Checkpoint de marco é sempre um corte, substituindo o corte
  aritmético do lote em que cai. O `k == N` é o que sustenta a invariante da linha acima.
- **A validação roda nos marcos que o plano declarou e uma vez no fim**, nunca em checkpoint que
  não é marco. A rodada de marco prova só os requisitos do marco, nas lanes do marco; a final prova todos
  os `RT` e `PR` que o plano cobre, inclusive os que um marco já tinha aprovado.

- **Um tester por lane, disparados na mesma mensagem**, e só as lanes que o plano lista. Cada um
  reporta uma linha por `RT` e por `PR` no formato de [`formats/teste.md`](formats/teste.md);
  nenhum julga `AC` nem `CB`.
- **O nível 0 soma as `AC` e as `CB`**: uma `AC` ou uma `CB` está entregue quando todo `RT` e toda
  `PR` que a citam passaram. Requisito reprovado é FAIL, sem meio-termo, e requisito em `## Desvios da spec` não
  conta contra elas. O relatório final abre por `AC` e `CB`, não por requisito.
- **Todo `RT` e toda `PR` da spec saem da Etapa 4 com veredito.** Requisito que nenhum tester
  conseguiu exercitar é `n/d` com o motivo, nunca PASS.
- **`Continua como hoje` é regressão**: o revisor bloqueia o que o diff altera dali, e as lanes das
  `PR` de regressão revalidam depois de cada correção ou adaptação.
- **Prompts, formatos e o script são desta skill**; nenhum papel lê arquivo de outra skill.
- O laço de review vai até `aprovado`, sem limite de rodadas. Quem o limita são os dois tetos do
  filho — 140k de janela e 50 turns: com `handoff`, entra um agente fresco daquele papel. Blocker
  `intocado` em duas rodadas seguidas e `preso` que o nível 0 julgou laço fecham a task como
  bloqueada. `Plano em dúvida` apontando o plano **não** fecha: vai para a Etapa 5.5.
- Blocker volta ao implementador; nit vai só para o relatório final.
- **Plano errado é adaptado, não devolvido.** Três FAILs do mesmo `RT` ou da mesma `PR`, `Plano em dúvida` do
  revisor ou marco reprovado que duas correções não resolveram disparam a Etapa 5.5, no máximo duas
  vezes por run. O adaptador reescreve só checkpoints futuros do `plano.md`, nunca o `spec.md`, e
  escolhe sempre o caminho que preserva a `AC` e a `CB` que o dev aprovou — custo é desempate. `AC`
  ou `CB` que ele não conseguiu preservar sai no relatório como não entregue, nunca como desvio.
- **Máximo de 25 rodadas de teste**, contadas pelo `n` da Etapa 4 desta onda. Adaptação não gasta
  rodada nem reinicia a contagem, e onda nova começa do zero porque é outra execução da skill, com
  outro plano e outro ledger. Estourado o teto, o que sobra é a spec: a run fecha bloqueada e volta
  à `/decidir-especificar-e-planejar`.
- Nenhuma execução da run fala com o serviço remoto compartilhado. O filho que vai executar confere
  o **pré-requisito de ambiente** do cartão antes de subir processo, e a ausência dele — quando o
  ambiente exige um serviço de pé — fecha a etapa como BLOCKER e a run como bloqueada. Não existe
  fallback para um host remoto, nem em leitura.
- **As lanes `browser` e `teste` executam o roteiro de comprovação do plano**: as provas numeradas
  que o dev fechou no planejamento, nem uma a mais nem uma a menos, com o id da prova no nome do
  PNG. Prova que não saiu aparece no relatório com o motivo, e o requisito dela não sai PASS.
- **O ambiente sobe pelo comando da linha `ambiente`** do plano de teste e a navegação começa na
  linha `url`, não no que o tester escolher. Um projeto costuma ter mais de uma variante de subida,
  e elas não são intercambiáveis.
- O estado do teste vem do **mecanismo de fixtures**, pelo comando da linha `estado` do plano,
  rodado depois de o pré-requisito estar de pé. Nenhum tester monta o estado na mão, e comando de
  estado que não roda é BLOCKER.
- Passo de plano que sincroniza ou estende o mecanismo de fixtures é implementado como qualquer
  outro passo, com o arquivo de contrato do mecanismo no mesmo commit e os gates dele — o comando
  de verificação e, se o cartão disser como rodar um alvo só, o comando de teste restrito a ele —
  na mesma rodada.
- Validação que dá PASS é seguida da Etapa 6, que só varre: a skill que o campo `skills de contexto`
  do cartão apontar atualiza a documentação de contexto, usando as `AC` e `CB` da spec como guia de
  leitura. Sem skill apontada, o retorno é `sem varredura`. Nada disso é feito pelo nível 0.
- O comando de verificação e o comando de teste do cartão rodam dentro do implementador e do
  revisor, nunca no nível 0.
- Toda etapa que muda arquivo comita o próprio trabalho: o implementador na Etapa 3 e em cada
  rodada de correção, o atualizador de contexto na Etapa 6. `git add` por caminho, a mensagem no
  formato que `git log --oneline -25` mostrar, e nunca com gate vermelho. Review e teste não
  comitam.
- O implementador registra a `Base da run` no `implementacao.md` antes da primeira edição, e é
  contra ela que o revisor diffa.
- **O protótipo sai no último checkpoint.** Quando o plano tem `## Protótipo`, o implementador
  parte da base para montar a tela e apaga a pasta do protótipo no último checkpoint, com ou sem o
  passo `(protótipo)` no plano. A validação final só roda com a linha `protótipo:` fora de
  `pendente`, e o revisor do último lote bloqueia pasta, import ou rota do protótipo que sobrou. A
  pasta só fica quando a `remoção:` do plano a manda para outra parte ou outra onda.
- O push é um só, no fim, dado pelo nível 0, e não acontece em task bloqueada.
- Nada de fork, placeholder, agente de espera, `sleep` ou chamada no-op.

## Example

```text
Dev: /implementar-e-validar .claude/tmp/orquestracoes/2026-05-14-export-csv-relatorio/

Nível 0:
  E0  pasta confirmada, spec.md e plano.md presentes, log-implementacao.md criado
  E3  impl-export-csv-relatorio (gp, sonnet)       → spec: 3 AC · 2 CB · 2 RT · 3 PR ·
                                                      regressão: AC-003
                                                      checkpoint 1/8, 3 arquivos,
                                                      RT-001 PR-001 fechados, commit a1b2c3d,
                                                      lanes: curl+codigo
                                                      N=8 → L=2, cortes em 4 e 8
  E3  SendMessage: siga (não fecha lote)           → checkpoint 2/8, commit b2c3d4e
  E3  SendMessage: siga (não fecha lote)           → checkpoint 3/8, commit c3d4e5f
  E3  SendMessage: siga (não fecha lote)           → checkpoint 4/8, commit d4e5f6a
  E3.5 review-export-csv-relatorio-r1 (gp, sonnet) → lote cp 1–4: reprovado,
                                                      2 blockers (1 deles: RT-002 não
                                                      atendido), 1 nit
  E3.5 SendMessage ao implementador com o caminho do review-1.md → commit e5f6a7b
  E3.5 review-export-csv-relatorio-r2              → lote cp 1–4: aprovado
  E3  SendMessage: siga                            → checkpoints 5/8 a 8/8, 4 commits
  E3.5 review-export-csv-relatorio-r3              → lote cp 5–8 (k == N): aprovado
  E4  duas chamadas na mesma mensagem:
      teste-export-csv-relatorio-curl-r1 (gp)      → pré-requisito de pé, estado: comando
                                                      da linha `estado` executado, cenário
                                                      periodo-cheio criado,
                                                      RT-001 (AC-001) PASS
                                                      PR-002 (AC-002, CB-003) FAIL
      teste-export-csv-relatorio-codigo-r1 (gp)    → RT-002 (AC-001, AC-002) PASS
                                                      PR-001 (AC-001, CB-001) PASS
                                                      PR-003 (AC-003) PASS
      soma: AC-001 entregue, AC-002 não entregue (PR-002), AC-003 entregue (regressão),
            CB-001 entregue, CB-003 não entregue (PR-002)
  E5  SendMessage ao implementador com o caminho do teste-1-curl.md → commit d0e1f2a
  E3.5 review-export-csv-relatorio-r4              → aprovado
  E4  teste-export-csv-relatorio-curl-r2           → PR-002 (AC-002, CB-003) PASS. 2/2 RT ·
                                                      3/3 PR, 3/3 AC, 2/2 CB
      (a lane codigo tem PR-003, que cita AC-003 de regressão: redisparada também)
  E6  contexto-export-csv-relatorio (gp, sonnet)   → varrido, 1 doc de contexto,
                                                      commit e1f2a3b
  E7  git push -u origin HEAD e relatório ao dev, aberto por AC e CB
```

Uma task `complexa`, com marco e adaptação — o caminho que antes fechava a run como bloqueada:

```text
Dev: /implementar-e-validar .claude/tmp/orquestracoes/2026-05-20-paginacao-listagem/

Nível 0:
  E0  pasta confirmada, log-implementacao.md criado
  E3  impl-paginacao-listagem (gp, sonnet)         → spec: 3 AC · 2 CB · 2 RT · 2 PR ·
                                                      regressão: AC-003
                                                      checkpoint 1/10, commit a1b2c3d,
                                                      lanes: browser+codigo, dificuldade:
                                                      complexa (reconhecimento.md),
                                                      marco 1: cp 4 prova RT-003 (browser)
                                                      N=10 → L=2, cortes 5 e 10;
                                                      marco em 4 substitui o 5 → cortes 4 e 10
  E3  SendMessage: siga ×3                         → checkpoints 2/10 a 4/10, 3 commits
  E3.5 review-paginacao-listagem-r1                → lote cp 1–4 (marco): aprovado
  E4  teste-paginacao-listagem-browser-r1          → marco 1, escopo RT-003: FAIL —
                                                      a página avança por índice de página
                                                      e o cursor da resposta anterior não
                                                      é o que a próxima leitura espera
  E5  correção r1 → commit e5f6a7b
  E4  teste-...-browser-r2                         → marco 1: RT-003 FAIL de novo
  E5  correção r2 → commit f6a7b8c
  E4  teste-...-browser-r3                         → marco 1: RT-003 FAIL — 2 correções
                                                      não moveram o marco → E5.5
  E5.5 adapta-paginacao-listagem-r1 (gp, opus)     → adaptado: o cursor passa a vir do id
                                                      do último registro, não do índice da
                                                      página; cp 5–10 reescritos, RT-003
                                                      mudou de forma, AC-002 intacta, 2/2 RT
                                                      · 2/2 PR
  E3  impl fresco (plano novo + adaptacao-1.md)    → checkpoint 5/10, commit a7b8c9d
                                                      agentId novo guardado
  E3  SendMessage: siga ×5                         → checkpoints 6/10 a 10/10, 5 commits
  E3.5 review-paginacao-listagem-r2                → lote cp 5–10 (k == N): aprovado
  E4  teste final, duas lanes na mesma mensagem    → 2/2 RT · 2/2 PR PASS, 3/3 AC e 2/2 CB
                                                      entregues (RT-003 revalidado: marco
                                                      não dá crédito permanente)
  E4  r2 (depois de uma correção) redispara a lane que reprovou e a lane browser, porque
      PR-002 (AC-003, CB-001) cita AC-003 de regressão
  E6  contexto-paginacao-listagem                  → varrido, 1 doc de contexto, commit b8c9d0e
  E7  push e relatório: 3/3 AC, 2/2 CB, 1 adaptação do plano com o gatilho e o que ela protegeu
```
