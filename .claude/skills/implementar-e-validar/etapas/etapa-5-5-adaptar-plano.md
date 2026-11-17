<!-- Etapa extraída de SKILL.md. Leia SKILL.md antes: as regras gerais, o cartão do projeto e os tetos valem aqui. -->

### Etapa 5.5 — adaptar o plano (sonnet ou opus), no máximo 2 vezes

Esta etapa é condicional e existe para um caso só: **o defeito está no plano, não no código.** Ela
é o que separa uma run que termina de uma run que morre — antes dela, plano errado fechava a task
como bloqueada e devolvia tudo para a skill de planejamento, gastando de novo a metade que o dev
já tinha aprovado.

Três gatilhos, e nenhum outro:

1. **Terceira rodada de FAIL do mesmo `RT` ou da mesma `PR`** na Etapa 5.
2. **`Plano em dúvida` preenchido pelo revisor** apontando um passo do plano como causa.
3. **Marco reprovado** cuja correção não passou em duas rodadas. Este é o gatilho que paga melhor:
   você está no checkpoint 4 de 10, com seis checkpoints ainda por escrever, e é exatamente aí que
   adaptar plano futuro vale algo.

```text
subagent_type: 'general-purpose'
model: 'sonnet' se a task é simples | 'opus' se é complexa
description: 'adapta-{slug}-r{n}'
```

Passe os caminhos de `prompts/adaptador.md`, `{pasta-da-run}/spec.md`, `{pasta-da-run}/plano.md`,
`{pasta-da-run}/implementacao.md`, `{pasta-da-run}/projeto.md` (de onde ele carrega as skills de contexto e as
convenções que o plano reescrito segue) e o do julgamento que disparou a etapa — o `teste-{n}-{lane}.md`
que reprovou, o `review-{n}.md` com o `Plano em dúvida`, ou os dois.

#### A `AC` e a `CB` vencem, e é isso que o adaptador otimiza

O adaptador reescreve `plano.md` e **nunca** `spec.md`. A `AC` e a `CB` são a expectativa que o dev
aprovou; o `RT` e a `PR` são a tradução dela, escrita antes de alguém ter tocado o código. Quando a realidade
mostra que a tradução estava errada, a tradução muda — a expectativa não.

Ele escolhe pela ordem de preferência do prompt, e ela é a razão de esta etapa existir: outro
caminho técnico para a mesma `AC` primeiro, a `AC` inteira por um caminho mais caro depois, `AC`
com desvio declarado em terceiro, e `AC` não entregue só em último recurso. **Custo é desempate,
nunca o primeiro critério.**

#### O que cada veredito decide

- **`adaptado`** — o plano futuro mudou e toda `AC` segue inteira. Dispare um implementador
  **fresco** com os caminhos do `plano.md` novo e do `implementacao.md`, mais o `adaptacao-{n}.md`.
  Fresco, não `SendMessage`: a janela do anterior carrega o plano velho inteiro, e é justo o plano
  velho que acabou de ser trocado. Guarde o `agentId` novo. Depois siga a cadência de review
  normalmente — o checkpoint adaptado é um lote como qualquer outro.
- **`adaptado-com-desvio`** — igual, e o `RT` ou a `PR` desviado entra em `## Desvios da spec`. Ele sai do
  relatório final na língua da `AC`, dizendo o que o dev perde, não qual requisito caiu.
- **`adaptado-com-ac-em-risco`** — igual, e a `AC` afetada vai para o relatório final como **não
  entregue**, com o motivo. A run continua e entrega as outras. Não maquie isso como desvio: `AC`
  que caiu é a informação mais importante que o relatório carrega, e a run que a esconde entrega
  algo que o dev não pediu sem ele saber.
- **`sem-adaptacao`** — o plano está certo e a execução não. Nada mudou em disco. Volte de onde
  você veio: o laço de correção da Etapa 5 ou o de review da Etapa 3.5, agora com uma informação
  que você não tinha, que é a de que reescrever plano não resolve.

**Teto de duas adaptações por run.** Se um terceiro gatilho disparar, pare: duas reescritas de plano
que não fecharam a task apontam para a spec, e spec é decisão do dev. Feche como bloqueado com o
motivo e aponte `/decidir-especificar-e-planejar {pasta}`.

Se o adaptador voltar com `handoff`, dispare um adaptador fresco com o `adaptacao-{n}.md` parcial —
mas confira a linha `plano:` do retorno: se ela diz `reescrito` pela metade, o sucessor precisa
saber disso, porque plano parcialmente reescrito é pior que plano velho.

Anote no ledger: gatilho, veredito, checkpoints reescritos, cobertura nova, e a `AC` afetada com o
que aconteceu com ela.
