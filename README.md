# project-factory

Este repositório servirá como base para iniciar os próximos projetos, reunindo configurações e orientações reutilizáveis para facilitar a preparação de cada novo projeto.

O foco principal será a configuração de IA com o **Claude Code**, a ferramenta utilizada no desenvolvimento. Aqui serão organizados:

- **Skills:** instruções e fluxos de trabalho reutilizáveis para tarefas recorrentes.
- **Settings:** configurações do Claude Code que servirão como ponto de partida para os projetos.
- **CLAUDE.md:** orientações, convenções e contexto para guiar o Claude Code em cada projeto.

Ao iniciar um novo projeto, essa base será adaptada às suas necessidades, mantendo uma configuração inicial consistente e evitando repetir o trabalho de preparação.

## Iniciar um projeto a partir da base

Depois de copiar a factory para o repositório de destino, use `/task-init-project` e descreva o produto que deseja iniciar. A [skill de inicialização](.claude/skills/task-init-project/SKILL.md) alinha os requisitos e monta o projeto de acordo com as respostas, sem depender de templates de aplicação ou de caminhos locais para outros repositórios.

O alinhamento inclui as plataformas, os módulos, a stack, as integrações e a execução dos testes. O padrão de [arquitetura do monorepo](.claude/skills/code-get-coding-designs/designs/monorepo-structure.md) organiza o domínio em `packages/domain/<módulo>`, os contratos de serviços externos em `packages/adapters` e as implementações em `packages/infra/<implementação>`. Web e mobile ficam dentro de infra, mantendo suas próprias convenções de páginas, componentes, hooks e serviços.

As referências são os repositórios [Cally](https://github.com/dhomini-rabelo/cally) para backend e web, [Ben Prototype](https://github.com/dhomini-rabelo/ben-prototype) para backend e mobile, e [mdnotes](https://github.com/dhomini-rabelo/mdnotes) para a organização do monorepo. Os contratos de repositórios ficam dentro do módulo de domínio, junto das entidades e dos use cases; suas implementações ficam em infra. Essa divisão evita a dependência circular entre os packages de domínio e adapters.

O recorte copiável de `packages/domain/base` está em [examples/domain-base](examples/domain-base/). São dois sabores de in-memory, tipos distintos: o SQL-like (Cally) é o barrel padrão (`InMemoryRepository` + `JsonRepository`, `findMany` lista, `orderBy`/`page`/cursor, `deleteMany`); o NoSQL-like (mdnotes/Dynamo) é o entry `./nosql` (indexes, partition key, `findMany` → `{ data, nextPaginationData }`, queries `BEGINS_WITH`/`AND`/`createQuery`, `ValueQuery`) e **não** herda o SQL nem ganha `JsonRepository`. Os helpers de tipo compartilhados (`AnyRecord`, `Complement`, `KeyOf`, `isFieldInProps`) estão em [examples/modules-utils](examples/modules-utils/). Em um app, copie o domain-base para `packages/domain/base` e o modules-utils para `packages/modules/utils`; importe `@domain/base` (SQL) ou `@domain/base/nosql`, e `@modules/utils` para os genéricos.

Cada use case deve ter testes automatizados de comportamento. Os testes de integração verificam as implementações e fronteiras reais; os E2E cobrem os fluxos principais das plataformas escolhidas. A [convenção de testes](.claude/skills/code-write-code/coding-patterns/automated-testing.md) orienta tanto a inicialização quanto as funcionalidades posteriores. As ferramentas e os comandos de execução são configurados ao iniciar cada projeto; CI e verificações automáticas de arquitetura não são obrigatórias nesta base.

## Migrar um projeto existente

Para reorganizar uma aplicação existente conforme a factory, use `/task-migrate-project` no repositório de destino. A [skill de migração](.claude/skills/task-migrate-project/SKILL.md) levanta a estrutura atual, mapeia as responsabilidades para os workspaces de destino e executa a mudança em etapas verificáveis, preservando os comportamentos, contratos e dados existentes. Ela adapta imports, configurações e testes junto do código, sem pressupor que o projeto já seja um monorepo.

A adoção apenas das skills não exige migrar a aplicação. Para criar uma aplicação nova, use `/task-init-project`. O contexto do código, tanto no primeiro preenchimento quanto nas atualizações após uma migração, continua sendo mantido pela invocação explícita de `/task-update-project-context`.

## Combinações de projeto

A factory deve atender projetos com diferentes combinações de backend, frontend web e mobile. A configuração inicial deve incluir apenas o conteúdo necessário para a combinação escolhida.

| Combinação | Conteúdo específico a selecionar |
| --- | --- |
| Somente backend | Backend |
| Somente frontend web | Frontend |
| Somente mobile | Mobile e padrões de frontend compartilhados aplicáveis |
| Backend e mobile | Backend, mobile e padrões de frontend compartilhados aplicáveis |
| Backend e frontend web | Backend e frontend |
| Frontend web e mobile | Frontend e mobile |
| Backend, frontend web e mobile | Backend, frontend e mobile |

## Seleção do conteúdo das skills

As skills que dividem seu conteúdo em `backend/`, `frontend/` e `mobile/` devem ser adaptadas à combinação escolhida, sem copiar todas as pastas automaticamente.

- Incluir as instruções gerais aplicáveis e selecionar os padrões e referências necessários dentro de cada área.
- Em projetos mobile, incluir também os padrões compartilhados de React e cliente que estiverem em `frontend/`, sem trazer orientações exclusivas de web.
- Ajustar o `SKILL.md` e as referências entre arquivos para apresentar apenas o conteúdo selecionado e manter todos os links válidos.
- Adaptar nomes de projetos, caminhos, bibliotecas e helpers à estrutura e à stack do projeto de destino.

A seleção é por conteúdo, não apenas por pasta: arquivos gerais também podem conter regras específicas de uma plataforma e devem ser adaptados ao projeto de destino.
