# Service Class Structure

Use this pattern for infrastructure classes that implement a port (hasher, token generator, crypto, AI client, and similar). For where these files live, see [backend adapters and services structure](../../../code-get-coding-designs/designs/backend-adapters-and-services-structure.md).

## Receive inputs and collaborators through the constructor

- A service never reads `process.env` or imports the env module itself. Config values (keys, URLs, models) and collaborators (other services, clients) arrive as constructor parameters.
- The composition root (the infra app's deps file) reads the validated config and instantiates the class.
- Constants internal to the class become private members, not module-level state.

```typescript
// Wrong way
export function createHasher(): Hasher {
  const saltRounds = Number(process.env.SALT_ROUNDS ?? 10)
  return { hash: (plain) => bcrypt.hash(plain, saltRounds) /* ... */ }
}

// Correct way
export class BcryptHasher implements Hasher {
  private readonly saltRounds = 10

  async hash(plain: string) {
    return bcrypt.hash(plain, this.saltRounds)
  }
}

// Correct way — composition root
const credentialsCrypto = new AesCredentialsCrypto(config.APP_SECRET)
```

## Keep members private and readonly

- Everything outside the port is `private readonly` (`private` only if reassigned). Never `#field`.
- Group several constructor inputs in one object parameter (more than two parameters rule) and type a collaborator by its port.

```typescript
// Wrong way
export class ExampleAiClient implements AiClient {
  #apiKey: string
  constructor(apiKey: string, model: string, timeoutMs: number) {
    this.#apiKey = apiKey
  }
}

// Correct way
export class ExampleAiClient implements AiClient {
  constructor(private readonly config: { apiKey: string; model: string; timeoutMs: number }) {}
}
```

## Prefer the provider SDK over hand-written HTTP

When a provider ships an SDK, build the adapter on it instead of calling `fetch` and parsing responses by hand, and do not add a generic `HttpClient` port for it. For AI clients, use the Vercel AI SDK (`ai`) with the OpenRouter provider (`@openrouter/ai-sdk-provider`) and a zod schema for structured output. Model and API key come from the constructor. Test the adapter with the SDK mocked. Check the installed `ai` version for the current structured-output API (`generateObject`, or `generateText` with `Output.object` where `generateObject` is deprecated).

```typescript
// Wrong way
const response = await fetch(OPENROUTER_URL, { headers: { Authorization: `Bearer ${apiKey}` } /* ... */ })

// Correct way
export class OpenRouterAiClient implements AiClient {
  private readonly provider: ReturnType<typeof createOpenRouter>

  constructor(private readonly config: { apiKey: string; model: string }) {
    this.provider = createOpenRouter({ apiKey: config.apiKey })
  }

  async generateStructuredOutput<T>(request: { prompt: string; schema: z.ZodType<T> }) {
    const result = await generateObject({
      model: this.provider(this.config.model),
      prompt: request.prompt,
      schema: request.schema,
    })
    return result.object
  }
}
```
