<!-- Etapa extraída de SKILL.md. Leia SKILL.md antes: as regras gerais, o cartão do projeto e os tetos valem aqui. -->

### Etapa 3.5 — review de padrões e de código (sonnet)

```text
subagent_type: 'general-purpose'
model: 'sonnet'
description: 'review-{slug}-r{n}'
```

Um revisor só, com duas lentes numa passada: os **padrões de escrita de código** do repo — as
**skills de contexto** que o cartão nomeia para a **unidade afetada**, e sem nenhuma, o
`## Padrão da vizinhança` do `reconhecimento.md` — e a **correção do código** em si (erro de
lógica, caminho de erro, estado de borda, tipo frouxo, contrato quebrado, passo do plano pela
metade). Ele também reroda o **comando de verificação** do cartão, em modo leitura, para conferir
o que o `implementacao.md` afirmou.

Passe os caminhos de `prompts/revisor.md`, `{pasta-da-run}/plano.md`, `{pasta-da-run}/spec.md`,
`{pasta-da-run}/projeto.md` e `{pasta-da-run}/implementacao.md`, mais o caminho de
`reconhecimento.md` (leitura dirigida, ver "O cartão do projeto é a entrada de fatos") e o caminho
da pasta da run, o número da rodada e **quais checkpoints esta rodada revisa**: o lote, que é uma
faixa (`checkpoints 3 a 7`) ou um número só, quando o lote fechou com um checkpoint. O revisor
precisa desses números: é por eles que ele recorta os arquivos do lote corrente e deixa em paz o
que um lote anterior já fechou.

**O revisor não prova a lane `codigo`.** Ele pergunta se o código está bom; o `tester-codigo` da
Etapa 4 pergunta se o código cumpre o requisito. São dois julgamentos, e mantê-los separados é o que faz
um `reprovado` dizer sozinho que o problema é qualidade e um FAIL dizer sozinho que o problema é a
spec.

O `review-{n-1}.md` só entra quando a rodada anterior **reprovou este mesmo lote**. Rodada que abre
um lote novo não leva review nenhum: o anterior julgou outro trecho, e reabri-lo é retrabalho.

O `n` é o contador de review da run, e ele corre independente do contador de teste da Etapa 4: um
review disparado depois de um FAIL de teste continua a contagem de review, não a de teste.

Ele devolve `review-{n}.md` e um veredito: `aprovado` ou `reprovado`.

#### A cadência: um lote a cada ~5 checkpoints, e sempre no último

O implementador devolve, a cada retorno da Etapa 3, `checkpoint {k} de {N}`. A regra que decide se
o revisor sobe é aritmética, e você a aplica sem abrir arquivo nenhum. Assim que o primeiro retorno
da Etapa 3 te der o `{N}`, calcule os cortes uma vez e use a mesma lista até o fim da run:

- **`L`, o número de lotes** — `N ÷ 5` arredondado para o inteiro mais próximo, com mínimo 1. Em
  conta inteira: `L = (N + 2) ÷ 5` descartando a fração, e se der `0`, `L = 1`.
- **Os cortes** — cada lote leva `N ÷ L` checkpoints, e os primeiros `N % L` lotes levam um a mais.
  O revisor sobe no **último checkpoint de cada lote**.
- **Todo checkpoint de marco é um corte, e ele substitui o corte aritmético do lote em que cai.**
  O marco põe um tester no meio da run, e a regra de que nenhuma linha chega ao tester sem ter
  passado por um revisor não abre exceção para ele. Substituir em vez de somar é o que evita duas
  rodadas de review encostadas: num plano de 10 com cortes em 5 e 10, um marco no checkpoint 4 faz
  os cortes virarem 4 e 10 — o primeiro lote fica um checkpoint mais curto, e é só isso.

Plano de até 7 checkpoints cai em lote único e leva uma rodada só, no fim. De 8 a 12, `L` é 2 e o
corte cai bem na metade. De 13 em diante, os lotes voltam a ficar em torno de 5:

| `N` | `L` | Lotes | Review dispara em |
| --- | --- | --- | --- |
| 1–7 | 1 | o plano inteiro | `N` |
| 8 | 2 | 4 + 4 | 4, 8 |
| 10 | 2 | 5 + 5 | 5, 10 |
| 12 | 2 | 6 + 6 | 6, 12 |
| 13 | 3 | 5 + 4 + 4 | 5, 9, 13 |
| 15 | 3 | 5 + 5 + 5 | 5, 10, 15 |
| 20 | 4 | 5 + 5 + 5 + 5 | 5, 10, 15, 20 |
| 10, marco em 4 | 2 | 4 + 6 | 4, 10 |

- **`k` fecha um lote — e `k == N` e todo checkpoint de marco sempre fecham** — dispare o revisor
  sobre o lote fechado: os checkpoints desde a última rodada de review até `k`.
- **Qualquer outro `k`** — não dispare revisor. Mande o implementador seguir direto para o próximo
  checkpoint via `SendMessage` para o `agentId` guardado na Etapa 3, sem passar caminho de review
  nenhum, exatamente como no caso `aprovado` com checkpoint restante.

Num plano de 10 checkpoints isso dá 2 rodadas de review (lotes 1–5 e 6–10) em vez de 10; num de 4,
dá uma só. Plano sem checkpoint não muda: uma rodada, no fim, sobre a implementação inteira. O `n`
continua sendo o contador da run inteira e sobe de lote para lote, sem reiniciar.

