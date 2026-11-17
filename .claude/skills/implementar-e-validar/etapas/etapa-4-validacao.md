<!-- Etapa extraída de SKILL.md. Leia SKILL.md antes: as regras gerais, o cartão do projeto e os tetos valem aqui. -->

### Etapa 4 — validação (sonnet), um tester por lane

A validação roda em dois momentos, e é o plano que decide se o primeiro existe:

- **Validação de marco** — só quando o plano declarou algum em `## Marcos de validação`. Roda no
  checkpoint que o marco nomeia, depois de o lote dele ter passado pela Etapa 3.5 aprovado, e prova
  **apenas os requisitos (`RT` e `PR`) que o marco lista**, nas lanes que ele lista. Task `simples` não tem marco, e
  então esta metade não existe.
- **Validação final** — sempre, depois que o lote do último checkpoint tiver passado pela Etapa 3.5
  aprovado e a linha `protótipo:` não estiver `pendente`. Prova **todos** os `RT` e `PR` que o plano cobre, inclusive os que um marco já provou: checkpoint
  construído depois pode ter quebrado o que passou antes, e um `PASS` de marco não é crédito
  permanente.

**Não invente validação em checkpoint que não é marco.** O custo de subir as unidades e fabricar cenário
se paga em risco declarado, não em toda fronteira — e quem sabia onde o risco estava foi o
planejador, que leu o código e já escreveu a resposta. Passo do plano que peça "rode o teste aqui"
sem ser marco vira, nesta skill, só mais um checkpoint, e ele entra na cadência de review da Etapa
3.5.

As lanes vêm do `## Plano de teste` e chegaram a você no retorno do implementador. **Uma lane, um
tester.** Dispare todos os da rodada **na mesma mensagem**: as chamadas `Agent` saem no mesmo turn,
cada retorno chega por notificação própria, e isso é barreira paralela sem nenhum agente de espera.

| Lane | `subagent_type` | Prompt |
|---|---|---|
| `curl` | `general-purpose` | `prompts/tester-curl.md` |
| `browser` | `browser-tester` quando `ls .claude/agents/` mostrar esse agente; senão `general-purpose` com as tools de browser | `prompts/tester-browser.md` |
| `teste` | `general-purpose` | `prompts/tester-teste.md` |
| `codigo` | `general-purpose` | `prompts/tester-codigo.md` |

`model: 'sonnet'` nos quatro. `description`: `teste-{slug}-{lane}-r{n}`, com `n` = número da
rodada.

Passe a cada um os caminhos de `{pasta-da-run}/plano.md`, `{pasta-da-run}/spec.md`,
`{pasta-da-run}/projeto.md`, `{pasta-da-run}/implementacao.md` e `formats/teste.md`, mais o caminho
da pasta da run e o número da rodada.

As lanes `browser` e `teste` recebem no plano de teste o **roteiro de comprovação**: a lista
numerada de provas que o dev fechou no gate da `/decidir-especificar-e-planejar`, cada uma com o
requisito que serve, a ação, o que precisa estar visível e a rodada em que sai
(`S02 (PR-003; AC-002, CB-005) [final] ação → visível`, ou `S01 (RT-003) [marco 1] ...`). O tester
produz aquelas provas e nem uma a mais, e o nome do PNG em disco leva o id da prova. PR de vídeo
chega como sequência de `S0n` com a mesma PR. Você não abre o roteiro; ele chega ao tester pelo
`plano.md`, e o que volta para você é uma linha por requisito, como nas outras lanes.

As linhas `ambiente` e `url` do plano de teste dizem **qual comando sobe o ambiente e onde a
primeira prova de tela começa**, e as duas vão no delta junto dos caminhos. Um projeto costuma ter
mais de uma variante de subida e elas não são intercambiáveis: comando escolhido pelo tester por
conta própria é uma hora perdida, não um FAIL.

**Numa validação de marco, passe também o escopo**: que é o marco `{m}`, quais requisitos provar e o
checkpoint em que a implementação está. Sem essa linha o tester tenta provar requisitos cujo código ainda
não existe e devolve FAIL em requisito que ninguém implementou — um FAIL falso que dispara uma
rodada de correção inteira contra nada.

**Dispare só as lanes que aparecem na linha `lane:` do plano** — e numa rodada de marco, só as
lanes do marco, que costumam ser menos. Um plano pode ter muitos casos e
continuar sendo uma lane só: caso é o que se exercita, lane é com que ferramenta. Subir o
`browser-tester` num plano sem tela é pagar o navegador para não ver tela nenhuma, e disparar o
`tester-codigo` sem nenhum requisito dessa lane é um spawn que devolve uma lista vazia.

