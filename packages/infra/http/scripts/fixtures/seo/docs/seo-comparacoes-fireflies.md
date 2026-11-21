# Como o Fireflies monta as páginas de comparação

O Fireflies tem dois formatos de página de comparação, e eles cumprem papéis diferentes.

## Páginas de produto na raiz do site

São as páginas `fireflies.ai/fireflies-vs-{concorrente}`, escritas só para o produto contra um rival. As duas lidas (contra Otter e contra Tactiq) seguem o mesmo molde, com o nome do rival trocado:

- **Promessa no H1**: "Why Teams Choose Fireflies.ai Over {rival}", a mesma frase que a meta description repete.
- **Primeiro bloco**: "Fireflies Outperforms {rival} in Every Category", uma afirmação de superioridade sem ressalva.
- **Segundo bloco**: "Don't Take Our Word For It", título que convida o leitor a conferir por conta própria.
- **Conversão**: um único link para o produto no texto (o app), sem links para outras páginas do blog ou de integrações.

O HTML entregue tem pouco texto e muitas imagens, o que indica uma página montada para ser vista e não para ser lida. O `<title>` é o genérico do site, igual ao da home. Para quem faz marketing, o ponto útil é que a página disputa a busca pelo nome do rival e não pelo conteúdo: o molde é o mesmo para todos os concorrentes, e só a lista de rivais muda.

## Posts de blog de comparação

Os comparativos do blog (`/blog/{a}-vs-{b}`) são textos longos, de guia, e não seguem o molde acima. Eles cobrem três tipos de disputa:

- o Fireflies contra um concorrente direto de ata de reunião;
- dois rivais um contra o outro, sem o Fireflies (por exemplo, dois produtos de notas de reunião);
- ferramentas e conceitos que não são concorrentes (plataformas de videoconferência, CRMs, termos de IA), que servem para atrair busca informativa.

Os dois formatos convivem para o mesmo rival: a página da raiz leva à conversão, e o post do blog capta quem pesquisa "X vs Y" querendo entender a diferença antes de decidir.