**Por que em lote de ~5.** O caro de uma rodada de review não é o diff: é a ignição. Todo revisor
é fresco — carrega as skills de contexto do cartão para a unidade tocada, abre o `plano.md` e o
`implementacao.md`, diffa contra a base da run e reroda o comando de verificação antes de julgar a
primeira linha. Essa parte custa igual para um checkpoint ou para cinco, e é ela que se
paga uma vez por lote, não uma por checkpoint. O diff, que é a parte que de fato cresce com o lote,
é a parte barata da conta — e o lote maior ainda economiza o que o revisor de um checkpoint
minúsculo gastava para descobrir que não havia quase nada para olhar.

**Por que não uma rodada só, no fim.** Dois motivos, e nenhum é gosto. O primeiro é o custo do erro
tardio: checkpoint errado vira base do checkpoint seguinte, e o conserto deixa de ser uma linha
para virar cascata — o implementador continua vivo e com o diff na janela, mas o trabalho que ele
desfaz cresce a cada checkpoint construído por cima do erro. O segundo é o teto de 140k: o diff da
run inteira numa passada só empurra o revisor para `handoff`, e `handoff` é um revisor fresco a
mais — a rodada que a economia prometia poupar volta pela porta dos fundos, agora sem o proveito de
ter olhado o código cedo. O lote de ~5 é a troca escolhida: pega o erro antes de ele virar alicerce
sem pagar ignição a cada passo. Ele aceita, em plano grande, que um lote não caiba nos 140k — e é
para isso que o `handoff` do revisor existe, com o revisor fresco da mesma rodada retomando pelo
`review-{n}.md`.

O que o veredito do revisor decide:

- **`aprovado`, e restam checkpoints** — mande o implementador continuar via `SendMessage` para o
  `agentId` guardado na Etapa 3, sem passar nenhum caminho de review (não houve reprovação). Ele
  implementa até o próximo checkpoint e retorna; daí a cadência acima decide se a Etapa 3.5 sobe
  de novo, com `n+1`, ou se ele segue direto. Os `nits` de cada rodada aprovada não voltam ao
  implementador; eles se acumulam para o relatório final, na Etapa 7.
- **`aprovado`, e não resta checkpoint** — a implementação inteira do plano já foi revisada. Siga
  para a Etapa 4.
- **`reprovado`** — mande o implementador consertar via `SendMessage` para o `agentId` guardado na
  Etapa 3, passando o **caminho** do `review-{n}.md`. Ele fecha a rodada com o commit dela. Quando
  ele retornar, dispare um revisor **fresco** com `r{n+1}`, passando também o caminho do
  `review-{n}.md`. Isso acontece **dentro** do lote atual — só depois de aprovado é que se decide
  se avança para o próximo lote ou para a Etapa 4.

**Por que aqui, antes do teste.** O tester só sabe exercitar o comportamento de fora. Erro que ele
não consegue provocar e desvio de padrão que ele nunca vê saem nesta etapa ou não saem de lugar
nenhum. E consertar agora é barato: o implementador ainda está vivo, com o diff na janela. É por
isso que o `k == N` da cadência não é negociável — ele é o que garante que nenhuma linha chegue ao
tester sem ter passado por um revisor.

**Por que um revisor fresco por rodada.** A janela dele não acumula entre rodadas, e a rodada 2 tem
escopo pequeno de propósito: checar os blockers da rodada anterior e procurar o que o conserto
quebrou. Reusar o revisor por `SendMessage` guardaria pouco e o empurraria para o teto justamente
na rodada em que ele precisa reler o diff.

#### O laço vai até aprovar, e o teto é a janela

Esta etapa **não tem limite de rodadas**. Ela roda até `aprovado`, e o que a limita é o teto de
140k dos dois agentes envolvidos:

- **Implementador com `handoff`** — dispare um implementador **fresco** com os caminhos de
  `{pasta-da-run}/plano.md` e `{pasta-da-run}/implementacao.md`, mais o
  `{pasta-da-run}/review-{n}.md` **se houver conserto pendente**; num avanço de checkpoint não há
  review para passar — nem quando a cadência pulou a rodada —, e o sucessor descobre onde retomar
  pela seção `Checkpoints` do `implementacao.md`. Guarde o `agentId` novo: ele é o destinatário dos `SendMessage` seguintes,
  aqui e na Etapa 5. O `implementacao.md` vai junto também porque é lá que mora a `Base da run` —
  o sucessor a mantém, e o revisor continua diffando contra ela.
- **Revisor com `handoff`** — dispare um revisor fresco da mesma rodada, passando o `review-{n}.md`
  parcial que ele deixou. Ele continua pelos arquivos do diff que ficaram sem olhar.

Registre todo handoff no ledger, na seção `Handoffs`.

Se algum dos dois voltar com **`preso`** em vez de `handoff`, leia o motivo do retorno antes de
relançar: progresso real só longo vira sucessor fresco, laço de verdade vira blocker. Relançar um
laço sem mudar nada paga o mesmo laço de novo.

Três casos param o laço, porque nenhuma rodada extra os resolve:

- **Blocker `intocado` em duas rodadas seguidas.** O implementador não está conseguindo consertar,
  e a terceira tentativa é a mesma. Feche como bloqueado e leve o blocker ao dev.
- **`preso` que você julgou laço.** O mesmo gate não passa, o mesmo comando repete, a dependência
  não sobe. Feche como bloqueado com o motivo que o filho reportou.
- **O revisor preencheu `Plano em dúvida` apontando o plano como causa.** A correção certa é
  refazer o plano, não o código: mandar o implementador consertar produz uma volta que a rodada
  seguinte reabre. Isto **não fecha mais a run** — vá para a Etapa 5.5 e deixe o adaptador julgar.
  Se ele voltar `sem-adaptacao`, o plano não era o problema e o laço de review continua de onde
  parou, agora sabendo que o passo está certo.

Anote no ledger: rodada, o lote de checkpoints que ela cobriu, veredito, quantos blockers, em uma
linha o que reprovou, e o hash do commit da correção quando houve uma.
