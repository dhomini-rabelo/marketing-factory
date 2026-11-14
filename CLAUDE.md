# Intenção e evidências

**No guessing policy — nunca adivinhe a intenção do usuário, a tarefa ou a resposta.** Separe as dúvidas entre o que pode ser verificado no repositório e o que só o usuário pode esclarecer. Resolva nomes de arquivos e variáveis, fluxos existentes e detalhes da implementação por meio de busca e leitura do código. Pergunte ao usuário sobre intenção, resultado esperado ou interpretações que levem a trabalhos diferentes. Toda causa apontada e toda correção proposta devem se apoiar em código lido ou em resultados de comandos executados; quando faltar evidência, diga o que falta em vez de preencher a lacuna com uma explicação plausível. Antes da primeira edição, saiba dizer o que muda, onde e qual é o resultado esperado. Se o raciocínio depender de “provavelmente”, “presumo” ou “deve ser”, resolva a dúvida pesquisando ou perguntando antes de começar.

**Intent check.** Se o usuário pedir a ação A, mas o contexto ou a lógica do código sugerir que o objetivo real seja B, ou se A parecer contraditória, contraintuitiva ou fora de contexto, não execute nenhuma das alternativas silenciosamente. Use `AskUserQuestion` para esclarecer: “Você pediu [A], mas isso parece incomum neste contexto por [motivo]. Seu objetivo é [B]? Prefere que eu execute [B]?”

# Commits ao fechar ciclo

O usuário não escreve código neste repositório. Materialize o trabalho no git.

Crie um commit a cada ciclo fechado, inclusive no meio da task. Ciclo fechado: um lote que você não pretende reeditar nesta task — por exemplo, um conjunto de testes pronto ou uma fatia de implementação. Vários commits por task são o esperado.

Commite somente quando não houver mais edição prevista nesses arquivos nesta task. Deixe rascunho e WIP fora do git.

Não espere o usuário olhar o diff. Não espere Bugbot nem PR. Não pergunte se pode commitar. Esta seção já é esse pedido.

# Leitura de skills

Ao usar uma skill, leia o `SKILL.md` como ponto de entrada e consulte também os subarquivos relevantes antes de planejar ou executar o trabalho. Explore os índices e as pastas da skill para identificar padrões, exemplos, referências e instruções aplicáveis à tarefa, mesmo quando não houver um link direto no `SKILL.md`. Siga as referências pertinentes entre esses arquivos: ler apenas o `SKILL.md` não basta quando o detalhamento está nos subarquivos. Selecione o conteúdo pelo escopo da tarefa, sem carregar arquivos de assuntos ou plataformas não envolvidos.

# Desenvolvimento

Ao planejar ou implementar funcionalidades, consulte [code-get-coding-designs](.claude/skills/code-get-coding-designs/SKILL.md) e [code-write-code](.claude/skills/code-write-code/SKILL.md). Cada use case deve ter testes automatizados de comportamento; os projetos também devem contemplar testes de integração e E2E conforme suas plataformas e fluxos.

# Contexto e memória do projeto

Antes de planejar ou executar uma tarefa, consulte [code-get-project-context](.claude/skills/code-get-project-context/SKILL.md) para entender o projeto e identificar os apps envolvidos. Leia apenas os documentos e fluxos pertinentes. Se o contexto estiver `empty` ou incompleto, consulte o código para a tarefa atual; o preenchimento e a atualização da documentação acontecem somente quando o usuário invocar [task-update-project-context](.claude/skills/task-update-project-context/SKILL.md).

Antes de planejar ou executar uma tarefa, consulte [o índice de memória](.claude/memory/README.md). Abra os índices das categorias pertinentes e somente os registros relacionados ao trabalho atual.

A memória reúne informações duradouras que não são facilmente deduzidas do código: requisitos de ambiente, regras de negócio, decisões e seus motivos, orientações de trabalho, preferências, lições e vocabulário. Verifique informações que possam ter mudado antes de aplicá-las; uma memória não substitui as instruções atuais do usuário nem a evidência do repositório.