Validação é observação, não conserto: os quatro prompts proíbem editar código da unidade.

#### O que cada tester devolve

Uma linha por requisito da lane dele, no formato de [`formats/teste.md`](formats/teste.md):

```text
RT-003 (AC-001) PASS
PR-003 (AC-001, AC-002, CB-005) FAIL — S05: o aviso "Gerando o arquivo…" não aparece
PR-006 (geral) PASS
```

Junte as linhas das lanes e **some as `AC` e as `CB`**: uma `AC` ou uma `CB` está entregue quando todo
`RT` e toda `PR` que a citam passaram. A conta está na seção "A validação é por `RT` e `PR`" acima.

**Rodada com qualquer `RT` ou `PR` em FAIL vai para a Etapa 5.** O `teste-{n}-{lane}.md` da lane que
reprovou é o que volta ao implementador — se duas lanes reprovaram, os dois caminhos vão.

**Rodada de marco que passou inteira não fecha nada**: mande o implementador seguir para o próximo
checkpoint como num `aprovado` de review. O marco provou que a base está de pé, e é só isso que ele
prometia.

**Na rodada seguinte, redispare só as lanes que reprovaram.** `PASS` não expira dentro da run, e o
que protege contra a regressão que o conserto introduziu é a Etapa 3.5, que roda obrigatoriamente
entre a correção e a nova validação e olha justamente o diff do conserto. Redisparar todas a cada
rodada paga a conferência do pré-requisito de ambiente, a subida das unidades e a fabricação de
estado de novo, para reconfirmar
requisitos que ninguém tocou.

**Exceção: regressão.** Depois de uma correção (Etapa 5) ou adaptação (Etapa 5.5), redispare as lanes
que reprovaram **e** toda lane que tem `PR` cujo alvo cita `AC` de `Continua como hoje`. O `PASS` de
regressão expira quando o código mudou depois dele.

**Lane indisponível é BLOCKER, não FAIL.** Uma lane está indisponível quando o campo do cartão que
ela exige diz `nenhum`: `comando de teste: nenhum` fecha a lane `teste`, `comando de ambiente:
nenhum` fecha as lanes `browser` e `curl`. Nesse caso ela não "assume um padrão" e você não escolhe
um comando por ela. Se o `## Cobertura` do plano ainda atribuiu um `RT` ou uma `PR` a uma lane fechada, o
reconhecimento contradisse o próprio cartão, e o defeito é de planejamento: dispare a lane, o
tester devolve **BLOCKER** nomeando o campo que está `nenhum`, e a run fecha **bloqueada**, sem
push, apontando `/decidir-especificar-e-planejar {pasta}`. Não é um quarto gatilho da Etapa 5.5 — o
plano não está errado no caminho, está errado na premissa, e quem conserta premissa é a skill de
planejamento.

#### O pré-requisito e o estado

**As lanes `curl`, `browser` e `teste` conferem o pré-requisito de ambiente**, e a barreira
paralela não atrapalha: quem confere antes de subir encontra o serviço já de pé quando outra lane
subiu primeiro. A lane `teste` precisa dele tanto quanto as outras duas — o campo
`pré-requisito de ambiente` do cartão diz de que serviço a suíte deste projeto depende, e sem ele
ela falha por ambiente, não por asserção. A lane `codigo` não confere nada, porque a prova dela é
estática.

Pré-requisito ausente não vira rodada de correção: não é o código que está errado, é a máquina sem
o serviço. O tester devolve BLOCKER com o motivo, e a run fecha bloqueada, sem push.

Com o pré-requisito de pé, o tester roda o comando da linha `estado` para fabricar o estado de
partida e reporta o comando e os identificadores que ele imprimiu. Comando que não roda também é
BLOCKER, e não FAIL: sem estado não existe checagem, e o código não é o culpado. Comando que rodou
mas não alcança o cenário é o mesmo BLOCKER, com o que faltou nomeado — é essa linha que vira a
extensão do mecanismo de fixtures na próxima passada de planejamento.

Anote no ledger: por lane, os `RT` e `PR` com veredito e a linha `status=` do gate; depois as seções
`Cobertura por requisito` e `Veredito por AC e CB`, que você monta somando as lanes.
