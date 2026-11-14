# Dados de um conceito somente no domínio dono

Escopo: produtos iniciados a partir desta factory — entidades em `packages/domain/<module>`.

Os dados de um conceito (campos do objeto, não só o identificador) existem só no domínio dono desse conceito. Entidades de outro domínio referenciam o dono por identidade (`{owner}Id`). Não aninham o objeto do dono nem copiam campos dele (nome, slug, membros ou qualquer outro estado do dono) nas próprias props.

Justificativa: cada conceito tem uma fonte. Copiar o objeto do dono para o consumidor faz os dois módulos evoluírem o mesmo dado e mistura invariantes.

Esta é a regra de produto; a estrutura de módulos e imports está em [Domain ownership](../../skills/code-get-coding-designs/designs/domain-ownership.md). A implementação aparece no produto gerado, nas entidades de cada domínio, não neste repositório de factory.
