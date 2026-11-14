# Prefixo `validate` em guards de domínio

Em `packages/domain/*/src/application`, guards cuja falha é `throw new DomainError(...)` usam o prefixo `validate`, tanto em métodos privados do use case (`validateUniqueEmail`) quanto em helpers de `application/validation/` (`validateCanGrantRole`, `validateAdminRole`).

Helpers que **carregam** a entidade ou o membership e a devolvem permanecem `require*` (`requireMembership`, `requireStoredConnection`, `requireSavedQuery`). Não use `assert*` nem `ensure*` para esses guards.

O rename `assert*` → `validate*` em helpers compartilhados não altera o comportamento: grant-role, change-owner, last-owner e remove-member mantêm as regras atuais. A checagem genérica de papel admin é o helper `validateAdminRole`.
