<!-- Etapa extraída de SKILL.md. Leia SKILL.md antes: as regras gerais, o cartão do projeto e os tetos valem aqui. -->

### Etapa 6 — atualizar a documentação de contexto (sonnet)

```text
subagent_type: 'general-purpose'
model: 'sonnet'
description: 'contexto-{slug}'
```

Roda **depois de a Etapa 4 dar PASS**, e só então. Código que não passou no teste está num estado
que ninguém quer ver descrito como se fosse a verdade do sistema: se a task fechou bloqueada, pule
esta etapa e diga isso no relatório.

Passe os caminhos de `prompts/atualizador-contexto.md`, `{pasta-da-run}/spec.md`,
`{pasta-da-run}/projeto.md` e da pasta da run.

O trabalho dele é uma varredura: ele carrega a **skill de varredura de contexto** que o campo
`skills de contexto` do cartão apontar e segue o workflow dela, com o corte estreito de sempre
(regra, contrato, passo de fluxo, efeito colateral). Usa as `AC` e as `CB` da spec como **guia de
leitura** para reconhecer o que mudou de regra, sem lista obrigatória e sem registrar `AC` por id.
Sem nenhuma skill apontada (`skills de contexto: nenhuma`), ele devolve `sem varredura` e não edita
nada.

Ele escreve `contexto.md` e comita a documentação junto do arquivo de pontos de revisão que a
skill de varredura mantém, quando há uma.
Como o código da run já está comitado, o `HEAD` que aquela skill usa como fronteira já contém a
task inteira — que é a fronteira certa para o ponto de revisão que ela grava.

Por que isto é uma etapa e não um detalhe do implementador: a doc de contexto do projeto é o que
**todo** agente deste repo lê antes de planejar. Ela carrega regra de negócio e fluxo de sistema,
então uma regra que mudou no código e não mudou lá vira um plano errado na próxima task — e o erro
só aparece quando a implementação já está pronta. O implementador, no fim da janela dele e com a
cabeça no diff, é o pior agente possível para esse julgamento.

O corte é estreito de propósito, e o prompt do filho o carrega: entra o que mudou regra, contrato,
passo de fluxo ou efeito colateral. Refatoração, renomeação interna, formatação, bump de
dependência e teste não encostam na documentação. Filho que não achou nada para mudar retorna `sem
alteração`, e isso é um resultado bom.

O retorno do filho é um de quatro: `varrido`, `sem alteração`, `sem varredura` ou `incompleta`.
`incompleta` vira ressalva da run.

Anote no ledger: unidades em escopo, docs alterados ou `sem alteração`/`sem varredura`, e o hash do
commit de docs.
