# Nomes genéricos para classes e funções em adapters

Ao nomear tipos, instâncias e métodos de adapters, use a capacidade, não o vendor.

Exemplos:

- `AiClient` / `aiClient.generateStructuredOutput`, não `OpenRouterClient.complete`
- `generateStructuredOutput` para JSON validado por schema, com o schema como parâmetro
- `generateText` para output em texto livre
