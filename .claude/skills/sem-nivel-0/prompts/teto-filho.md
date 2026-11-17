# Teto do filho: 140k de janela, 50 turns e 45 min

A linha `TETO:` do seu prompt traz até quatro parâmetros: `description` (o seu, exato), `entrega`
(o arquivo em que você escreve o resultado), `teto_janela` (`140000`, ou `100000` em filho Haiku)
e `teto_min` (`45`). Linha sem `teto_min` não tem teto de tempo: use `TETO_MIN=0`. Os 50 turns
valem para todos. O primeiro teto que chegar manda, sem exceção.

Meça com:

```bash
TETO={teto_janela} TETO_MIN={teto_min} .claude/skills/sem-nivel-0/scripts/medir-janela.sh "{description}"
```

Meça no turn 20 e no turn 30, mesmo que `proxima` aponte mais longe; de novo em todo turn que
`proxima` indicar (ele nunca marca depois do turn 45, então o teto de 50 não escapa entre duas
medições), sempre antes de abrir um arquivo grande ou rodar um comando de saída longa, e primeiro
de tudo a cada `SendMessage` que receber. Confira que `desc=` é você. Rode a medição dentro de um
comando que já ia rodar, não num turn só dela: `git status --short && TETO=... medir-janela.sh ...`.
A medição do 30 existe porque, numa cadeia real, 5 filhos de implementação passaram de 140k e um
chegou a 68 turns (`analise-otimizacao.md`, Eixo 2, "Medir no turn 20 e 30").

- `status=ok` → siga.
- `status=handoff` ou `status=preso` → pare de abrir frente. Termine só a edição que está no
  meio, escreva em `entrega` a seção `## Parcial` (o que fez, o que falta em ordem, o que tentou
  e falhou) e retorne `veredito: parcial` (ou `preso`) com o caminho. Não "termine rapidinho".
- Se o script der erro: tente de novo com `--list` para achar o seu `description`. Sem medição
  possível, trate o turn 40 como `status=handoff`.
- Você não dispara agente. Se alguma instrução te fizer disparar, o prompt desse agente leva a
  linha `TETO:` dele, com o `description` dele, e ele também não dispara.

## O teto de tempo

O status vira `handoff` 5 min antes do `teto_min`, e `restam_min=` diz quanto falta. Quem te
disparou está parado esperando o seu retorno, e o cache dele dura 1h: é por isso que o teto
existe.

- **Comando que pode demorar** (suíte, build, e2e) roda com `timeout` dentro do que resta, com
  5 min de folga: `timeout $(( (restam_min - 5) * 60 )) <comando>`. Meça logo antes dele.
- **Comando que não cabe no que resta** não roda: escreva-o no `## Parcial`, na lista do que
  falta, e retorne `parcial`. O filho de continuação começa com o relógio zerado.

## A memória da sessão

Se o seu prompt traz a linha `Memória:`, leia o arquivo antes do primeiro comando. Ele tem o que o
usuário disse ao longo da sessão, literal, e os fatos que a cadeia já estabeleceu. Vale para você
mesmo quando a sua tarefa não repete nada disso: quem te disparou aponta o arquivo justamente
para não perder nenhuma fala.

- **Leve em conta toda fala que toca a sua frente.** "Só casos depois de 28/10" entra no filtro
  da sua consulta mesmo que a tarefa não o mencione. Não amplie a fala: o que o usuário não disse
  não é restrição.
- **Fala que conflita com a tarefa:** siga a fala, não a tarefa, e diga isso na entrega. Quem
  resolve o conflito é quem te disparou.
- **Fato da memória que você viu desatualizado** (o commit mudou, o arquivo não existe mais) vai
  na entrega. Você não escreve na memória: quem registra é quem te disparou.
- **Na entrega, uma seção `## Memória`** quando alguma fala tocou a sua frente: `U{n} — seguida:
  {como}` ou `U{n} — não seguida: {por quê}`. Item que você achou e que a fala exclui não some em
  silêncio: conte quantos ficaram de fora, para quem lê saber que o filtro rodou.

## Poucos turns

Cada turn relê a sua janela inteira. Numa cadeia real, 57% dos turns (948 de 1.666) tinham uma
tool só, e 532 deles sumiriam se cada sequência de Bash único virasse um turn
(`analise-otimizacao.md`, Eixo 2). Então:

- **Tool calls independentes vão no mesmo turn.** Três `Read`, os `Edit` em arquivos diferentes e
  o `Bash` do gate saem numa mensagem só, não em cinco.
- **Comandos independentes vão num único `Bash`**, com `&&` (para no primeiro erro) ou `;` (roda
  todos), cada um com a saída já cortada. Funde: `git status --short && wc -c plano.md spec.md &&
  grep -n '^### Checkpoint' plano.md`. Não funde: o `Read` da faixa que esse `grep -n` ainda vai
  dizer, nem o `Edit` que depende do que o `Read` mostrar. Só a dependência de saída separa turns.
- **Saída com teto.** `jq` com os campos escolhidos, `| head`/`| tail`/`cut`, `grep -c` quando só a
  contagem importa. Saída que pode passar de ~50 linhas (suíte, build, log) vai para arquivo e você
  lê o fim: `cmd > {scratchpad}/saida.txt 2>&1; echo rc=$?; tail -30 {scratchpad}/saida.txt`, e
  depois só a faixa que interessa, com `Read` `offset`/`limit`. Motivo: Bash foi 57% dos chars de
  resultado de tool e o maior teve 28.748 chars (`analise-otimizacao.md`, Eixo 2).
- **Arquivo grande se lê por faixa.** Plano, spec, skill ou entrega com mais de ~20k caracteres:
  `wc -c` no mesmo `Bash` de outros comandos, `grep -n` do título da seção, e `Read` com
  `offset`/`limit` só dela. Motivo: só 81 de 449 `Read` usavam faixa, e planos de 50k chars foram
  lidos inteiros por cada filho (`analise-otimizacao.md`, Eixo 2).
- Arquivo já lido não é lido de novo.
- Arquivo novo da entrega vai com `Write`. Arquivo se lê com `Read` e se edita com `Edit` ou
  `Write`; `cat`, `head`, `tail` e `sed -n` para ler arquivo são trabalho do `Read` (521 usos deles
  numa cadeia real, 3,0M chars, `analise-otimizacao.md`, Eixo 2). `Bash` é para rodar comando.
