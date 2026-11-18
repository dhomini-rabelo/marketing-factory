# Formato dos arquivos da run

Cinco arquivos vivem em `.claude/tmp/orquestracoes/{YYYY-MM-DD}-{slug}/` e são escritos por
orquestrador. A pasta também é: O1 a cria no primeiro turn e cada orquestrador seguinte a
mantém, porque o nível 0 não escreve em disco. Os arquivos de rodada (`r{n}-{papel}.md`) são
escritos pelos filhos, e o formato é você quem define no prompt de cada um — com uma parte
fixa: o filho que parou no teto (`veredito: parcial` ou `preso`) acrescenta ao final dele

```md
## Parcial
Janela {N}k, {N} turns, {N} min, status={handoff|preso}.
### Feito
{uma linha por item fechado}
### Falta, em ordem
1. {o que o filho de continuação faz primeiro}
### Tentado e falhou
{o quê e por quê, ou "nada"}
```

que é tudo o que o filho de continuação (`{slug}-r{n}-{papel}-c{k}`) lê para retomar.

Um sexto arquivo fica fora da pasta da run, porque vale para todas as runs da sessão: a
memória da sessão, em `.claude/tmp/orquestracoes/memorias/{YYYY-MM-DD}-{slug}.md`. O formato
dela está no fim deste arquivo.

Duas regras valem para os seis:

- **Ponteiros, não conteúdo.** Nenhum diff, nenhum trecho de código colado, nenhuma saída de
  comando. Se passa de duas linhas, vai para o arquivo da rodada e você cita o caminho.
- **Escrito para quem tem zero contexto.** O leitor é um sucessor fresco, ou o usuário. Nenhum
  dos dois viu a sua janela.

---

## `briefing.md` — o enunciado da task

Só O1 escreve, quando o gate da Etapa 0 fecha: depois da rodada de reconhecimento e das
respostas do usuário, antes da rodada 1. Ninguém reescreve depois — o que muda no meio do
caminho é premissa nova, e premissa nova vive no handoff.

A exceção é o pedido novo que o usuário manda depois de um `bloco: fim`. Ele não abre run nova:
o orquestrador da vez acrescenta ao final uma seção `## Pedido {k}`, com a fala verbatim e a
definição de pronto, e não mexe no que veio antes.

Ele existe porque a descrição do usuário chega uma vez, no prompt de O1, e nunca mais. Sem esse
arquivo, O2 herda uma task sem enunciado.

```md
# Briefing — {task em uma frase}

Memória da sessão: .claude/tmp/orquestracoes/memorias/{data-e-slug-da-primeira-run-da-sessão}.md

## O pedido
{a task como o usuário descreveu, verbatim. Sem interpretação.}

## Perguntas e respostas
- {pergunta que você mandou no `bloco: perguntas`}: {a resposta do usuário, verbatim}
{ou "nenhuma: o reconhecimento fechou tudo"}

## Definição de pronto
{como se prova, de fora, que a task acabou. Um comando, uma tela, um arquivo, um número.}

## Fora do escopo
{o que foi decidido não fazer, para nenhum sucessor "consertar de passagem".}

## Autorizações
{ação externa ou destrutiva liberada pelo usuário, com o escopo exato e os ids da memória da
sessão: `U{n}` (a fala, com o prefixo de origem) e `F{n}` (o fato da autorização). "nenhuma" se
não houve.}

## Premissas
{ambiguidade que você travou sozinho, e a decisão}
```

---

## `log.md` — o ledger

Uma linha por rodada, acrescentada quando a rodada fecha. Cada orquestrador escreve sob o próprio
cabeçalho e ninguém relê o log: o que a rodada seguinte precisa veio na notificação do filho.

```md
# Orquestração — {task em uma frase}

Pasta: .claude/tmp/orquestracoes/{YYYY-MM-DD}-{slug}/

## O1 (sonnet) — início {HH:MM}

| Rodada | Filhos | Modelo | Veredito |
|---|---|---|---|
| r1 | mapear-pacotes | sonnet | 9 pacotes, 2 com plugin custom |
| r2 | migrar-a, migrar-b | sonnet | 2 ok, build passou |
| r3 | migrar-c | sonnet | FAIL: alias de path |
| r4 | contar-imports | haiku → sonnet | haiku reprovado em r4-contar-imports: contagem não bate; refeito em sonnet |

Janela no fechamento: 128k. Handoff: handoff-1.md

## O2 (sonnet) — início {HH:MM}

| Rodada | Filhos | Modelo | Veredito |
|---|---|---|---|
| r4 | migrar-c | sonnet | ok, alias resolvido no tsup.config |

## Premissas assumidas
- {ambiguidade travada depois do gate, e a decisão}

## Registrado na memória
- {U{n} e F{n} que esta run acrescentou. "nada" se não acrescentou.}

## Handoffs
- O1 → O2: janela 128k, 3 pacotes pendentes

## Resultado
{entregue | entregue com ressalvas | bloqueado} — fim {HH:MM}
```

