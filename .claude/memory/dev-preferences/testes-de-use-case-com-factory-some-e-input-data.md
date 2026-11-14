# Testes de use case com factory, some e inputData

Em `packages/domain/<module>/src/application/use-cases/{area}/__tests__/*.test.ts` (ver [backend-domain-structure](../../skills/code-get-coding-designs/designs/backend-domain-structure.md)), alinhe dados de teste, execução e asserts para evitar literais mágicos de e-mail ou nome repetidos.

## Factory vazia

Quando o caso de sucesso não depende de campos conhecidos da entidade, crie com defaults da factory:

```typescript
const user = await userFactory.create()
```

O expect usa a entidade retornada ou `user.props` no campo correspondente (`expect(result.user.props.email).toBe(user.props.email)`), não um literal copiado à mão.

## Campos conhecidos: some + inputData + spread

Quando o teste precisa de e-mail, senha ou outros valores explícitos, monte `inputData` com `some` (ou equivalente do pacote de testes) e passe à factory com spread:

```typescript
const inputData = {
  email: some.email(),
  password: some.string(),
  name: some.name(),
}
const user = await userFactory.create({
  ...inputData,
  passwordHash: hasher.hash(inputData.password),
})
```

O use case recebe `inputData` (ou campos derivados). Login com hash conhecido segue esse padrão; register pode chamar `sut.execute(inputData)` direto.

## Variantes de entrada

- Casing de e-mail que **deve** autenticar ou registrar: derive de `inputData.email` em variável descritiva (`emailWithDifferentCasing`), não trate como e-mail inválido.
- Senha incorreta: `wrongPassword` (ou nome equivalente claro), passada ao `execute`, distinta de `inputData.password`.

## Expects

- Asserte contra `inputData` ou a entidade/factory no **mesmo** campo (`result.user.props.email` ↔ `inputData.email` ou `user.props.email`), nunca `user.name` no lugar de e-mail.
- Register normaliza e-mail: se `inputData.email` tem maiúsculas, o expect usa `inputData.email.toLowerCase()` ou um `some.email()` já minúsculo — sem segundo literal `'ada@example.com'` paralelo ao valor de entrada.

Exemplos de cenários (nomes ilustrativos):

- `get-current-user`: `userFactory.create()` e expect em `user.props.email`
- `login-user`: `inputData` + spread na factory; `execute` com `emailWithDifferentCasing` no caso feliz; `wrongPassword` no caso de senha inválida
- `register-user`: `expect(result.user.props.email).toBe(inputData.email.toLowerCase())` e `expect(result.user.props.name).toBe(inputData.name)`
