<!-- Etapa extraída de SKILL.md. Leia SKILL.md antes: as regras gerais, o cartão do projeto e os tetos valem aqui. -->

### Etapa 5 — correção (sonnet), no máximo 25 rodadas

Se a Etapa 4 deu FAIL em algum `RT` ou `PR`:

1. Mande o implementador consertar via `SendMessage` para o `agentId` guardado — ele ainda tem o
   contexto da implementação, e reusá-lo é mais barato que um filho fresco. Passe o **caminho** do
   `teste-{n}-{lane}.md` de cada lane que reprovou, não o conteúdo. Ele fecha a rodada com o commit
   dela.
2. Se o implementador tiver retornado com `handoff`, dispare um implementador **fresco** com os
   caminhos de `{pasta-da-run}/plano.md`, `{pasta-da-run}/spec.md`,
   `{pasta-da-run}/projeto.md` (o cartão, ou o aviso de que ele ainda não existe, com o caminho de
   `formats/projeto.md`), `{pasta-da-run}/implementacao.md` e os `teste-{n}-{lane}.md` que
   reprovaram.
3. Passe o conserto pela Etapa 3.5, no próximo número da contagem de review, e só então volte à
   Etapa 4 com `n+1`. O código que o tester exercita é sempre código revisado, e essa rodada de
   review sai barata: o revisor fresco só olha o que mudou desde o `review` anterior.

**Na terceira rodada de FAIL do mesmo `RT` ou da mesma `PR`, pare de consertar e vá para a Etapa 5.5.** Três
consertos que não movem o mesmo requisito não são um bug a mais na fila: é o plano descrevendo um
caminho que não chega onde o requisito pede. Insistir daí em diante paga a mesma rodada de novo, e o
implementador não tem autoridade para trocar o caminho — só o adaptador tem.

**Pare na vigésima quinta rodada de teste.** O teto conta o `n` da Etapa 4 — rodadas de teste, e
só elas. Adaptação não gasta rodada e não a devolve: ela troca o caminho que as rodadas seguintes
vão exercitar, e a contagem segue de onde estava.

Vinte e cinco rodadas de teste não são um bug a mais para corrigir. Nesse ponto o laço de correção
já tentou, o adaptador já usou as duas adaptações dele, e o que sobra é a spec — que não é sua para
mexer. Encerre, escreva no ledger o que falhou nas rodadas e leve ao dev como bloqueio, sem tentar
a vigésima sexta. Spec errada volta para `/decidir-especificar-e-planejar {pasta}`.