A tabela é o único lugar onde tabela se justifica aqui, porque cada célula é um nome, um modelo
ou um veredito de meia linha. Veredito que não cabe em meia linha vai para o arquivo da rodada.

As três seções que não são opcionais:

- **`Premissas assumidas`**, porque fora do `bloco: perguntas` ninguém fala com o usuário. Esta
  seção é o registro do que foi decidido no lugar dele, e ela vira, palavra por palavra, uma
  seção do relatório final.
- **`Registrado na memória`**, porque é o rastro do que esta run acrescentou. A fala e o fato em
  si vivem na memória da sessão, que é o que O3 e a próxima run leem; aqui fica só o ponteiro.
- **`Handoffs`**, porque quem lê precisa saber que aquela etapa foi feita por dois agentes. É o
  primeiro lugar onde se olha quando algo saiu pela metade.

---

## `ambiente.md` — as armadilhas de ambiente já pagas

Uma linha por armadilha, acrescentada pelo orquestrador quando um filho a descobre. Todo filho
que roda comando lê este arquivo (a linha `Ambiente:` da tarefa), e nenhuma tarefa repete o
parágrafo.

```md
# Ambiente — armadilhas já pagas
- pnpm do corepack está quebrado: `export PATH=.../scratchpad/bin:$PATH` (confira `pnpm --version`).
- e2e: um spec por vez, com `timeout 1500 bash scripts/e2e-run.sh e2e/<spec>.spec.ts`; `pnpm test:e2e -- <spec>` NÃO filtra.
- ao fim: portas 4000/5173 e processos `vite`/`chromium`/`xvfb` que você criou, encerrados.
```

Ponteiros e comandos, não prosa. O comando que resolve vai junto da armadilha.

---

## `handoff-{n}.md` — o estado que sobrevive à sua troca

O arquivo mais importante da cadeia. O teste é único: **o seu sucessor lê só ele, o
`briefing.md` e a memória da sessão, e dispara a próxima rodada sem adivinhar nada.**

A ordem das seções não é decorativa. `Próxima rodada` vem primeiro porque é a única que o
sucessor precisa ler para começar a trabalhar.

```md
# Handoff O{n} → O{n+1}

Briefing: .claude/tmp/orquestracoes/{data}-{slug}/briefing.md
Ledger: .claude/tmp/orquestracoes/{data}-{slug}/log.md
Memória da sessão: .claude/tmp/orquestracoes/memorias/{data-e-slug-da-primeira-run-da-sessão}.md

## Próxima rodada
{uma entrada por filho, escrita como ordem de serviço. O sucessor monta a tarefa só com isto, **sem
abrir plano, spec nem o SKILL.md do método**: tudo que ele buscaria lá entra aqui, com o id e o
caminho.}

- **{papel}** · `{slug}-r{n}-{papel}` · modelo `{sonnet|haiku}` · tipo `{general-purpose|executor-mecanico}`
  - prompt do papel: {caminho do arquivo em `prompts/`, ou da etapa em `etapas/`}
  - lê: {caminhos, com a seção quando ela for só um trecho: `plano.md ## Plano de teste`}
  - escreve: {`r{n}-{papel}.md`}
  - delta: {até 5 linhas: ids (`T01..T12`), comandos, o que fica de fora, a premissa que vale}

## Pendências, em ordem
1. {o que falta, uma linha cada. A lista encurta a cada handoff, ou a cadeia está girando em falso.}

## Já fechado
{uma linha por rodada concluída, com o caminho do arquivo da rodada. Sem repetir o conteúdo.}

## Armadilhas
{o que já foi tentado e falhou, e por quê. Sem esta seção o sucessor repete a sua rodada perdida
com outro nome. "nenhuma" se não houve.}

## Premissas
{as que você travou. Acumulativo: repita as do handoff anterior que ainda valem.}

Fala do usuário e fato estabelecido da sessão não vão aqui: vivem na memória da sessão, que o
sucessor já lê.

## Estado do mundo
{o que está sujo fora do git: serviço subido, arquivo temporário, migração aplicada, branch
criada. O sucessor precisa saber o que ele herda ligado.}

