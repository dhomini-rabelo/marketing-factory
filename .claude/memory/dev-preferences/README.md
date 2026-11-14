# Preferências do desenvolvedor

Instruções genéricas: um padrão por arquivo, ilustrado com nomes. Sem recado de fluxo, task ou episódio.

- [Alias imports no monorepo](./alias-imports-no-monorepo.md) — consultar ao escrever ou revisar imports em pacotes workspace e apps infra; também ao criar barrel público (comentários por pasta, `exports` só `"."`, Bundler + paths) ou ao evitar arquivo-shim que só reexporta outro arquivo do mesmo package.
- [Enum em entidades enterprise](./enum-em-entidades-enterprise.md) — consultar ao declarar status, papéis ou outros campos categóricos em `enterprise/entities/`.
- [Nomes genéricos para classes e funções em adapters](./nomes-genericos-para-classes-e-funcoes-em-adapters.md) — consultar ao nomear tipos, instâncias e métodos de adapters.
- [Testes de use case com factory, some e inputData](./testes-de-use-case-com-factory-some-e-input-data.md) — consultar ao escrever ou revisar testes em `use-cases/{area}/__tests__` para factory vazia, spread de `inputData` e expects sem literal mágico.
- [Prefixo validate em guards](./prefixo-validate-em-guards.md) — consultar ao nomear guards de `DomainError` em use cases e em `application/validation/` (`validate*` vs `require*` de carga).
