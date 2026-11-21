# Como a Fathom monta as páginas de comparação

As duas páginas lidas, [Fathom vs. Fireflies](https://www.fathom.ai/vs/fireflies) e [Otter vs. Fathom](https://www.fathom.ai/vs/otter), seguem o mesmo molde. O texto é curto para uma página de busca e é escrito do ponto de vista da Fathom, em voz de marca ("nós"), o que explica a taxa alta de primeira pessoa nelas.

## Estrutura repetida
1. **Título e H1 com a promessa de resultado.** O H1 não só nomeia o par: promete algo ("notas de IA mais limpas e um caminho mais rápido até o retorno", "resumos mais limpos e suporte mais forte, sem a edição extra"). O `<title>` acrescenta o ano e dois atributos de comparação.
2. **Prova numérica logo no começo.** Um bloco "Rating" põe a nota da Fathom (5/5, mais de 7 mil avaliações) ao lado da nota do rival (por exemplo, 4,4/5 do Otter), com origem nas avaliações da G2. A página repete o dado em dados estruturados (`Product` com `AggregateRating`), o que a deixa elegível a estrelas no resultado de busca.
3. **Cinco ou seis argumentos em H3, um por diferença.** Os temas se repetem entre as duas páginas: precisão do resumo, saída estruturada para CRM sem limpeza, zero configuração, camada de coaching para times, busca que devolve contexto e não só palavra-chave, adoção rápida pela equipe. Cada argumento tem um parágrafo curto de contraste ("o Otter captura transcrições; a Fathom as interpreta").
4. **Bloco de honestidade "quando o rival é melhor".** A página do Fireflies traz "A Fathom é melhor se..." e "O Fireflies é melhor se...". É uma escolha de conversão: reconhecer o limite do produto dá credibilidade ao resto.
5. **Depoimentos de clientes**, com nome abreviado e selo de usuário verificado da G2, sob o título "Real talk from Fathom customers".
6. **FAQ longo (de 6 a 8 perguntas)** em H3 e em `FAQPage`, com perguntas que repetem a busca do usuário ("Qual é mais preciso, Fathom ou Fireflies?", "A Fathom é mais barata que o Fireflies?"). A página do Fireflies ainda inclui uma pergunta que cita um terceiro concorrente, para pegar a busca de comparação a três.

## Onde pede a conversão
- Um botão "Switch to Fathom" perto do topo, antes de qualquer argumento.
- Um fecho com o título "Don't take it from us..." e o apelo "See what you're missing" (página do Fireflies).
- Poucos links de texto corrido para preço ou cadastro: a conversão está nos botões, não nos parágrafos.

## O que isso sugere para quem faz comparativos
- O molde é de página de produto, não de post: parágrafos de cerca de 15 palavras, muitas imagens (capturas e selos de avaliação) e quase nenhuma lista ou tabela.
- A comparação nomeia só o rival no endereço (`/vs/{rival}`), sem o próprio nome da marca, e usa a mesma pasta para casos que não são um produto (`/vs/built-in`, `/vs/others`), ou seja, uma pasta de comparação também serve a "ferramenta nativa" e a "outras opções".