## Janela
Fechei em {N}k de 140k, {N} turns de 50, {N} min de 45.
```

Nenhuma seção fica vazia por preguiça: `nenhuma` é resposta legítima e informativa, silêncio não.

---

## `relatorio-final.md` — o que o usuário lê

Quem fecha a task escreve, e o corpo do retorno `bloco: fim` é este arquivo resumido em no
máximo 15 linhas. O nível 0 repassa o retorno sem reescrever, então o que estiver mal escrito
aqui chega mal escrito ao usuário.

```md
# {task em uma frase}

## Veredito
{entregue | entregue com ressalvas | bloqueado}

## O que mudou
- [caminho/arquivo.ts](caminho/arquivo.ts) — {o que mudou}

## Como foi provado
{o comando rodado, a tela verificada, o resultado. Concreto.}

## Premissas assumidas
{copiadas do ledger. Não é opcional.}

## Memória
Memória da sessão: .claude/tmp/orquestracoes/memorias/{data-e-slug-da-primeira-run-da-sessão}.md
- U{n} — seguida | não conferida | não seguida: {onde, e por quê}
Registrado nesta run: {U{n}, F{n}, ou "nada"}

## O que ficou de fora
{pendência que a task não cobriu, e por quê}

## A cadeia
{quantos orquestradores, quantos filhos, quantas rodadas, pasta da run}
```

A seção `Memória` lista **toda** fala do usuário que toca esta task, de qualquer run da sessão,
e não só as desta run: fala esquecida de uma run anterior é o defeito que a memória existe para
evitar.

---

## `memorias/{YYYY-MM-DD}-{slug}.md` — os fatos da sessão

O primeiro O1 da sessão cria, com a data e o slug da run dele: nas runs seguintes o nome do
arquivo continua sendo esse, e não o da run da vez. Todo orquestrador da sessão lê e acrescenta,
em qualquer run. Nenhuma linha some. É o único arquivo que atravessa runs: o nível 0 passa o
caminho a um O1 novo (que só nasce quando o orquestrador da vez não responde mais), e o resto da
cadeia o encontra pelo briefing e pelo handoff.

```md
# Memória da sessão

Criada por orq-{slug}-o1 em {YYYY-MM-DD HH:MM}.
O que o usuário disse e o que a cadeia estabeleceu nesta sessão. Só se acrescenta: o que mudou
ganha linha nova que aponta a antiga. Nada aqui é regra criada pela cadeia.

## O usuário disse

- **U1** · {YYYY-MM-DD HH:MM} · run `{slug}` · pedido
  - "{frase verbatim}"
- **U2** · {YYYY-MM-DD HH:MM} · run `{slug}` · resposta · origem `[resposta do usuário ao AskUserQuestion, verbatim]`
  - pergunta: "{a pergunta do bloco, verbatim}"
  - "{a resposta, verbatim}"
- **U3** · {YYYY-MM-DD HH:MM} · run `{slug}` · mensagem no meio da run · origem `[mensagem do usuário, verbatim]`
  - "{frase verbatim}"

## Fatos estabelecidos

- **F1** · {YYYY-MM-DD HH:MM} · run `{slug}` · {o fato, uma linha} · conferir: {hash, caminho ou comando}
- **F2** · {YYYY-MM-DD HH:MM} · run `{slug}` · {o fato novo} · conferir: {...} · substitui F1
- **F3** · {YYYY-MM-DD HH:MM} · run `{slug}` · autorização: {a ação liberada}, escopo exato {o quê, onde, quantos} · conferir: U3
```

A `origem` é o prefixo que o nível 0 pôs na mensagem. Ela fica na linha da fala, fora das aspas, e
é a evidência de que a fala veio do usuário. Autorização (`F3` acima) é fato: o que o usuário
liberou, com o escopo da fala dele e o `U{n}` que a prova. Ela não vira regra nem vale além desse
escopo.

Três critérios para uma linha:

- **A fala do usuário vai verbatim, e só ela.** Nenhum campo de interpretação, nenhuma
  "aplicação", nenhuma proibição deduzida. A paráfrase é onde a fala muda de sentido sem ninguém
  perceber, e a interpretação é onde nasce a regra que o usuário nunca deu: "faça o merge desse
  branch na main" virou "nenhum git push, nenhum PR" e custou uma rodada de perguntas na run
  seguinte.
- **Fato é verificável.** Ele traz onde conferir. "Merge feito" não basta; "merge `b271ca7` na
  `main` local, 54 commits à frente de `origin/main` · conferir: `git log -1 main`" basta.
- **Só o que importa depois.** O detalhe da rodada vive no arquivo da rodada. Na memória entra o
  que um orquestrador fresco, nesta run ou na próxima, erraria se não soubesse.
