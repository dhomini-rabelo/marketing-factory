<!-- Etapa extraída de SKILL.md. Leia SKILL.md antes: as regras gerais, o cartão do projeto e os tetos valem aqui. -->

### Etapa 7 — push e relatório final (nível 0)

Se o veredito é `entregue` ou `entregue com ressalvas`, publique a branch — uma chamada, e é o
único `git` que você roda na run inteira:

```bash
git push -u origin HEAD
```

Se o veredito é `bloqueado`, **não dê push**: os commits ficam locais e o relatório diz isso. Numa
run em ondas, cada onda dá o próprio push da mesma branch, no fim dela.

**Se a run tem `ondas.md` e o veredito é `entregue` ou `entregue com ressalvas`**, marque a onda
como `implementada` na célula `Estado` da tabela dele. É a única escrita sua fora do ledger, e ela
existe porque é essa linha que a próxima sessão de planejamento lê para saber onde a task parou: sem
ela, a onda seguinte não sabe que pode começar.

Feche o `log-implementacao.md` e responda ao dev com:

- **Veredito**: `entregue`, `entregue com ressalvas` ou `bloqueado`, pelas definições de "A
  validação é por `RT` e `PR`".
- **O que o dev recebe**, uma linha por `AC` e por `CB`, na língua do dev, mais a linha `Geral`:

  ```text
  AC-001  entregue
  AC-002  não entregue — PR-003 reprovou: S05, o aviso "Gerando o arquivo…" não aparece
  AC-004  entregue (regressão)
  CB-003  entregue
  CB-006  entregue com desvio — PR-005 em Desvios da spec
  Geral   RT-001 PASS · PR-006 PASS
  ```

  Esta é a primeira seção do relatório, e é a única que responde a pergunta do dev. A lista de
  requisitos é o detalhe que sustenta cada linha, e ela vem depois.
- **Provas em disco**: quantos PNG a validação produziu e o caminho da pasta `screenshots/`, em
  link markdown. É o que o dev abre para ver a entrega dele com os próprios olhos, e cada arquivo
  leva o id da prova que ele aprovou no gate do roteiro. As `PR` de vídeo aparecem como
  `PR-003 (vídeo): S04–S07`.
- **Cobertura**: `{N}/{N} RT · {N}/{N} PR com veredito · {N}/{N} AC · {N}/{N} CB entregues`, por
  lane, e os que ficaram `n/d` com o motivo. Numa onda, a conta é sobre os requisitos desta onda.
- **Onda**, quando a run tem `ondas.md`: qual onda fechou, o que ela entrega na língua das `AC`, e
  os requisitos que continuam pendentes da próxima. Eles não são `n/d` nem desvio, e a diferença importa:
  ninguém tentou prová-los ainda porque o código deles não existe. Se ainda há onda depois desta,
  feche com a linha que planeja a próxima, agora contra o código que esta acabou de escrever:

  ```text
  /decidir-especificar-e-planejar .claude/tmp/orquestracoes/{YYYY-MM-DD}-{slug}/
  ```

  Se a pasta é uma parte (o `ls` da Etapa 0 mostrou `corte.md`), diga em uma linha: "esta pasta é
  uma parte; as próximas, na ordem de `corte.md`, entram por
  `/decidir-especificar-e-planejar {pasta-da-parte}`".
- **Desvios da spec**: os `RT` e `PR` que o plano declarou que não cumpriria. O dev os viu no gate do
  plano, mas ele fecha a task olhando esta lista.
- **O que mudou**: arquivos, em links markdown clicáveis.
- **Adaptações do plano**, quando houve: o gatilho, o que o adaptador trocou e qual `AC` isso
  protegeu. Se alguma adaptação custou uma `AC`, ela já apareceu como `não entregue` na primeira
  seção — aqui vai o porquê. O dev aprovou um plano no gate e recebeu outro: esta seção é onde ele
  descobre isso, e ela não é opcional.
- **Marcos de validação**, quando o plano tinha algum: em que checkpoint cada um rodou e o que ele
  pegou. Marco que reprovou e virou adaptação é a prova de que o marco se pagou.
- **Review**: quantas rodadas até `aprovado`, e os `nits` que o revisor deixou. Nit não foi
  consertado por ninguém, então quem decide se ele vale uma task é o dev.
- **Como foi provado**: as lanes que rodaram, o pré-requisito que respondeu (a linha de veredito do
  tester) e o comando que fabricou o estado de partida.
- **Fixtures**: `sincronizar`, `estender`, `sem mudança` ou `sem mecanismo`. Se a run estendeu o
  mecanismo, nomeie o cenário que passou a existir: é o que o dev reusa na próxima task, e o
  arquivo que o cartão aponta como contrato do mecanismo já o descreve.
- **Documentação de contexto**: os docs que a Etapa 6 alterou, ou `sem alteração`, ou `sem
  varredura` / `incompleta` com o motivo.
- **Protótipo**, quando o plano tinha um: a pasta apagada, ou onde a remoção ficou (`fica para`).
  Numa run `bloqueada` antes do último checkpoint, diga que a pasta continua na árvore, sem commit.
- **Premissas assumidas**: as que você e os filhos travaram sozinhos. Esta seção não é opcional —
  é onde o dev descobre o que decidiram por ele, e nesta metade da orquestração ninguém perguntou
  nada.
- **Commits e push**: a branch, os commits da run em uma linha cada (hash curto e mensagem), e o
  resultado do push — ou `não dado`, com o motivo, se a task fechou bloqueada.
- **Caminho da pasta da run**.
