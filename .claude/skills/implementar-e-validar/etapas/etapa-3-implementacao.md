<!-- Etapa extraída de SKILL.md. Leia SKILL.md antes: as regras gerais, o cartão do projeto e os tetos valem aqui. -->

### Etapa 3 — implementação (sonnet)

```text
subagent_type: 'general-purpose'
model: 'sonnet'
description: 'impl-{slug}'
```

Passe os caminhos de `prompts/implementador.md`, `{pasta-da-run}/plano.md`,
`{pasta-da-run}/spec.md` e `{pasta-da-run}/projeto.md` (o cartão, ou o aviso de que ele ainda não
existe, com o caminho de `formats/projeto.md` para o implementador levantá-lo), mais o caminho da
pasta da run. Se `reconhecimento.md` (na onda `k > 1`, `reconhecimento-o{k}.md`) existir, o caminho
dele também vai — o implementador o lê só nas quatro coisas de "O cartão do projeto é a entrada de
fatos" mais o veredito de dificuldade.

O `spec.md` vai junto porque cada passo do plano cita o `RT-00N` ou a `PR-00N` que implementa, e o
texto do requisito está na spec. Quando o passo e o requisito divergem, quem manda é o requisito: o
passo é a receita, o requisito é o que a Etapa 4 vai provar.

O prompt já obriga o filho a rodar, antes de retornar, **o comando de verificação** que o cartão
nomeia, na ordem em que ele o escreve, a partir da raiz. Quando o cartão diz
`comando de verificação: nenhum`, não há gate estático, e a fronteira do checkpoint passa a ser "o
lote é julgável sozinho e nada que ele deixou está pela metade".

Se o plano tocar o **mecanismo de fixtures**, os gates dele entram na mesma rodada — o comando de
verificação e, se o cartão disser como rodar um alvo só, o comando de teste restrito a ele.

Depois de os gates passarem, ele **comita o próprio trabalho** e devolve no retorno a branch, a
base da run, o hash curto do commit e as **lanes** que o plano definiu. Gate vermelho não
vira commit: nesse caso ele retorna sem comitar e diz isso no veredito.

Quatro coisas vêm do plano por ele, porque ele é o primeiro agente que abre o `plano.md` e você não
vai abri-lo: as **lanes** do `## Plano de teste`, que escolhem os testers da Etapa 4; o **total de
checkpoints**, que a cadência de review usa; os **marcos de validação**, com o checkpoint de cada um
e os `RT` e `PR` que ele prova; e o **veredito de `## Fixtures`** (`sincronizar` | `estender` |
`sem mudança` | `sem mecanismo`). A elas se somam duas que não saem do plano: o **veredito de
dificuldade** — o `plano.md` não tem seção para isso, e ele sai do `reconhecimento.md` que o
implementador leu (ver "O cartão do projeto é a entrada de fatos"); sem `reconhecimento.md`, ele
deriva do `## Marcos de validação` do plano e o implementador diz isso no retorno — e **se ele
mesmo levantou o cartão do projeto**, quando a pasta chegou sem `projeto.md`. As quatro do plano
mais essas duas vão para o cabeçalho do ledger, uma vez só. A primeira linha do retorno é
`spec: {N} AC · {N} CB · {N} RT · {N} PR · regressão: {ids | nenhuma}` (ou `contrato vazio`); você a
copia no cabeçalho do ledger.

**O plano agrupa os passos em checkpoints**, na seção `## Passos`, e cada checkpoint é uma
fronteira onde o comando de verificação passa e o lote é julgável sozinho. O implementador implementa só até
o **primeiro** e retorna ali, em vez de seguir até o fim do plano. Ele registra no
`implementacao.md` quais passos, `RT` e `PR` entraram naquele checkpoint e devolve, além do resto,
**qual checkpoint este é, de quantos, e se restam outros**. O total sai da contagem que ele faz ao
abrir o plano e não muda durante a run. Plano de um checkpoint só é o caso comum: ele implementa
tudo de uma vez.

Teste **não** roda neste ponto, nem por checkpoint: a Etapa 4 é sempre depois do último
checkpoint. Checkpoint fechado só pode ir para a Etapa 3.5 (revisão) — e nem sempre vai logo, que
é o que a cadência da seção seguinte decide.

Guarde o `agentId` do implementador: as Etapas 3.5 e 5 o reusam por `SendMessage`.

Anote no ledger: checkpoint (qual, de quantos, e se restam outros), arquivos alterados, gates
passaram ou não, branch, base da run, hash do commit, lanes e veredito de Fixtures. O total de
checkpoints, as lanes, os marcos e os dois vereditos (Fixtures e dificuldade) vão no cabeçalho do
ledger, uma vez só.

#### O protótipo sai no último checkpoint

Quando o dev escolheu um protótipo no planejamento, a pasta dele ficou na árvore, sem commit, como
base da tela. O plano diz isso na seção `## Protótipo`, e o implementador é quem a lê: ele parte da
base para montar a tela real e **apaga a pasta do protótipo no último checkpoint**, antes da
validação final. Assim os testers provam a tela real, e a run não publica uma rota de protótipo
junto com ela. Se o plano não tiver o passo que apaga, o implementador apaga assim mesmo e registra
o desvio.

O retorno do último checkpoint traz a linha `protótipo:`, que vai para o cabeçalho do ledger:

- **`apagado {pasta}`** ou **`nenhum`**: siga.
- **`fica para {parte ou onda}`**: o plano mandou apagar a pasta em outra parte ou outra onda.
  Siga, e diga no relatório onde a remoção ficou.
- **`pendente`**: não vá para a Etapa 4. Devolva o checkpoint ao implementador por `SendMessage`,
  pedindo para terminar a remoção, e só siga com a linha em `apagado`.

O revisor do lote que fecha o último checkpoint confere o mesmo: pasta do protótipo ainda de pé é
blocker dele.
